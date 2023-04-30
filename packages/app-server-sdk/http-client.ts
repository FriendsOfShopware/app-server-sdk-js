import { ShopInterface } from "./repository.ts";

export class HttpClient {
  private storage: { expiresIn: Date | null; token: string | null };

  constructor(private shop: ShopInterface) {
    this.storage = {
      token: null,
      expiresIn: null,
    };
  }

  async get(url: string, headers: object = {}): Promise<HttpClientResponse> {
    return await this.request("GET", url, null, headers);
  }

  async post(
    url: string,
    json: object = {},
    headers: any = {},
  ): Promise<HttpClientResponse> {
    headers["content-type"] = "application/json";
    headers["accept"] = "application/json";

    return await this.request("POST", url, JSON.stringify(json), headers);
  }

  async put(
    url: string,
    json: object = {},
    headers: any = {},
  ): Promise<HttpClientResponse> {
    headers["content-type"] = "application/json";
    headers["accept"] = "application/json";

    return await this.request("PUT", url, JSON.stringify(json), headers);
  }

  async patch(
    url: string,
    json: object = {},
    headers: any = {},
  ): Promise<HttpClientResponse> {
    headers["content-type"] = "application/json";
    headers["accept"] = "application/json";

    return await this.request("PATCH", url, JSON.stringify(json), headers);
  }

  async delete(
    url: string,
    json: object = {},
    headers: any = {},
  ): Promise<HttpClientResponse> {
    headers["content-type"] = "application/json";
    headers["accept"] = "application/json";

    return await this.request("DELETE", url, JSON.stringify(json), headers);
  }

  private async request(
    method: string,
    url: string,
    body: string | null = "",
    headers: object = {},
  ): Promise<HttpClientResponse> {
    const fHeaders: any = Object.assign({}, headers);
    fHeaders["Authorization"] = `Bearer ${await this.getToken()}`;

    const f = await globalThis.fetch(
      `${this.shop.getShopUrl()}/api${url}`,
      {
        body,
        headers: fHeaders,
        method,
      },
    );

    // Obtain new token
    if (!f.ok && f.status === 401) {
      this.storage.expiresIn = null;

      return await this.request(method, url, body, headers);
    } else if (!f.ok) {
      throw new ApiClientRequestFailed(
        this.shop.getShopId(),
        new HttpClientResponse(f.status, await f.json(), f.headers),
      );
    }

    if (f.status === 204) {
      return new HttpClientResponse(f.status, {}, f.headers);
    }

    return new HttpClientResponse(f.status, await f.json(), f.headers);
  }

  async getToken(): Promise<string> {
    if (this.storage.expiresIn === null) {
      const auth = await globalThis.fetch(
        `${this.shop.getShopUrl()}/api/oauth/token`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: this.shop.getShopClientId(),
            client_secret: this.shop.getShopClientSecret(),
          }),
        },
      );

      if (!auth.ok) {
        throw new ApiClientAuthenticationFailed(
          this.shop.getShopId(),
          new HttpClientResponse(auth.status, await auth.json(), auth.headers),
        );
      }

      const expireDate = new Date();
      const authBody = await auth.json() as {
        access_token: string;
        expires_in: number;
      };
      this.storage.token = authBody.access_token;
      expireDate.setSeconds(expireDate.getSeconds() + authBody.expires_in);
      this.storage.expiresIn = expireDate;

      return this.storage.token as string;
    }

    if (this.storage.expiresIn.getTime() < (new Date()).getTime()) {
      // Expired

      this.storage.expiresIn = null;

      return await this.getToken();
    }

    return this.storage.token as string;
  }
}

export class HttpClientResponse {
  constructor(
    public statusCode: number,
    public body: any,
    public headers: Headers,
  ) {
  }
}

export class ApiClientAuthenticationFailed extends Error {
  constructor(shopId: string, public response: HttpClientResponse) {
    super(`The api client authentication to shop with id: ${shopId}`);
  }
}

export class ApiClientRequestFailed extends Error {
  constructor(shopId: string, public response: HttpClientResponse) {
    super(
      `The api request failed with status code: ${response.statusCode} for shop with id: ${shopId}`,
    );
  }
}
