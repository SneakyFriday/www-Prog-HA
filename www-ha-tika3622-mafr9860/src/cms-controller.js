import * as model from "./model.js";
import { debug as Debug } from "https://deno.land/x/debug/mod.ts";

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

  return errorList;
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
  };

  // Error-Handling
  const errors = errorHandler(data);

  // Daten der DB hinzufügen
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
  };

  // Error-Handling
  const errors = errorHandler(data);

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
