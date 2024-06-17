import { AppServer } from "../app";
import type { Context } from "../context-resolver.ts";
import type { ShopInterface, ShopRepositoryInterface } from "../repository";

interface MiddlewareConfig {
  appName: string;
  appSecret: string;
  appUrl?: string | null;
  registrationUrl?: string | null;
  registerConfirmationUrl?: string | null;
  appPath?: string | null;
  shopRepository:
    | ShopRepositoryInterface
    | ((c: HonoContext<DataTypes>) => ShopRepositoryInterface);
}

interface DataTypes {
  app: AppServer;
  context: Context;
  shop: ShopInterface;
}

interface HonoContext<DataTypes> {
  req: {
    path: string;
    method: string;
    url: string
    raw: Request;
  }
  header: (key: string, value: string) => void;
  res: Response;
  get<K extends keyof DataTypes>(key: K): DataTypes[K];
  set<K extends keyof DataTypes>(key: K, value: DataTypes[K]): void;
}

interface Hono {
  use: (path: string, handler: (ctx: HonoContext<DataTypes>, next: () => Promise<void>) => void) => void;
  get: (path: string, handler: (ctx: HonoContext<DataTypes>, next: () => void) => void) => void;
  post: (path: string, handler: (ctx: HonoContext<DataTypes>, next: () => void) => void) => void;
}

let app: AppServer | null = null;

export function configureAppServer(
  honoExternal: unknown,
  cfg: MiddlewareConfig,
) {

  const hono = honoExternal as Hono;

  cfg.registrationUrl = cfg.registrationUrl || "/app/register";
  cfg.registerConfirmationUrl = cfg.registerConfirmationUrl ||
    "/app/register/confirm";
  cfg.appPath = cfg.appPath || "/app/*";

  hono.use("*", async (ctx, next) => {
    if (app === null) {
      const appUrl = cfg.appUrl || buildBaseUrl(ctx.req.url);

      if (typeof cfg.shopRepository === "function") {
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
    if (
      ctx.req.path === cfg.registrationUrl ||
      ctx.req.path === cfg.registerConfirmationUrl
    ) {
      await next();
      return;
    }

    let context;
    try {
      context = ctx.req.method === "GET"
        ? await app.contextResolver.fromModule(ctx.req.raw)
        : await app.contextResolver.fromSource(ctx.req.raw);
    } catch (_e) {
      return jsonResponse({ message: "Invalid request" }, 400);
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
      return jsonResponse({ message: "Invalid request" }, 400);
    }
  });

  hono.post(cfg.registerConfirmationUrl, async (ctx) => {
    const app = ctx.get("app");

    try {
      return await app.registration.authorizeCallback(ctx.req.raw);
    } catch (_e) {
      return jsonResponse({ message: "Invalid request" }, 400);
    }
  });
}

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function buildBaseUrl(url: string): string {
  const u = new URL(url);

  return `${u.protocol}//${u.host}`;
}
