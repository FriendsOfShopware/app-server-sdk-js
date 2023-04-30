import { AppServer } from "./app.ts";
import { Shop } from "./shop.ts";
import { HttpClient } from "./http-client.ts";

export class ContextResolver {
  constructor(private app: AppServer) {}

  public async fromSource(req: Request): Promise<Context> {
    const webHookContent = await req.text();
    const webHookBody = JSON.parse(webHookContent);

    const shop = await this.app.repository.getShopById(
      webHookBody.source.shopId,
    );

    if (shop === null) {
      throw new Error(`Cannot find shop by id ${webHookBody.source.shopId}`);
    }

    await this.app.signer.verify(
      req.headers.get("shopware-shop-signature") as string,
      webHookContent,
      shop.shopSecret,
    );

    return new Context(shop, webHookBody, new HttpClient(shop));
  }

  public async fromModule(req: Request): Promise<Context> {
    const url = new URL(req.url);

    const shop = await this.app.repository.getShopById(
      url.searchParams.get("shop-id") as string,
    );
    if (shop === null) {
      throw new Error(
        `Cannot find shop by id ${url.searchParams.get("shop-id")}`,
      );
    }

    await this.app.signer.verifyGetRequest(req, shop.shopSecret);

    const paramsObject: Record<string, string> = {};

    url.searchParams.forEach((value, key) => {
      paramsObject[key] = value;
    });

    return new Context(shop, paramsObject, new HttpClient(shop));
  }
}

class Context {
  constructor(
    public shop: Shop,
    public payload: any,
    public httpClient: HttpClient,
  ) {
  }
}
