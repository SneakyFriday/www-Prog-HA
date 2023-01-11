import * as model from "../model.js";

/**
 * Authentifizierung des Users durch Abgleich 
 * der Session ID mit ID in Datenbank.
 * @param {Object} ctx 
 * @returns {Object}
 */
export const isAuthenticated = async (ctx) => {
    const user = await model.getUserById(ctx.database, ctx.sessionId);
    ctx.state.user = user;
    if(!ctx.state.user) {
        ctx.status = 403;
        return ctx;
    }
    ctx.state.authenticated = true;
    return ctx;
}