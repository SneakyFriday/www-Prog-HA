import * as model from "./model.js";
import { debug as Debug } from "https://deno.land/x/debug/mod.ts";
import * as mediaTypes from "https://deno.land/std/media_types/mod.ts"  ;
import * as path from "https://deno.land/std/path/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:cms-controller");

/**
 * Nutzereingaben validieren
 * @param {*} date
 * @returns
 */
export const isValidDate = (date) => {
  const test = new Date(date);
  return test != "Invalid Date" && date.length >= 10;
};

export const isValidText = (text) => text.length >= 3;

export const isValidImg = (img) => {
  console.log(fileTypeOk(img));
  console.log(fileSizeOk(img.size));
  return fileTypeOk(img) && fileSizeOk(img.size);
}

export const fileTypeOk = (img) =>
{
  const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/tif", "image/gif"];
  return validImageTypes.includes(img.type);
}

export const fileSizeOk = (fileSize) =>
{
  const validSize = 5242880; // 5mb
  return fileSize <= validSize && fileSize != 0;
}

/**
 * Prüft, ob die eingegebenen Daten valide sind und gibt ggf. ein Object mit den spezifischen Error-Messages.
 * TODO: Auf die jeweiligen Eingaben passen
 * @param {Object} data
 * @returns {Object}
 */
export function errorHandler(data) {
  // Errors Objekt erzeugen
  const errorList = {};

  // Checken, ob Daten valide sind, ansonsten in errorList schreiben
  if (!isValidText(data["title"])) {
    errorList.vorname = "Bitte geben Sie einen Vornamen an.";
  }
  if (!isValidDate(data["date"])) {
    errorList.name = "Bitte geben Sie einen Namen an.";
  }
  // if (!isValidPostcode(data["price"])) {
  //   errorList.plz = "Bitte geben Sie eine Postleitzahl an.";
  // }
  if (!isValidText(data["description"])) {
    errorList.stadt = "Bitte geben Sie eine Stadt an.";
  }

  if(!isValidImg(data["img"]))
  {
    errorList.bild = "Bitte geben Sie eine Datei mit weniger als 5mb an.";
  }

  return errorList;
}

export async function moveFile(file){
  const fileName = generateFileName(file);
  const destFile = await Deno.open(
    path.join(Deno.cwd(), "public", "upload", fileName), {
      create: true,
      write: true,
      truncrate: true
    },
  );
  await file.stream().pipeTo(destFile.writable);
  const pathName = "/upload/" + fileName;
  return pathName;
}

function generateFileName(file){
  return crypto.randomUUID() + "." + mediaTypes.extension(file.type);
}

/**
 * Übermittelt Nutzer Vorbestellung und speichert diese in DB
 * @param {Object} ctx
 * @returns {Object}
 */
export async function submitChangeToDB(ctx) {
  debug("@submitChangeToDB. ctx %O", ctx.request.url);

  // Form Data holen
  const formData = await ctx.request.formData();

  // Debug-Ausgabe
  //console.log(formData);

  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    time: formData.get("time"),
    price: formData.get("price"),
    img: formData.get("upload"),
  };

  // Error-Handling
  const errors = errorHandler(data);
  console.log(errors.bild);
  // Daten der DB hinzufügen
  if(errors.bild == undefined)
  {
    data.img = await moveFile(data.img);
  }
  await model.addEvent(ctx.database, data);
  const eventData = await model.getAllEvents(ctx.database);

  // Debug-Ausgabe
  console.log(`Errors: ${Object.values(errors).length}`);
  ctx.response.body = ctx.nunjucks.render("cms_create.html", {
    data: data,
    errors: errors,
    events: eventData,
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";

  return ctx;
}

/**
 * 
 * @param {*} ctx 
 * @returns 
 */
export async function deleteEvent(ctx) {
  debug("@deleteEvent. ctx %O", ctx.request.url);
  //const checkDelete = confirm("Wirklich löschen?");
  const checkDelete = true;
  if(checkDelete){
    // Form Data holen
    const formData = await ctx.request.formData();
  
    // Debug-Ausgabe
    //console.log(formData);
  
    const data = {
      title: formData.get("veranstaltungen"),
    };
  
    // Daten der DB hinzufügen
    await model.deleteEvent(ctx.database, data);
  }
  const eventData = await model.getAllEvents(ctx.database);
  ctx.response.body = ctx.nunjucks.render("cms_delete.html", {
    events: eventData,
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}


/**
 * 
 * @param {*} ctx 
 * @returns 
 */
export async function editEvent(ctx) {
  debug("@editEvent. ctx %O", ctx.request.url);

  // Form Data holen
  const formData = await ctx.request.formData();

  // Debug-Ausgabe
  //console.log(formData);

  const data = {
    title: formData.get("veranstaltungen"),
    description: formData.get("description"),
    date: formData.get("date"),
    time: formData.get("time"),
    price: formData.get("price"),
    img: formData.get("upload"),
  };
  console.log(data);

  // Error-Handling
  const errors = errorHandler(data);

  data.img = await moveFile(data.img);
  // Daten der DB hinzufügen
  await model.updateEvent(ctx.database, data);
  const eventData = await model.getAllEvents(ctx.database);

  ctx.response.body = ctx.nunjucks.render("cms_edit.html", {
    data: data,
    errors: errors,
    events: eventData,
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}
