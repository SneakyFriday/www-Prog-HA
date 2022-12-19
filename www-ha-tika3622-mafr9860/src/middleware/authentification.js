
/**
 * 
 * @param {Object} ctx 
 * @returns {Object}
 */
export const isAuthenticated = async (ctx) => {
    if(!ctx.state.user) {
        ctx.status = 403;
        return ctx;
    }
    ctx.state.authenticated = true;
    return ctx;
}