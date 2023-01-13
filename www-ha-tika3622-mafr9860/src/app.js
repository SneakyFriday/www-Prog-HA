import nunjucks from "https://deno.land/x/nunjucks@3.2.3/mod.js";
import { debug as Debug } from "https://deno.land/x/debug@0.2.0/debug.ts";
import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import * as mediaTypes from "https://deno.land/std@0.151.0/media_types/mod.ts";

import * as apiController from "./api-controller.js";
import * as controller from "./controller.js";
import * as ticketController from "./ticket-controller.js";
import * as cmsController from "./cms-controller.js";
import * as login from "./middleware/login.js";
import * as logger from "./middleware/logging.js";
import * as cookies from "./middleware/cookies.js";
import * as session from "./middleware/sessions.js";
import * as serveStatic from "./middleware/serveStatic.js";
import { isAuthenticated } from "./middleware/authentification.js";

/**
 * TODO:
 * - Login persistent
 * - Logout / Login Anzeige in HTML je nach Status
 * - CSRF Token in DB speichern und bei jeder Abfrage überprüfen
 * - Bild Upload entfernen. Veranstaltungen mit Bildern als "Featured Veranstaltungen" deklarieren
 * - Veranstaltungsdaten je nach Dropdown Menu Auswahl anzeigen lassen
 * -- Veranstaltungsname - Zeiten als checkbox mit Uhrzeit Text und Value
 *            <input type="checkbox" id="time" name="time" value={data.time}>
              <label for="time">{data.time}</label>
  - Bei Bestellung mit übermitteln und in DB speichern
              
 */



// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:login");

// Definition, wo Nunjucks auf die HTML Seiten zugreifen soll
nunjucks.configure("templates", { autoescape: true, noCache: true });

/**
 * Open database
 * Anlegen des ticketInfos Table, wo die Daten der KäuferInnen gespeichert werden.
 * Anlegen des Veranstaltung-Tables, wo die Daten zur Veranstaltung gespeichert werden.
 */
const db = new DB("data/ticketData.sqlite", { mode: "create" });

// Table für Ticketbestellungen anlegen
db.execute(`
  CREATE TABLE if not exists "ticketInfos" (
    "id"	INTEGER,
    "salutation"	TEXT,
    "vorname"	TEXT NOT NULL,
    "name"	TEXT NOT NULL,
    "strasse"	INTEGER NOT NULL,
    "nr"	INTEGER,
    "plz"	TEXT NOT NULL,
    "stadt"	TEXT NOT NULL,
    "mail"	TEXT NOT NULL,
    "veranstaltungsID"	INTEGER NOT NULL,
    "newsletter"	BLOB,
    FOREIGN KEY("veranstaltungsID") REFERENCES "veranstaltungen"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
  );
`);
// Table für Veranstaltungen anlegen
db.execute(`
  CREATE TABLE if not exists "veranstaltungen" (
    "id"	INTEGER,
    "name"	TEXT NOT NULL,
    "datum"	TEXT NOT NULL,
    "preis"	TEXT NOT NULL,
    "beschreibung"	TEXT NOT NULL DEFAULT 'Beschreibung',
    "uhrzeit"	TEXT NOT NULL DEFAULT '0:00',
    "bild" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
  );
`);

// Table für Login-Daten anlegen
db.execute(`
  CREATE TABLE if not exists "userLoginData" (
    "username"	TEXT NOT NULL,
    "password"	TEXT NOT NULL,
    PRIMARY KEY("username")
  );
`);

// Table für Nutzer Kommentare
db.execute(`
  CREATE TABLE if not exists "userComments" (
    "id"	INTEGER NOT NULL,
    "username"	TEXT NOT NULL,
    "comment"	TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
  );
`);

// Table für Nutzer Sessions
db.execute(`
CREATE TABLE if not exists "userSession" (
	"username"	TEXT,
	"sessionId"	INTEGER
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
    /* session: {
      user: {},
      flash: '',
    }, */
    params: {},
    response: {
      body: undefined,
      status: undefined,
      headers: {},
    },
  };

  // Anpassen je nach URL-Call
  const router = await createRouter();
  router.get("/", controller.index);
  router.get("/about", controller.about);
  router.get("/kolophon", controller.kolophon);
  router.get("/module", controller.module);
  router.get("/_farben", controller.farben);
  router.get("/zeitleiste", controller.zeitleiste);
  router.get("/dsgvo", controller.dsgvo);
  router.get("/impressum", controller.impressum);
  router.get("/veranstaltungsreihe", controller.veranstaltungsreihe);
  router.get("/fun_facts", controller.fun_facts);
  router.get("/meteorschauer", controller.fun_facts);
  router.get("/nasa_missionen", controller.nasa_missionen);

  router.get("/dokumentation", controller.dokumentation);
  router.get("/dokumentation/www", controller.dokumentation_www);
  router.get("/dokumentation/fd", controller.dokumentation_fd);

  router.get("/login", login.render);
  router.post("/login", login.checkLoginCredentials);

  router.get("/cms", controller.cms);
  router.get("/cms_create", controller.cms_create);
  router.get("/cms_edit", controller.cms_edit);
  router.get("/cms_delete", controller.cms_delete);
  router.post("/cms_create", cmsController.submitChangeToDB);
  router.post("/cms_edit", cmsController.editEvent);
  router.post("/cms_delete", cmsController.deleteEvent);

  router.get("/apod", apiController.usefetchedAPI);
  router.post("/apod", isAuthenticated, apiController.sendComment);

  router.get("/tickets", ticketController.add);
  router.post("/tickets", ticketController.submitPurchase);

  /**
   * Umgang mit statischen Dateien (z.B. CSS)
   * @param {String} base 
   * @returns {Object}
   */
  const serveStaticFile = (base) => async (ctx) => {
    debug("@serveStaticFile. ctx %O", ctx.request.url);
    const url = new URL(ctx.request.url);
    let file;
    // const fullPath = path.join(base, url.pathname);
    // if(fullPath.indexOf(base) !== 0 || fullPath.indexOf('\0') !== -1) {
    //   ctx.response.status = 403;
    //   return ctx;
    // }
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
  //ctx = logger.start(ctx);
  ctx = cookies.getCookies(ctx);
  ctx = session.getSession(ctx);
  //ctx = await serveStatic.serveStaticFile('../public', ctx);
  ctx = await serveStaticFile('./public')(ctx);
  ctx = session.setSession(ctx);
  ctx = cookies.setCookies(ctx);
  //ctx = logger.end(ctx);

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
    return ctx;
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