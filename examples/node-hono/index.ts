import { InMemoryShopRepository } from "@friendsofshopware/app-server";
import { configureAppServer } from "@friendsofshopware/app-server/framework/hono";
import { Hono } from "hono";
import type {
  AppServer,
  Context,
  ShopInterface,
} from "@friendsofshopware/app-server";
import { createNotificationResponse } from "@friendsofshopware/app-server/helper/app-actions";

import { serve } from '@hono/node-server';

declare module "hono" {
  interface ContextVariableMap {
    app: AppServer;
    shop: ShopInterface;
    context: Context;
  }
}

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

    return createNotificationResponse('success', 'Product created')
});

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`)
})
