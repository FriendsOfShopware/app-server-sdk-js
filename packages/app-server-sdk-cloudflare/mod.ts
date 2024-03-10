import { SimpleShop } from "jsr:@friendsofshopware/app-server";
import type {
  ShopInterface,
  ShopRepositoryInterface,
} from "jsr:@friendsofshopware/app-server";

/**
 * Cloudflare integration for Shopware App Server
 * @module
 */

/**
 * Cloudflare KV implementation of the ShopRepositoryInterface
 */
export class CloudflareShopRepository implements ShopRepositoryInterface {
  constructor(private storage: KVNamespace) {
    this.storage = storage;
  }

  createShopStruct(
    shopId: string,
    shopUrl: string,
    shopSecret: string,
  ): ShopInterface {
    return new SimpleShop(shopId, shopUrl, shopSecret);
  }

  async createShop(shop: ShopInterface): Promise<void> {
    await this.storage.put(shop.getShopId(), this.serializeShop(shop));
  }

  async deleteShop(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async getShopById(id: string): Promise<ShopInterface | null> {
    const kvObj = await this.storage.get(id);

    if (kvObj === null) {
      return null;
    }

    return this.deserializeShop(kvObj);
  }

  async updateShop(shop: ShopInterface): Promise<void> {
    return await this.createShop(shop);
  }

  protected serializeShop(shop: ShopInterface): string {
    return JSON.stringify(shop);
  }

  protected deserializeShop(data: string): ShopInterface {
    const obj = JSON.parse(data);

    const shop = new SimpleShop(
      obj.shopId || "",
      obj.shopUrl || "",
      obj.shopSecret || "",
    );

    shop.setShopCredentials(
      obj.clientId || "",
      obj.clientSecret || "",
    );
    return shop;
  }
}

declare interface KVNamespace<Key extends string = string> {
  get(
    key: Key,
    options?: Partial<KVNamespaceGetOptions<undefined>>,
  ): Promise<string | null>;
  put(
    key: Key,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: KVNamespacePutOptions,
  ): Promise<void>;
  delete(key: Key): Promise<void>;
}

declare interface KVNamespaceGetOptions<Type> {
  type: Type;
  cacheTtl?: number;
}

declare interface KVNamespacePutOptions {
  expiration?: number;
  expirationTtl?: number;
  metadata?: any | null;
}
