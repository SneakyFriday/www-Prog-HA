import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import * as mediaTypes from "https://deno.land/std@0.151.0/media_types/mod.ts";

/**
   * Umgang mit statischen Dateien (z.B. CSS)
   * @param {String} base 
   * @returns {Object}
   */
export async function serveStaticFile(base, ctx) {
  //debug("@serveStaticFile. ctx %O", ctx.request.url);
  
  const url = new URL(ctx.request.url);
  let file;
  // const fullPath = path.join(base, url.pathname);
  // if(fullPath.indexOf(base) !== 0 || fullPath.indexOf('\0') !== -1) {
  //   ctx.response.status = 403;
  //   return ctx;
  // }
  try {console.log("Serve Static");
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
}