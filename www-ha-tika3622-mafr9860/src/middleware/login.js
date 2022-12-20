import * as model from "../model.js";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"
import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:login");


// // // // PW aus Terminal
// // // const password = prompt('Password:');
// const password = "test";

// // // // Hash erzeugen aus 
// // // const hash = await bcrypt.hash(password);
// // // console.log("Hash: " + hash);

// // Hash für Passwort: test
// const dbHash = "$2a$10$bfcVc.lDJVfbE2YlVM3G3.jhkVEh/dAkKJg9Ic3JjvHgeAt81ybxO";
// // PW und Hash aus DB vergleichen
// const ok = await bcrypt.compare(password, dbHash);
// console.log("Testing Hash: " + ok);

export async function authUser(ctx, credentials){
  const user = {};
  let isAuth = false;
  const hashedPassword = credentials.password;
  const hashPasswordDB = await model.getCredentials(ctx.database, credentials.username);
  if(hashPasswordDB != null) {
    user.username = credentials.username;
    user.password_hash = hashedPassword;
    isAuth = await bcrypt.compare(user.password_hash, hashPasswordDB);
  }
  console.log("Authed: " + isAuth);
  if(isAuth === true) {
    user.password_hash = undefined;
  }
  user.isAuth = isAuth;
  return user;
}

export function errorHandler(data) {
    // Errors Objekt erzeugen
    const errorList = {};
    // Checken, ob Daten valide sind, ansonsten in errorList schreiben
    return errorList;
  }

export function render(ctx) {
    debug("@add. ctx %O", ctx.request.url);
    ctx.response.body = ctx.nunjucks.render("login.html", { });
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
    const data = {
       username: formData.get("username"),
       password: formData.get("password"),
    };
  
    // Error-Handling
    const errors = errorHandler(data);

    // Render Form with Errors
    if(Object.values(errors).length > 0) {
      ctx.response.body = ctx.nunjucks.render("login.html", {
        errors: errors,
      });
      ctx.response.status = 200;
    } else {
      const user = await authUser(ctx, data);
      if(user.isAuth === true) {
        user.password_hash = undefined;
        ctx.session.user = user.username;
        ctx.session.flash = `Du bist als ${user.username} eingeloggt.`;
        ctx.redirect = Response.redirect('http://localhost:5000/cms', 303);
      } else {
        errors.login = 'Diese Kombination aus Benutzername und Passwort ist nicht gültig.'
        ctx.response.body = ctx.nunjucks.render("login.html", {
          errors: errors,
        });
        ctx.response.status = 200;
      }
    }
    
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }