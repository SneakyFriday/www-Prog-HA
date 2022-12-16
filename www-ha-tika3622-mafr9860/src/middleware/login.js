import * as model from "../model.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts"
import { debug as Debug } from "https://deno.land/x/debug/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:login");


// // PW aus Terminal
// const password = prompt('Password:');

// // Hash erzeugen aus 
// const hash = await bcrypt.hash(password);
// console.log("Hash: " + hash);

// Hash für Passwort: test
// const dbHash = "$2a$10$bJ2OvoglSQCCHGEE2cRFgu2iSRm71b.6w1gFFeNQUoodpPxjYS3ae";
// // PW und Hash aus DB vergleichen
// const ok = await bcrypt.compare(password, dbHash);
// console.log(ok);

export async function authUser(ctx, credentials){
  const hashA = credentials.password;
  const hashB = await model.compareCredentials(ctx.database, credentials.username);
  console.log("HashA: " + hashA);
  console.log("HashB: " + hashB);
  const ok = await bcrypt.compare(hashA, hashB);

  console.log("Test A: " + ok);
  // const testA = "$2a$10$bfcVc.lDJVfbE2YlVM3G3.jhkVEh/dAkKJg9Ic3JjvHgeAt81ybxO";
  // const testB = hashB;
  // const testOk = await bcrypt.compare(testA, testB);
  // console.log("Test B: " + testOk)
}

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
  
    // // Debug-Ausgabe
    // console.log(formData);
  
    const data = {
       username: formData.get("username"),
       password: formData.get("password"),
    };

    // Auth-User
    await authUser(ctx, data);
  
    // Error-Handling
    const errors = errorHandler(data);
  
    // PW mit PW aus der DB vergleichen
    //await model.addTicket(ctx.database, data);
    if(Object.values(errors).length > 0) {
      ctx.response.body = ctx.nunjucks.render("login.html", {
        data: data,
        errors: errors,
      });
    }
    else {
      ctx.response.body = ctx.nunjucks.render("login.html", {
        data: data
      });
      // Redirecting auf die apod Seite mit neuen Daten
      ctx.redirect = Response.redirect('http://localhost:5000/cms', 303);
    }
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }