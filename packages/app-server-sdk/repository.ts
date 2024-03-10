/**
* ShopInterface defines the object that given back from the ShopRepository, it should methods to get the shop data and set them
*/
export interface ShopInterface {
  getShopId(): string;
  getShopUrl(): string;
  getShopSecret(): string;
  getShopClientId(): string | null;
  getShopClientSecret(): string | null;
  setShopCredentials(clientId: string, clientSecret: string): void;
}

/**
* ShopRepositoryInterface is the storage interface for the shops, you should implement this to save the shop data to your database
* For testing cases the InMemoryShopRepository can be used
*/
export interface ShopRepositoryInterface {
  createShopStruct(shopId: string, shopUrl: string, shopSecret: string): ShopInterface;

  createShop(shop: ShopInterface): Promise<void>;

  getShopById(id: string): Promise<ShopInterface | null>;

  updateShop(shop: ShopInterface): Promise<void>;

  deleteShop(id: string): Promise<void>;
}

/**
* SimpleShop is a simple implementation of the ShopInterface, it stores the shop data in memory
*/
export class SimpleShop implements ShopInterface {
  private shopId: string;
  private shopUrl: string;
  private shopSecret: string;
  private shopClientId: string | null;
  private shopClientSecret: string | null;

  constructor(shopId: string, shopUrl: string, shopSecret: string) {
    this.shopId = shopId;
    this.shopUrl = shopUrl;
    this.shopSecret = shopSecret;
    this.shopClientId = null;
    this.shopClientSecret = null;
  }

  getShopId(): string {
    return this.shopId;
  }
  getShopUrl(): string {
    return this.shopUrl;
  }
  getShopSecret(): string {
    return this.shopSecret;
  }
  getShopClientId(): string | null {
    return this.shopClientId;
  }
  getShopClientSecret(): string | null {
    return this.shopClientSecret;
  }
  setShopCredentials(clientId: string, clientSecret: string): void {
    this.shopClientId = clientId;
    this.shopClientSecret = clientSecret;
  }
}

export class InMemoryShopRepository implements ShopRepositoryInterface {
  private storage: Map<string, ShopInterface>;

  constructor() {
    this.storage = new Map<string, ShopInterface>();
  }

  createShopStruct(shopId: string, shopUrl: string, shopSecret: string): ShopInterface {
    return new SimpleShop(shopId, shopUrl, shopSecret);
  }

  async createShop(shop: ShopInterface) {
    this.storage.set(shop.getShopId(), shop);
  }

  async getShopById(id: string): Promise<ShopInterface|null> {
    if (this.storage.has(id)) {
      return this.storage.get(id) as ShopInterface;
    }

    return null;
  }

  async updateShop(shop: ShopInterface) {
    await this.createShop(shop);
  }

  async deleteShop(id: string) {
    this.storage.delete(id);
  }
}
