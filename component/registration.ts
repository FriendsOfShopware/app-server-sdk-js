import { App } from "../app";
import { HTTP_OK, JsonResponse, Request, Response } from "../server";
import { Shop } from "../shop";
import { randomString } from "../util";

export class Registration {
    constructor(private app: App) { }

    public async authorize(req: Request): Promise<Response> {
        if (
            !req.query.has('shop-url') ||
            !req.headers.has('shopware-app-signature') ||
            !req.query.has('shop-id') ||
            !req.query.has('timestamp')
            ) {
            throw new Error('Invalid Request');
        }

        const v = await this.app.signer.verify(
            req.headers.get('shopware-app-signature') as string,
            `shop-id=${req.query.get('shop-id')}&shop-url=${req.query.get('shop-url')}&timestamp=${req.query.get('timestamp')}`,
            this.app.cfg.appSecret
        );

        if (!v) {
            throw new Error('Cannot validate app signature');
        }

        const shop = new Shop(req.query.get('shop-id') as string, req.query.get('shop-url') as string, randomString());

        await this.app.repository.createShop(shop);

        return new JsonResponse(HTTP_OK, {
            proof: await this.app.signer.sign(shop.id + shop.shopUrl + this.app.cfg.appName, this.app.cfg.appSecret),
            secret: shop.shopSecret,
            confirmation_url: this.app.cfg.authorizeCallbackUrl
        })
    }

    public async authorizeCallback(req: Request): Promise<Response> {
        const body = JSON.parse(req.body);

        if (typeof body.shopId !== 'string' || typeof body.apiKey !== 'string' || typeof body.secretKey !== 'string' || !req.headers.has('shopware-shop-signature')) {
            throw new Error('Invalid Request');
        }

        const shop = await this.app.repository.getShopById(body.shopId as string);

        if (shop === null) {
            throw new Error(`Cannot find shop for this id: ${body.shopId}`);
        }

        const v = await this.app.signer.verify(req.headers.get('shopware-shop-signature') as string, req.body, shop.shopSecret);
        if (!v) {
            throw new Error('Cannot validate app signature');
        }

        shop.clientId = body.apiKey;
        shop.clientSecret = body.secretKey;

        await this.app.repository.updateShop(shop);

        return new JsonResponse(HTTP_OK, {success: true});
    }
}