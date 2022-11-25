import * as model from "./model.js";
import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

// Deno Debug-Tool anstatt "Console.log()"
const debug = Debug("app:controller");

/**
 * TODO: Script noch als Controller implementieren
 * Das hier ist/war nur zum Testen der API
 */

async function fetchAPI(){
    const API_KEY = "DEMO_KEY";
    const fetchedData = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
    const data = await fetchedData.json();
    return data;
}

/**
 * 
 * @param {Object} ctx 
 * @returns {Object}
 */
export async function usefetchedAPI(ctx){
    debug("@usefetchedAPI. ctx %O", ctx.request.url);
    const {url, explanation} = await fetchAPI();

    ctx.response.body = ctx.nunjucks.render("nasa-potd.html", {
        url : url,
        explanation : explanation
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
}