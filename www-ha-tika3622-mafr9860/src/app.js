import nunjucks from "https://deno.land/x/nunjucks@3.2.3/mod.js";
import { debug } from "https://deno.land/x/debug@0.2.0/debug.ts";

import * as controller from "./controller.js";
import * as ticketController from "./ticket-controller.js";

nunjucks.configure("templates", { autoescape: true, noCache: true });

/**
 * Verarbeitet Requests mithilfe des ctx Objekts
 * @param {Promise} request 
 * @returns {Response}
 */
export const handleRequest = async (request) => {
    const ctx = {
      data: notes,
      databank: db,
      nunjucks: nunjucks,
      request: request,
      params: {},
      response: {
        body: undefined,
        status: undefined,
        headers: {},
      },
    };
  
    // Anpassen je nach URL-Call
    const router = await createRouter();
    router.get("/", controller.index);
    router.get("/about", controller.about);
    router.get("/form", ticketController.add);
    router.post("/form", ticketController.submitAdd);
  
    // let, da result u.U. beim 404 verändert wird
    let result = await router.routes(ctx);
  
    // Handle redirect
    if (ctx.redirect) {
      return ctx.redirect;
    }
  
    // Fallback
    result.response.status = result.response.status ?? 404;
    if (!result.response.body && result.response.status == 404) {
      result = await controller.error404(result);
    }
    return new Response(result.response.body, {
      status: result.response.status,
      headers: result.response.headers,
    });
  };

/**
 * Routing
 * @returns {Object}
 */
const createRouter = () => {
    const _routes = [];
    const getParams = (route, url) => {
      const match = route.pattern.exec(url);
      return match.pathname.groups;
    };
  
    const routeMatcher = (request) => (route) =>
      request.method.toUpperCase() == route.method &&
      route.pattern.test(request.url);
  
    const routes = (ctx) => {
      const route = _routes.find(routeMatcher(ctx.request));
      if (route) {
        ctx.params = getParams(route, ctx.request.url);
        return route.controller(ctx);
      }
    };
  
    return {
      get(path, controller) {
        _routes.push({
          method: "GET",
          pattern: new URLPattern({ pathname: path }),
          controller,
        });
      },
      post(path, controller) {
        _routes.push({
          method: "POST",
          pattern: new URLPattern({ pathname: path }),
          controller,
        });
      },
      routes,
      info() {
        console.log("%0", _routes);
      },
    };
  };