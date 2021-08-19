import {HttpResponse} from "../component/http-client";

export class ApiClientAuthenticationFailed extends Error {
    constructor(shopId: string, public response: HttpResponse) {
        super(`The api client authentication to shop with id: ${shopId}`);
    }
}

export class ApiClientRequestFailed extends Error {
    constructor(shopId: string, public response: HttpResponse) {
        super(`The api request failed with status code: ${response.statusCode} for shop with id: ${shopId}`);
    }
}