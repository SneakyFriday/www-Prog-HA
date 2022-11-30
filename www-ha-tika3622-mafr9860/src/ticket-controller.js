import * as model from "./model.js";
import { debug as Debug } from "https://deno.land/x/debug/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:ticketController");

/** TODO: Daten aus Form abrufen und in DB abspeichern */

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

export const isValidPostcode = (postcode) => postcode.length == 5;

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
  if (!isValidText(data["vorname"])) {
    errorList.vorname = "Bitte geben Sie einen Vornamen an.";
  }
  if (!isValidText(data["name"])) {
    errorList.name = "Bitte geben Sie einen Namen an.";
  }
  if (!isValidPostcode(data["postcode"])) {
    errorList.plz = "Bitte geben Sie eine Postleitzahl an.";
  }
  if (!isValidText(data["city"])) {
    errorList.stadt = "Bitte geben Sie eine Stadt an.";
  }
  if (!isValidText(data["mail"])) {
    errorList.mail = "Bitte geben Sie eine E-Mail Adresse an.";
  }

  return errorList;
}

export function add(ctx) {
  debug("@add. ctx %O", ctx.request.url);
  ctx.response.body = ctx.nunjucks.render("tickets.html", {});
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

/**
 * Übermittelt Nutzer Vorbestellung und speichert diese in DB
 * @param {Object} ctx
 * @returns {Object}
 */
export async function submitPurchase(ctx) {
  debug("@submitPurchase. ctx %O", ctx.request.url);

  // Form Data holen
  const formData = await ctx.request.formData();

  // Debug-Ausgabe
  //console.log(formData);

  const data = {
    vorname: formData.get("vorname"),
    name: formData.get("name"),
    street: formData.get("street"),
    postcode: formData.get("postcode"),
    city: formData.get("city"),
    mail: formData.get("mail"),
    veranstaltungen: formData.get("veranstaltungen"),
  };

  // Error-Handling
  const errors = errorHandler(data);

  // Daten der DB hinzufügen
  await model.addTicket(ctx.database, data);

  // Debug-Ausgabe
  console.log(`Errors: ${Object.values(errors).length}`);
  ctx.response.body = ctx.nunjucks.render("tickets.html", {
    data: data,
    errors: errors,
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}
