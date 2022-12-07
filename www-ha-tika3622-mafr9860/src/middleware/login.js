import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts"
import { debug as Debug } from "https://deno.land/x/debug/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:login");


// // PW aus Terminal
// const password = prompt('Password:');

// // Hash erzeugen aus 
// const hash = await bcrypt.hash(password);
// console.log("Hash: " + hash);

// const dbHash = "$2a$10$bJ2OvoglSQCCHGEE2cRFgu2iSRm71b.6w1gFFeNQUoodpPxjYS3ae";
// // PW und Hash aus DB vergleichen
// const ok = await bcrypt.compare(password, dbHash);
// console.log(ok);

export function errorHandler(data) {
    // Errors Objekt erzeugen
    const errorList = {};
    // Checken, ob Daten valide sind, ansonsten in errorList schreiben
    return errorList;
  }

export function render(ctx) {
    debug("@add. ctx %O", ctx.request.url);
    ctx.response.body = ctx.nunjucks.render("login.html", {});
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }

/**
 * Holt sich Username und Password
 * @param {Object} ctx
 * @returns {Object}
 */
 export async function checkLoginCredentials(ctx) {
    debug("@checkLoginCredentials. ctx %O", ctx.request.url);
  
    // Form Data holen
    const formData = await ctx.request.formData();
  
    // Debug-Ausgabe
    console.log(formData);
  
    const data = {
       username: formData.get("username"),
       password: formData.get("password"),
    };
  
    // Error-Handling
    const errors = errorHandler(data);
  
    // PW mit PW aus der DB vergleichen
    //await model.addTicket(ctx.database, data);
  
    ctx.response.body = ctx.nunjucks.render("login.html", {
      data: data,
      errors: errors,
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }