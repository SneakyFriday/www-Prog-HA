import { CookieMap, mergeHeaders } from "https://deno.land/std@0.167.0/http/mod.ts";

export function setCookies(ctx){
    // Cookie Werte setzen
    ctx.cookies.set();
    // Einbinden der Cookies im Header
    const allHeaders = mergeHeaders(ctx.response.headers, ctx.cookies);
    ctx.response.headers['set-cookie'] = allHeaders.get('set-cookie');
    return ctx;
}

export function getCookies(ctx){
    ctx.cookies = new CookieMap(ctx.request);
    return ctx;
}