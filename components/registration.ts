import { App } from "../app";
import { HTTP_OK, JsonResponse, Request, Response } from "../server";
import { Shop } from "../shop";
import { randomString } from "../util";

export class Registration {
    constructor(private app: App) { }

    public async authorize(req: Request): Promise<Response> {
        if (
            req.query['shop-url'] === undefined ||
            req.headers['shopware-app-signature'] === undefined ||
            req.query['shop-id'] === undefined ||
            req.query['timestamp'] === undefined
            ) {
            throw new Error('Invalid Request');
        }

        const v = await this.app.signer.verify(req.headers['shopware-app-signature'], `shop-id=${req.query['shop-id']}&shop-url=${req.query['shop-url']}&timestamp=${req.query['timestamp']}`, this.app.cfg.appSecret);
        if (!v) {
            throw new Error('Cannot validate app signature');
        }

        const shop = new Shop(req.query['shop-id'], req.query['shop-url'], randomString());

        await this.app.repository.createShop(shop);

        return new JsonResponse(HTTP_OK, {
            proof: await this.app.signer.sign(shop.id + shop.shopUrl + this.app.cfg.appName, this.app.cfg.appSecret),
            secret: shop.shopSecret,
            confirmation_url: this.app.cfg.authorizeCallbackUrl
        })
    }

    public async authorizeCallback(req: Request): Promise<Response> {
        const body = JSON.parse(req.body);

        if (typeof body.shopId !== 'string' || typeof body.apiKey !== 'string' || typeof body.secretKey !== 'string' || typeof req.headers['shopware-app-signature'] !== 'string') {
            throw new Error('Invalid Request');
        }

        const v = await this.app.signer.verify(req.headers['shopware-app-signature'], req.body, this.app.cfg.appSecret);
        if (!v) {
            throw new Error('Cannot validate app signature');
        }

        const shop = await this.app.repository.getShopById(body.shopId as string);

        if (shop === null) {
            throw new Error(`Cannot find shop for this id: ${body.shopId}`);
        }

        shop.clientId = body.apiKey;
        shop.clientSecret = body.secretKey;

        await this.app.repository.updateShop(shop);

        return new JsonResponse(HTTP_OK, {success: true});
    }
}