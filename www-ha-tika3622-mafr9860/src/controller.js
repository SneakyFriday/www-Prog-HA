import * as model from "./model.js";
import { debug as Debug } from "https://deno.land/x/debug/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:controller");

/**
 * TODO: Für alle Seiten Templates in /templates erstellen
 */

/**
 * Controller des Templates für die Startseite
 * @param {Object} ctx 
 * @returns {Object}
 */
export async function index(ctx) {
    await debug("@index. ctx %O", ctx.request.url);
    ctx.response.body = ctx.nunjucks.render("index.html", { /**INPUT */ });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }

/**
 * Controller des Templates für die Veranstaltungsreihe
 * @param {Object} ctx 
 * @returns {Object}
 */
export async function veranstaltungsreihe(ctx){
    await debug("@veranstaltungsreihe. ctx %O", ctx.request.url);
    ctx.response.body = ctx.nunjucks.render("veranstaltungsreihe.html", { /**INPUT*/ });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
}

/**
 * Controller des Templates für die About-Seite
 * @param {Object} ctx 
 * @returns {Object}
 */
  export function about(ctx) {
    debug("@about. ctx %O", ctx.request.url);
    ctx.response.body = ctx.nunjucks.render("about.html", {});
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }

/**
 * Controller des Templates für die 404-Error-Seite
 * @param {Object} ctx 
 * @returns {Object}
 */
export function error404(ctx) {
    debug("@error404. ctx %O", ctx.request.url);
    ctx.response.body = ctx.nunjucks.render("error404.html", {});
    ctx.response.status = 404;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }