import { SimpleShop } from "https://deno.land/x/shopware_app_server_sdk/mod.ts";
import type { ShopInterface, ShopRepositoryInterface } from "https://deno.land/x/shopware_app_server_sdk/mod.ts";

export class CloudflareShopRepository implements ShopRepositoryInterface {
    // dnt-shim-ignore
    constructor(private storage: KVNamespace) {
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

declare interface KVNamespace<Key extends string = string> {
    get(
      key: Key,
      options?: Partial<KVNamespaceGetOptions<undefined>>
    ): Promise<string | null>;
    get(key: Key, type: "text"): Promise<string | null>;
    get<ExpectedValue = unknown>(
      key: Key,
      type: "json"
    ): Promise<ExpectedValue | null>;
    get(key: Key, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
    get(key: Key, type: "stream"): Promise<ReadableStream | null>;
    get(
      key: Key,
      options?: KVNamespaceGetOptions<"text">
    ): Promise<string | null>;
    get<ExpectedValue = unknown>(
      key: Key,
      options?: KVNamespaceGetOptions<"json">
    ): Promise<ExpectedValue | null>;
    get(
      key: Key,
      options?: KVNamespaceGetOptions<"arrayBuffer">
    ): Promise<ArrayBuffer | null>;
    get(
      key: Key,
      options?: KVNamespaceGetOptions<"stream">
    ): Promise<ReadableStream | null>;
    put(
      key: Key,
      value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
      options?: KVNamespacePutOptions
    ): Promise<void>;
    getWithMetadata<Metadata = unknown>(
      key: Key,
      options?: Partial<KVNamespaceGetOptions<undefined>>
    ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
    getWithMetadata<Metadata = unknown>(
      key: Key,
      type: "text"
    ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
    getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(
      key: Key,
      type: "json"
    ): Promise<KVNamespaceGetWithMetadataResult<ExpectedValue, Metadata>>;
    getWithMetadata<Metadata = unknown>(
      key: Key,
      type: "arrayBuffer"
    ): Promise<KVNamespaceGetWithMetadataResult<ArrayBuffer, Metadata>>;
    getWithMetadata<Metadata = unknown>(
      key: Key,
      type: "stream"
    ): Promise<KVNamespaceGetWithMetadataResult<ReadableStream, Metadata>>;
    getWithMetadata<Metadata = unknown>(
      key: Key,
      options: KVNamespaceGetOptions<"text">
    ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
    getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(
      key: Key,
      options: KVNamespaceGetOptions<"json">
    ): Promise<KVNamespaceGetWithMetadataResult<ExpectedValue, Metadata>>;
    getWithMetadata<Metadata = unknown>(
      key: Key,
      options: KVNamespaceGetOptions<"arrayBuffer">
    ): Promise<KVNamespaceGetWithMetadataResult<ArrayBuffer, Metadata>>;
    getWithMetadata<Metadata = unknown>(
      key: Key,
      options: KVNamespaceGetOptions<"stream">
    ): Promise<KVNamespaceGetWithMetadataResult<ReadableStream, Metadata>>;
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
  declare interface KVNamespaceGetWithMetadataResult<Value, Metadata> {
    value: Value | null;
    metadata: Metadata | null;
  }