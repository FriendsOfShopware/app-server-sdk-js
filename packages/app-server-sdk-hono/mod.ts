import { HTTPException } from "https://deno.land/x/hono@v3.12.11/http-exception.ts";
import type {
  Context as HonoContext,
  Hono,
} from "https://deno.land/x/hono@v3.12.11/mod.ts";
import {
  AppServer,
  Context,
  ShopInterface,
  ShopRepositoryInterface,
} from "https://deno.land/x/shopware_app_server_sdk@0.0.40/mod.ts";

interface MiddlewareConfig {
  appName: string;
  appSecret: string;
  appUrl?: string | null;
  registrationUrl?: string | null;
  registerConfirmationUrl?: string | null;
  appPath?: string | null;
  shopRepository:
    | ShopRepositoryInterface
    | ((c: HonoContext) => ShopRepositoryInterface);
}

declare module 'hono' {
  interface ContextVariableMap {
    app: AppServer;
    shop: ShopInterface;
    context: Context;
  }
}

let app: AppServer | null = null;

export function configureAppServer(
  hono: Hono,
  cfg: MiddlewareConfig,
) {
  cfg.registrationUrl = cfg.registrationUrl || "/app/register";
  cfg.registerConfirmationUrl = cfg.registerConfirmationUrl ||
    "/app/register/confirm";
  cfg.appPath = cfg.appPath || "/app/*";

  hono.use('*', async (ctx, next) => {
    if (app === null) {
      const appUrl = cfg.appUrl || buildBaseUrl(ctx.req.url);

      if (typeof cfg.shopRepository === "function") {
        // @ts-ignore
        cfg.shopRepository = cfg.shopRepository(ctx);
      }

      app = new AppServer(
        {
          appName: cfg.appName,
          appSecret: cfg.appSecret,
          authorizeCallbackUrl: appUrl + cfg.registerConfirmationUrl,
        },
        cfg.shopRepository,
      );
    }

    ctx.set("app", app);

    await next();
  });

  hono.use(cfg.appPath, async (ctx, next) => {
    const app = ctx.get("app") as AppServer;

    // Don't validate signature for registration
    if (ctx.req.path === cfg.registrationUrl || ctx.req.path === cfg.registerConfirmationUrl) {
      await next();
      return;
    }

    let context;
    try {
      context = ctx.req.method === "GET"
        ? await app.contextResolver.fromModule(ctx.req.raw)
        : await app.contextResolver.fromSource(ctx.req.raw);
    } catch (_e) {
      throw new HTTPException(401, {
        message: "Unauthorized",
      });
    }

    ctx.set("shop", context.shop);
    ctx.set("context", context);

    await next();

    const cloned = ctx.res.clone();

    await ctx.get("app").signer.signResponse(
      cloned,
      ctx.get("shop").getShopSecret(),
    );

    ctx.header(
      "shopware-app-signature",
      cloned.headers.get("shopware-app-signature") as string,
    );
  });

  hono.get(cfg.registrationUrl, async (ctx) => {
    const app = ctx.get("app");

    try {
      return await app.registration.authorize(ctx.req.raw);
    } catch (_e) {
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  });

  hono.post(cfg.registerConfirmationUrl, async (ctx) => {
    const app = ctx.get("app");

    try {
      return await app.registration.authorizeCallback(ctx.req.raw);
    } catch (_e) {
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  });
}

function buildBaseUrl(url: string): string {
  const u = new URL(url);

  return `${u.protocol}//${u.host}`;
}
