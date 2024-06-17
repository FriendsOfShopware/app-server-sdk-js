import { SimpleShop } from "../repository.ts";
import type {
  ShopInterface,
  ShopRepositoryInterface,
} from "../repository.ts";

/**
 * Deno KV integration
 * @module
 */


/**
* DenoKVRepository is a ShopRepositoryInterface implementation that uses the Deno KV storage to save the shop data
*/
export class DenoKVRepository implements ShopRepositoryInterface {
  constructor(private namespace = "shops") {}

  createShopStruct(
    shopId: string,
    shopUrl: string,
    shopSecret: string,
  ): ShopInterface {
    return new SimpleShop(shopId, shopUrl, shopSecret);
  }

  async createShop(shop: ShopInterface): Promise<void> {
    // @ts-ignore
    const kv = await Deno.openKv();

    await kv.set([this.namespace, shop.getShopId()], shop);
  }

  async getShopById(id: string): Promise<ShopInterface | null> {
    // @ts-ignore
    const kv = await Deno.openKv();

    const result = await kv.get([this.namespace, id]);

    if (result.key === null) {
      return null;
    }

    const data = result.value as {
      shopId: string;
      shopUrl: string;
      shopSecret: string;
      shopClientId: string | null;
      shopClientSecret: string | null;
    };

    const shop = new SimpleShop(data.shopId, data.shopUrl, data.shopSecret);

    if (data.shopClientId && data.shopClientSecret) {
      shop.setShopCredentials(data.shopClientId, data.shopClientSecret);
    }

    return shop;
  }

  async updateShop(shop: ShopInterface): Promise<void> {
    await this.createShop(shop);
  }

  async deleteShop(id: string): Promise<void> {
    // @ts-ignore
    const kv = await Deno.openKv();

    await kv.delete([this.namespace, id]);
  }
}
