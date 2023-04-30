import { AppServer } from "./app.ts";
import { Shop } from "./shop.ts";

export class Registration {
  constructor(private app: AppServer) {}

  public async authorize(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (
      !url.searchParams.has("shop-url") ||
      !req.headers.has("shopware-app-signature") ||
      !url.searchParams.has("shop-id") ||
      !url.searchParams.has("timestamp")
    ) {
      throw new Error("Invalid Request");
    }

    const v = await this.app.signer.verify(
      req.headers.get("shopware-app-signature") as string,
      `shop-id=${url.searchParams.get("shop-id")}&shop-url=${
        url.searchParams.get("shop-url")
      }&timestamp=${url.searchParams.get("timestamp")}`,
      this.app.cfg.appSecret,
    );

    if (!v) {
      throw new Error("Cannot validate app signature");
    }

    const shop = new Shop(
      url.searchParams.get("shop-id") as string,
      url.searchParams.get("shop-url") as string,
      randomString(),
    );

    await this.app.repository.createShop(shop);

    return new Response(
      JSON.stringify({
        proof: await this.app.signer.sign(
          shop.id + shop.shopUrl + this.app.cfg.appName,
          this.app.cfg.appSecret,
        ),
        secret: shop.shopSecret,
        confirmation_url: this.app.cfg.authorizeCallbackUrl,
      }),
      {
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }

  public async authorizeCallback(
    req: Request,
    sucessHandler?: (shop: Shop) => Promise<void>,
  ): Promise<Response> {
    const bodyContent = await req.text();
    const body = JSON.parse(bodyContent);

    if (
      typeof body.shopId !== "string" || typeof body.apiKey !== "string" ||
      typeof body.secretKey !== "string" ||
      !req.headers.has("shopware-shop-signature")
    ) {
      throw new Error("Invalid Request");
    }

    const shop = await this.app.repository.getShopById(body.shopId as string);

    if (shop === null) {
      throw new Error(`Cannot find shop for this id: ${body.shopId}`);
    }

    const v = await this.app.signer.verify(
      req.headers.get("shopware-shop-signature") as string,
      bodyContent,
      shop.shopSecret,
    );
    if (!v) {
      // Shop has failed the verify. Delete it from our DB
      await this.app.repository.deleteShop(shop);

      throw new Error("Cannot validate app signature");
    }

    shop.clientId = body.apiKey;
    shop.clientSecret = body.secretKey;

    if (sucessHandler) {
      await sucessHandler(shop);
    }

    await this.app.repository.updateShop(shop);

    return new Response(null, { status: 204 });
  }
}

export function randomString() {
  const f = () => Math.random().toString(36).substring(2);

  return f() + f();
}
