import { Shop } from "./shop";

export interface ShopRepository {
    createShop(shop: Shop): Promise<void>;

    getShopById(id: string): Promise<Shop|null>;

    updateShop(shop: Shop): Promise<void>;

    deleteShop(shop: Shop): Promise<void>;
}

export class InMemoryShopRepository implements ShopRepository {
    private storage: Map<string, Shop>

    constructor() {
        this.storage = new Map<string, Shop>();
    }

    async createShop(shop: Shop) {
        this.storage.set(shop.id, shop);
    }

    async getShopById(id: string) {
        if (this.storage.has(id)) {
            return this.storage.get(id) as Shop;
        }

        return null;
    }

    async updateShop(shop: Shop) {
        await this.createShop(shop);
    }

    async deleteShop(shop: Shop) {
        this.storage.delete(shop.id);
    }
}