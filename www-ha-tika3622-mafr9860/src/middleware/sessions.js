import { CookieMap } from "https://deno.land/std@0.167.0/http/cookie_map.ts";
import { contextOrFrameLookup } from "https://deno.land/x/nunjucks@3.2.3/src/runtime.js";
import { encode as base64Encode } from "https://deno.land/std@0.167.0/encoding/base64.ts";

// Session Konstanten
const SESSION_KEY = 'testKey';
const MAX_AGE = 60 * 60 * 1000;

export const createSessionStore = () => {
    const sessionStore = new Map();
    return {
        get(key) {
            const data = sessionStore.get(key);
            if(!data) { return }
            // prüft, ob die Lebensdauer der Sessions abgelaufen ist
            return data.maxAge < Date.now() ? this.destroy(key) : data.session;
        },
        set(key, session, maxAge) {
            // setzt eine neue Session mit max Alter
            sessionStore.set(key, {
                session, maxAge: Date.now() + maxAge
            });
        },
        destroy(key){
            sessionStore.delete(key);
        }
    }
}

/**
 * Liefert 64 zufällig Bytes Base-64 kodiert
 * @returns {Number}
 */
export const createId = () => {
    const array = new Uint32Array(64);
    crypto.getRandomValues(array);
    return base64Encode(array);
}

/**
 * Session laden
 * @param {Object} ctx 
 * @returns 
 */
export function getSession(ctx) {
    
    ctx.sessionStore = createSessionStore();
    // Session Cookie holen
    ctx.cookies = new CookieMap(ctx.request);
    // Session laden
    ctx.sessionId = ctx.cookies.get(SESSION_KEY);
    ctx.session = ctx.sessionStore.get(ctx.sessionId, MAX_AGE) ?? {};

    return ctx;
}

export function setSession(ctx) {
    if(Object.values(ctx.session).length == 0){
        ctx.sessionStore.destroy(ctx.sessionId);
        ctx.cookies.delete(SESSION_KEY);
    } else {
        ctx.sessionId = ctx.sessionId ?? createId();
        ctx.sessionStore.set(ctx.sessionId, ctx.session, MAX_AGE);
        const maxAge = new Date(Date.now() + MAX_AGE);
        ctx.cookies.set(SESSION_KEY, ctx.sessionId,
            {
                expires: maxAge,
                httpOnly: true,
                overwrite: true,
            });
    }
    return ctx;
}
