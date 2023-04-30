import { SimpleShop } from "https://deno.land/x/shopware_app_server_sdk/mod.ts";
import type { ShopInterface, ShopRepositoryInterface } from "https://deno.land/x/shopware_app_server_sdk/mod.ts";

export class CloudflareShopRepository implements ShopRepositoryInterface {
    private storage: KVNamespace;

    constructor(storage: KVNamespace) {
        this.storage = storage;
    }

    createShopStruct(shopId: string, shopUrl: string, shopSecret: string): ShopInterface {
        return new SimpleShop(shopId, shopUrl, shopSecret);
    }

    async createShop(shop: ShopInterface) {
        await this.storage.put(shop.getShopId(), JSON.stringify(shop));
    }

    async deleteShop(id: string) {
        await this.storage.delete(id);
    }

    async getShopById(id: string) {
        const kvObj = await this.storage.get(id);

        if (kvObj === null) {
            return null;
        }

        const obj = JSON.parse(kvObj);

        const shop =  new SimpleShop(
            obj.id || '',
            obj.shopUrl || '',
            obj.shopSecret || ''
        )

        shop.setShopCredentials(
            obj.clientId || '',
            obj.clientSecret || ''
        );

        return shop;
    }

    async updateShop(shop: ShopInterface) {
        return await this.createShop(shop);
    }
}