import { serve } from "https://deno.land/std@0.155.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v3.1.8/mod.ts"
import { configureAppServer } from "https://deno.land/x/shopware_app_server_sdk_hono/mod.ts";
import { AppServer, Context, ShopInterface, DenoKVRepository } from "https://deno.land/x/shopware_app_server_sdk@0.0.36/mod.ts";

type Variables = {
    app: AppServer;
    shop: ShopInterface;
    context: Context;
}

const app = new Hono<{ Variables: Variables }>()

configureAppServer(app, {
    appName: "Test",
    appSecret: "Test",
    shopRepository: new DenoKVRepository(),
});

app.post('/app/product', (ctx) => {
    return new Response(JSON.stringify({
        actionType: "notification",
        payload: {
            status: "success",
            message: "Product created",
        }
    }));
});

serve(app.fetch)