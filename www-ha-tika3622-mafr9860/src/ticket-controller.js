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

/**
 * Prüft, ob die eingegebenen Daten valide sind und gibt ggf. ein Object mit den spezifischen Error-Messages.
 * TODO: Auf die jeweiligen Eingaben passen
 * @param {Object} data 
 * @returns {Object}
 */
export function errorHandler(data){
  // Errors Objekt erzeugen
  const errorList = { };
  // Checken, ob Daten valide sind, ansonsten in errorList schreiben
  if (!isValidDate(data["date"])) {
    console.log("Date Input invalide");
    errorList.date = "Bitte geben Sie ein Datum an.";
  }
  if (!isValidText(data["title"])) {
    console.log("Title Input invalide");
    errorList.title = "Bitte geben Sie einen Titel an.";
  }
  if (!isValidText(data["textInput"])) {
    console.log("Text Input invalide");
    errorList.text = "Bitte geben Sie einen Text ein.";
  }

  // Debug-Ausgabe
  console.log(`
  Is valid Date: ${isValidDate(data["date"])}
  Is valid Title: ${isValidText(data["title"])}
  Is valid TextInput: ${isValidText(data["textInput"])}
  `);

  return errorList;
}

/**
 * Übermittelt Nutzer Vorbestellung und speichert diese in DB
 * @param {Object} ctx 
 * @returns {Object}
 */
export async function submitPurchase(ctx){
  debug("@submitPurchase. ctx %O", ctx.request.url);

  // Form Data holen
  const formData = await ctx.request.formData();
  const data = {
    date: formData.get("date"),
    title: formData.get("title"),
    textInput: formData.get("text"),
  };
  
  // Debug-Ausgabe
  for (const item of formData) {
    console.log(`${item[0]}: ${item[1]}`);
  }

  // Error-Handling
  const errors = errorHandler(data);

  // Debug-Ausgabe
  console.log(`Errors: ${Object.values(errors).length}`);
    ctx.response.body = ctx.nunjucks.render(/*Template-Seite für Ticket-Bestellung einfügen*/);
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
}
