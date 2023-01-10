import * as model from "./model.js";
import { debug as Debug } from "https://deno.land/x/debug/mod.ts";
import * as csrf from "./middleware/handleCSRF.js";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:ticketController");

/** TODO: 
 * - SubmitPurchase bei Errors mit neuem CSRF Token rendern */

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

/**
 * TODO: Fügt die Veranstaltungen in Dropdown mit jeweiligen Datum
 * @param {Object} ctx 
 * @returns 
 */
export function add(ctx) {
  debug("@add. ctx %O", ctx.request.url);

  // CSRF Handling
  const token = csrf.generateToken();
  //ctx.session.token = token;
  ctx.response.body = ctx.nunjucks.render("tickets.html", {
    csrf: token,
  });
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
  console.log(formData);

  const data = {
    salutation: formData.get("salutation"),
    vorname: formData.get("vorname"),
    name: formData.get("name"),
    street: formData.get("street"),
    nr: formData.get("number"),
    postcode: formData.get("postcode"),
    city: formData.get("city"),
    mail: formData.get("mail"),
    veranstaltungen: formData.get("veranstaltungen"),
    newsletter: formData.get("newsletter"),
  };

  // Error-Handling
  const errors = errorHandler(data);

  // Daten der DB hinzufügen
  await model.addTicket(ctx.database, data);

  // Debug-Ausgabe
  console.log(`Errors: ${Object.values(errors).length}`);

  // Check CSRF Token
  if(ctx.session.csrf !== form._csrf) {
    ctx.throw(403);
  }
  ctx.session.csrf = undefined;
  ctx.response.body = ctx.nunjucks.render("tickets.html", {
    data: data,
    errors: errors,
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}
