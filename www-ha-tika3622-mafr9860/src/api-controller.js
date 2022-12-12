import * as model from "./model.js";
import * as commentary from "./middleware/commentary-controller.js";
import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:controller");

/** Bezieht das APOD der NASA durch API Key
 * @returns {Object}
 */
async function fetchAPI() {
  const API_KEY = "DEMO_KEY";
  const fetchedData = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`,
  );
  const data = await fetchedData.json();
  return data;
}

/**
 * Rendert APOD Seite und übergibt
 * Bild URL
 * Bild-Erklärung (org. engl.)
 * @param {Object} ctx
 * @returns {Object}
 */
export async function usefetchedAPI(ctx) {
  debug("@usefetchedAPI. ctx %O", ctx.request.url);
  const { url, explanation } = await fetchAPI();

  // Holt Kommentare aus DB
  const data = await model.getAllComments(ctx.database);

  console.log(data);

  ctx.response.body = ctx.nunjucks.render("nasa-potd.html", {
    url: url,
    explanation: explanation,
    comments: data,
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

/** 
 * Commentary Handling 
 * */

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
  if (!isValidText(data["comment"])) {
    errorList.commentText = "Bitte geben Sie einen längeren Text an.";
  }

  return errorList;
}

/**
 * 
 * @param {*} ctx 
 * @returns 
 */
export async function sendComment(ctx){
  debug("@sendCommentary. ctx %O", ctx.request.url);

  // Form Data holen
  const formData = await ctx.request.formData();

  // Debug-Ausgabe
  console.log(formData);

  const data = {
    username: formData.get("comment_author"),
    comment: formData.get("comment"),
  };

  // Error-Handling
  const errors = errorHandler(data);

  // Daten der DB hinzufügen
  await model.addComment(ctx.database, data);

  // Debug-Ausgabe
  console.log(`Errors: ${Object.values(errors).length}`);
  ctx.response.body = ctx.nunjucks.render("nasa-potd.html", {
    data: data,
    errors: errors,
  });
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}
