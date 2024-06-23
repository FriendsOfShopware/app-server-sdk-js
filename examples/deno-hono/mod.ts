import { DenoKVRepository } from "@friendsofshopware/app-server/service/deno";
import { configureAppServer } from "@friendsofshopware/app-server/framework/hono";
import { Hono } from "hono";
import type {
  AppServer,
  Context,
  ShopInterface,
} from "@friendsofshopware/app-server";
import { createNotificationResponse } from "@friendsofshopware/app-server/helper/app-actions";

const app = new Hono();

declare module "hono" {
  interface ContextVariableMap {
    app: AppServer;
    shop: ShopInterface;
    context: Context;
  }
}

app.post('/app/action-button/product', async ctx => {
  console.log(`Got request from Shop ${ctx.get('shop').getShopId()}`)
  return createNotificationResponse('success', 'YEAA');
});

configureAppServer(app, {
  appName: 'SwagTest',
  appSecret: 'SwagTest',
  shopRepository: new DenoKVRepository(),
})

export default app;
