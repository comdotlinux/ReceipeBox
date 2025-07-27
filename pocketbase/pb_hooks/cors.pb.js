// CORS configuration for PocketBase
onBeforeServe((e) => {
    e.router.pre((c) => {
        // Set CORS headers
        c.response().header().set("Access-Control-Allow-Origin", "https://recipe-box.dev-tech.me")
        c.response().header().set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH")
        c.response().header().set("Access-Control-Allow-Headers", "Content-Type,Authorization")
        c.response().header().set("Access-Control-Allow-Credentials", "true")
        
        // Handle preflight requests
        if (c.request().method() === "OPTIONS") {
            return c.noContent(204)
        }
        
        return next(c)
    })
})