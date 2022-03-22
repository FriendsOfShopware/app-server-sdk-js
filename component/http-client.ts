import {Shop} from "../shop";
import {ApiClientAuthenticationFailed, ApiClientRequestFailed} from "../errors/ApiClient";

export class HttpClient {
    private storage: { expiresIn: Date|null; token: string|null };

    constructor(private shop: Shop) {
        this.storage = {
            token: null,
            expiresIn: null
        }
    }

    async get(url: string, headers: object = {}): Promise<HttpResponse> {
        return await this.request('GET', url, '', headers);
    }

    async post(url: string, json: object = {}, headers: any = {}): Promise<HttpResponse> {
        headers['content-type'] = 'application/json';
        headers['accept'] = 'application/json';

        return await this.request('POST', url, JSON.stringify(json), headers);
    }

    async put(url: string, json: object = {}, headers: any = {}): Promise<HttpResponse> {
        headers['content-type'] = 'application/json';
        headers['accept'] = 'application/json';

        return await this.request('PUT', url, JSON.stringify(json), headers);
    }

    async patch(url: string, json: object = {}, headers: any = {}): Promise<HttpResponse> {
        headers['content-type'] = 'application/json';
        headers['accept'] = 'application/json';

        return await this.request('PATCH', url, JSON.stringify(json), headers);
    }

    async delete(url: string, json: object = {}, headers: any = {}): Promise<HttpResponse> {
        headers['content-type'] = 'application/json';
        headers['accept'] = 'application/json';

        return await this.request('DELETE', url, JSON.stringify(json), headers);
    }

    private async request(method: string, url: string, body: string = '', headers: object = {}): Promise<HttpResponse> {
        const fHeaders: any = Object.assign({}, headers);
        fHeaders['Authorization'] = `Bearer ${await this.getToken()}`;

        const f = await globalThis.fetch(
            `${this.shop.shopUrl}/api${url}`,
            {
                body,
                headers: fHeaders,
                method
            }
        )

        // Obtain new token
        if (!f.ok && f.status === 401) {
            this.storage.expiresIn = null;

            return await this.request(method, url, body, headers);
        } else if(!f.ok) {
            throw new ApiClientRequestFailed(this.shop.id, new HttpResponse(f.status, await f.json(), f.headers))
        }
        
        if (f.status === 204) {
            return new HttpResponse(f.status, {}, f.headers);
        }

        return new HttpResponse(f.status, await f.json(), f.headers);
    }

    async getToken(): Promise<string> {
        if (this.storage.expiresIn === null) {
            const auth = await globalThis.fetch(
                `${this.shop.shopUrl}/api/oauth/token`,
                {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        grant_type: 'client_credentials',
                        client_id: this.shop.clientId,
                        client_secret: this.shop.clientSecret
                    })
                }
            )

            if (!auth.ok) {
                throw new ApiClientAuthenticationFailed(this.shop.id, new HttpResponse(auth.status, (await auth.json()), auth.headers))
            }

            const expireDate = new Date();
            const authBody = await auth.json();
            this.storage.token = authBody.access_token;
            expireDate.setSeconds(expireDate.getSeconds() + authBody.expires_in);

            return this.storage.token as string;
        }

        if (this.storage.expiresIn.getTime() > (new Date()).getTime()) {
            // Expired

            this.storage.expiresIn = null;

            return await this.getToken();
        }

        return this.storage.token as string;
    }
}

export class HttpResponse {
    constructor(public statusCode: number, public body: any, public headers: Headers) {
    }
}
