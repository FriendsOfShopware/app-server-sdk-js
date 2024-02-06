import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { InMemoryShopRepository } from '@friendsofshopware/app-server-sdk';
import { configureAppServer } from '@friendsofshopware/app-server-sdk-hono';

const app = new Hono()

configureAppServer(app, {
    appName: "Test",
    appSecret: "Test",
    shopRepository: new InMemoryShopRepository(),
});

app.post('/app/product', async (ctx) => {
    const shop = ctx.get('shop');
    console.log(shop.getShopUrl());

    const client = ctx.get('context');
    console.log(await client.httpClient.get('/_info/version'));

    return new Response(JSON.stringify({
        actionType: "notification",
        payload: {
            status: "success",
            message: "Product created",
        }
    }));
});

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`)
})
