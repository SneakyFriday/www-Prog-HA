import * as model from "./model.js";
import { debug as Debug } from "https://deno.land/x/debug/mod.ts";
import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import * as mediaTypes from "https://deno.land/std@0.151.0/media_types/mod.ts";

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
export function index(ctx) {
  debug("@index. ctx %O", ctx.request.url);
  ctx.response.body = ctx.nunjucks.render("index.html");
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

/**
 * Controller des Templates für die Veranstaltungsreihe
 * @param {Object} ctx
 * @returns {Object}
 */
export function veranstaltungsreihe(ctx) {
  debug("@veranstaltungsreihe. ctx %O", ctx.request.url);
  ctx.response.body = ctx.nunjucks.render("veranstaltungsreihe.html");
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
  ctx.response.body = ctx.nunjucks.render("about.html");
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

/**
 * @param {Object} ctx
 * @returns {Object}
 */
export function dsgvo(ctx) {
  ctx.response.body = ctx.nunjucks.render("dsgvo.html");
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

/**
 * @param {Object} ctx
 * @returns {Object}
 */
export function impressum(ctx) {
  ctx.response.body = ctx.nunjucks.render("impressum.html");
  ctx.response.status = 200;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

/**
 * @param {Object} ctx
 * @returns {Object}
 */
export function cms(ctx) {
  ctx.response.body = ctx.nunjucks.render("cms.html");
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
  ctx.response.body = ctx.nunjucks.render("error404.html");
  ctx.response.status = 404;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}
