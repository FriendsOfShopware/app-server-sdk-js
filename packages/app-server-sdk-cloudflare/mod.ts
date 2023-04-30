import {ShopRepository} from "../../repository";
import {Shop} from "../../shop";

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
            obj.customFields || {},
        )
    }

    async updateShop(shop: Shop) {
        return await this.createShop(shop);
    }
}