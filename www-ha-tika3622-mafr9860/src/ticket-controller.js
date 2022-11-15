import * as model from "./model.js";
import { debug as Debug } from "https://deno.land/x/debug/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:ticketController");

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
 * Übermittelt Nutzer Vorbestellung und speichert diese in DB
 * @param {Object} ctx 
 * @returns {Object}
 */
export async function submitPurchase(ctx){
    // Formdaten holen. Siehe form-controller.js


    ctx.response.body = ctx.nunjucks.render(/**Template-Seite*/);
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
}
