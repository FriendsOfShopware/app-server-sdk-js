import {ShopRepository} from "../../repository";
import {Shop} from "../../shop";
import {Request as AppRequest, Response as AppResponse} from "../../server";

export class CloudflareShopRepository implements ShopRepository {
    private storage: KVNamespace;

    constructor(storage: KVNamespace) {
        this.storage = storage;
    }

    async createShop(shop: Shop) {
        await this.storage.put(shop.id, JSON.stringify(shop));
    }

    async deleteShop(shop: Shop) {
        await this.storage.delete(shop.id);
    }

    async getShopById(id: string) {
        const kvObj = await this.storage.get(id);

        if (kvObj === null) {
            return null;
        }

        const obj = JSON.parse(kvObj);

        return new Shop(
            obj.id || '',
            obj.shopUrl || '',
            obj.shopSecret || '',
            obj.clientId || '',
            obj.clientSecret || '',
        )
    }

    async updateShop(shop: Shop) {
        return await this.createShop(shop);
    }
}

export async function convertRequest(request: Request): Promise<AppRequest> {
    const { searchParams } = new URL(request.url);
    const queries: any = {};
    const headers: any = {};

    searchParams.forEach((val: string, key: string) => {
        queries[key] = val;
    });

    request.headers.forEach((val, key) => {
        headers[key] = val;
    });

    let body = '';

    try {
        body = await request.text();
    } catch (e) {}

    return {
        query: queries,
        method: request.method,
        headers: headers,
        body: body
    }
}

export async function convertResponse(response: AppResponse): Promise<Response> {
    const headers: any = {};

    response.headers.forEach((val, key) => {
        headers[key] = val;
    });

    return new Response(response.body, {
        status: response.statusCode,
        headers: headers
    })
}