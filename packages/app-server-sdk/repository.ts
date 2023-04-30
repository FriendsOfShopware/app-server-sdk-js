export interface IShop {
  getShopId(): string;
  getShopUrl(): string;
  getShopSecret(): string;
  getShopClientId(): string | null;
  getShopClientSecret(): string | null;
  setShopCredentials(clientId: string, clientSecret: string): void;
}

export interface IShopRepository {
  createShopStruct(shopId: string, shopUrl: string, shopSecret: string): IShop;

  createShop(shop: IShop): Promise<void>;

  getShopById(id: string): Promise<IShop | null>;

  updateShop(shop: IShop): Promise<void>;

  deleteShop(id: string): Promise<void>;
}

export class SimpleShop implements IShop {
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

export class InMemoryShopRepository implements IShopRepository {
  private storage: Map<string, IShop>;

  constructor() {
    this.storage = new Map<string, IShop>();
  }

  createShopStruct(shopId: string, shopUrl: string, shopSecret: string): IShop {
    return new SimpleShop(shopId, shopUrl, shopSecret);
  }

  async createShop(shop: IShop) {
    this.storage.set(shop.getShopId(), shop);
  }

  async getShopById(id: string) {
    if (this.storage.has(id)) {
      return this.storage.get(id) as IShop;
    }

    return null;
  }

  async updateShop(shop: IShop) {
    await this.createShop(shop);
  }

  async deleteShop(id: string) {
    this.storage.delete(id);
  }
}
