
/**
 * Setzt Logging Startzeit in ctx
 * @param {Object} ctx 
 * @returns {Object}
 */
export function start(ctx) {
    const url = new URL(ctx.request.url);
    // Start logging
    console.log(`>>> ${ctx.request.method} ${url.pathname}${url.search}`);
    // Start timing
    ctx.start = Date.now();
    return ctx;
}


/**
 * Errechnet Differenz zwischen Logging Start und aktueller Zeit
 * @param {Object} ctx
 * @returns {Object}
 */
export function end(ctx) {
    const url = new URL(ctx.request.url);
    if(ctx.start){
        const ms = Date.now() - ctx.start;
        ctx.response.headers["X-Response-Time"] = `${ms}ms`;
    }
    // Logging
    const rt = ctx.response.headers["X-Response-Time"] ?? "no timing";
    console.log(`${ctx.response.status} ${ctx.request.method} ${url.pathname} ${url.search} - ${rt}`);
    return ctx;
}