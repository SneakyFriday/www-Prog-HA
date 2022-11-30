import nunjucks from "https://deno.land/x/nunjucks@3.2.3/mod.js";
import { debug } from "https://deno.land/x/debug@0.2.0/debug.ts";
import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import * as mediaTypes from "https://deno.land/std@0.151.0/media_types/mod.ts";

import * as apiController from "./api-controller.js";
import * as controller from "./controller.js";
import * as ticketController from "./ticket-controller.js";
import * as cmsController from "./cms-controller.js";

// Definition, wo Nunjucks auf die HTML Seiten zugreifen soll
nunjucks.configure("templates", { autoescape: true, noCache: true });

/** Fragen:
 * Was soll konkret mit Backend umgesetzt werden?
 * Muss das CSS in das Template oder kann dies wie bisher verknüpft werden? -> Als staitisch Datei
 * Können alle Doku Dateien zum Frontend gelöscht werden?
 * Sollen zur Prüfung jedes mal dummy Daten erzeugt werden oder wie übermitteln wir die DB-Daten nach der Abgabe der HA?
 *
 * Backend Bewertung:
 * kryptografischer Hashwert in der Datenbank? -> Vorlesung
 * Login? -> Vorlesung
 * ›prepared Statements‹ mit Platzhaltern für DB? -> Sind Platzhalterdaten in DB
 * administrative Routen? Rechte im Router prüfen? -> Vorlesung
 * Cookies? -> Vorlesung
 *
 * Wie viele "weitere Funktionen" sind nötig für den Punkt "Backend Erweiterungen"?
 * -> Jede Erweiterung wird besser bewertet
 */

/**
 * Open database
 * Anlegen des ticketInfos Table, wo die Daten der KäuferInnen gespeichert werden.
 * Anlegen des Veranstaltung-Tables, wo die Daten zur Veranstaltung gespeichert werden.
 */
const db = new DB("data/ticketData.sqlite", { mode: "create" });

db.execute(`
  CREATE TABLE if not exists "ticketInfos" (
    "id"	INTEGER,
    "vorname"	TEXT NOT NULL,
    "name"	TEXT NOT NULL,
    "strasse"	INTEGER NOT NULL,
    "plz"	TEXT NOT NULL,
    "stadt"	TEXT NOT NULL,
    "mail"	TEXT NOT NULL,
    "veranstaltungsID"	INTEGER NOT NULL,
    FOREIGN KEY("veranstaltungsID") REFERENCES "veranstaltungen"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
  );
`);
db.execute(`
  CREATE TABLE if not exists "veranstaltungen" (
    "id"	INTEGER,
    "name"	TEXT NOT NULL,
    "datum"	TEXT NOT NULL,
    "preis"	TEXT NOT NULL,
    "beschreibung"	TEXT NOT NULL DEFAULT 'Beschreibung',
    "uhrzeit"	TEXT NOT NULL DEFAULT '0:00',
    PRIMARY KEY("id" AUTOINCREMENT)
  );
`);

/**
 * Verarbeitet Requests mithilfe des ctx Objekts
 * @param {Promise} request
 * @returns {Response}
 */
export const handleRequest = async (request) => {
  let ctx = {
    data: {},
    database: db,
    nunjucks: nunjucks,
    request: request,
    params: {},
    response: {
      body: undefined,
      status: undefined,
      headers: {},
    },
  };

  // Anpassen je nach URL-Call
  // TODO: Controller noch erstellen und je nach URL hinzufügen
  const router = await createRouter();
  router.get("/", controller.index);
  router.get("/about", controller.about);
  router.get("/cms", cmsController.add);
  router.post("/cms", cmsController.submitChangeToDB);
  router.get("/dsgvo", controller.dsgvo);
  router.get("/impressum", controller.impressum);
  router.get("/veranstaltungsreihe", controller.veranstaltungsreihe);
  router.get("/apod", apiController.usefetchedAPI);
  router.get("/tickets", ticketController.add);
  router.post("/tickets", ticketController.submitPurchase);

  // ctx = logger.start(ctx);
  // ctx = xresponsetime.start(ctx);
  // ctx = getCookies(ctx);
  // ctx = getSession(ctx);
  ctx = await serveStaticFile("./public")(ctx);
  // ctx = setSession(ctx);
  // ctx = setCookie(ctx);
  // ctx = xresponsetime.end(ctx);
  // let result = logger.end(ctx);
  // let, da result u.U. beim 404 verändert wird
  let result = await router.routes(ctx);

  // Handle redirect
  if (ctx.redirect) {
    return ctx.redirect;
  }

  // Fallback falls URL nicht erreichbar
  result.response.status = result.response.status ?? 404;
  if (!result.response.body && result.response.status == 404) {
    result = await controller.error404(result);
  }
  return new Response(result.response.body, {
    status: result.response.status,
    headers: result.response.headers,
  });
};

/**
 * Routing
 * @returns {Object}
 */
const createRouter = () => {
  const _routes = [];
  const getParams = (route, url) => {
    const match = route.pattern.exec(url);
    return match.pathname.groups;
  };

  const routeMatcher = (request) => (route) =>
    request.method.toUpperCase() == route.method &&
    route.pattern.test(request.url);

  const routes = (ctx) => {
    const route = _routes.find(routeMatcher(ctx.request));
    if (route) {
      ctx.params = getParams(route, ctx.request.url);
      return route.controller(ctx);
    }
    return ctx
  };

  return {
    get(path, controller) {
      _routes.push({
        method: "GET",
        pattern: new URLPattern({ pathname: path }),
        controller,
      });
    },
    post(path, controller) {
      _routes.push({
        method: "POST",
        pattern: new URLPattern({ pathname: path }),
        controller,
      });
    },
    routes,
    info() {
      console.log("%0", _routes);
    },
  };
};

const serveStaticFile = (base) => async (ctx) => {
  const url = new URL(ctx.request.url);
  let file;
  try {
    file = await Deno.open(path.join(base, url.pathname), { read: true });
  } catch (_error) {
    return (ctx);
  }
  const { ext } = path.parse(url.pathname);
  const contentType = mediaTypes.contentType(ext);
  if (contentType) {
    ctx.response.body = file.readable; // Use readable stream 
    ctx.response.headers["Content-type"] = contentType;
    ctx.response.status = 200;
  } else {
    Deno.close(file.rid);
  }
  return (ctx);
};
