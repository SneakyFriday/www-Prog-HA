import { CookieMap, mergeHeaders } from "https://deno.land/std@0.167.0/http/mod.ts";
import { path } from "https://deno.land/x/nunjucks@3.2.3/src/deps.js";

export function setCookies(ctx){
    // Cookie Werte setzen
    ctx.cookies.set("Cookies", "setCookiesUltra");
    // Einbinden der Cookies im Header
    const allHeaders = mergeHeaders(ctx.response.headers, ctx.cookies);
    ctx.response.headers['set-cookie'] = allHeaders.get('set-cookie');
    return ctx;
}

export function getCookies(ctx){
    ctx.cookies = new CookieMap(ctx.request);
    return ctx;
}