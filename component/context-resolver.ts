import {App} from "../app";
import {Shop} from  '../shop';
import {Request as AppRequest} from '../server';
import {HttpClient} from "./http-client";

export class ContextResolver {
    constructor(private app: App) {}

    public async fromSource(req: AppRequest): Promise<Context> {
        const webHookBody = JSON.parse(req.body);

        const shop = await this.app.repository.getShopById(webHookBody.source.shopId);

        if (shop === null) {
            throw new Error(`Cannot find shop by id ${webHookBody.source.shopId}`);
        }

        await this.app.signer.verifyPostRequest(req, shop.shopSecret);

        return new Context(shop, webHookBody, new HttpClient(shop));
    }

    public async fromModule(req: AppRequest): Promise<Context> {
        const shop = await this.app.repository.getShopById(req.query.get('shop-id') as string);
        if (shop === null) {
            throw new Error(`Cannot find shop by id ${req.query.get('shop-id')}`);
        }

        await this.app.signer.verifyGetRequest(req, shop.shopSecret);

        return new Context(shop, req.query, new HttpClient(shop));
    }
}

class Context {
    constructor(public shop: Shop, public payload: any, public httpClient: HttpClient) {
    }
}