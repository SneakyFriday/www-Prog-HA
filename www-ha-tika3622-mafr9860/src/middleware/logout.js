export async function logout(ctx) {
    ctx.session.user = undefined;
    ctx.session.flash = `Du hast dich erfolgreich ausgeloggt.`;
    //ctx.response.headers['location'] = ctx.url.origi + '/';
    ctx.redirect = Response.redirect('http://localhost:5000/logout', 302);
    //ctx.response.status = 302;
    return ctx;
}