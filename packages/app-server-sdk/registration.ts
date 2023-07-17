import { AppServer } from "./app.ts";

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
      return new InvalidRequestResponse('Invalid Request');
    }

    const v = await this.app.signer.verify(
      req.headers.get("shopware-app-signature") as string,
      `shop-id=${url.searchParams.get("shop-id")}&shop-url=${
        url.searchParams.get("shop-url")
      }&timestamp=${url.searchParams.get("timestamp")}`,
      this.app.cfg.appSecret,
    );

    if (!v) {
      return new InvalidRequestResponse('Cannot validate app signature');
    }

    const shop = this.app.repository.createShopStruct(
      url.searchParams.get("shop-id") as string,
      url.searchParams.get("shop-url") as string,
      randomString(),
    );

    await this.app.repository.createShop(shop);

    return new Response(
      JSON.stringify({
        proof: await this.app.signer.sign(
          shop.getShopId() + shop.getShopUrl() + this.app.cfg.appName,
          this.app.cfg.appSecret,
        ),
        secret: shop.getShopSecret(),
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
    req: Request
  ): Promise<Response> {
    const bodyContent = await req.text();
    const body = JSON.parse(bodyContent);

    if (
      typeof body.shopId !== "string" || typeof body.apiKey !== "string" ||
      typeof body.secretKey !== "string" ||
      !req.headers.has("shopware-shop-signature")
    ) {
      return new InvalidRequestResponse('Invalid Request');
    }

    const shop = await this.app.repository.getShopById(body.shopId as string);

    if (shop === null) {
      return new InvalidRequestResponse('Invalid shop given');
    }

    const v = await this.app.signer.verify(
      req.headers.get("shopware-shop-signature") as string,
      bodyContent,
      shop.getShopSecret(),
    );
    if (!v) {
      // Shop has failed the verify. Delete it from our DB
      await this.app.repository.deleteShop(shop.getShopId());

      return new InvalidRequestResponse('Cannot validate app signature');
    }

    shop.setShopCredentials(body.apiKey, body.secretKey);

    await this.app.repository.updateShop(shop);

    return new Response(null, { status: 204 });
  }
}

export function randomString(length = 120) {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

class InvalidRequestResponse extends Response {
  constructor(message: string, status = 401) {
    super(JSON.stringify({ message }), {
      status,
      headers: {
        "content-type": "application/json",
      },
    })
  }
}
