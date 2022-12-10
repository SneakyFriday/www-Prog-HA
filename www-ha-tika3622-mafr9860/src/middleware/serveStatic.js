/**
 * TODO: Muss noch richtig an app.js abgebunden werden
 */

/**
   * Umgang mit statischen Dateien (z.B. CSS)
   * @param {String} base 
   * @returns {Object}
   */
 export const serveStaticFile = (base) => async (ctx) => {
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
      ctx.response.body = file.readable;
      ctx.response.headers["Content-type"] = contentType;
      ctx.response.status = 200;
    } else {
      Deno.close(file.rid);
    }
    return (ctx);
  };