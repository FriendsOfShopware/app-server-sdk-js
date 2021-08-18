export const HTTP_OK = 200;

export interface Request {
    query: any,
    headers: any,
    body: string
}

export class Response {
    constructor(public statusCode: number, public body: string = '', public headers: Map<string, string> = new Map()) {}
}

export class JsonResponse extends Response {
    constructor(public statusCode: number, response: object, public headers: Map<string, string> = new Map()) {
        super(statusCode, JSON.stringify(response), headers);
        this.headers.set('content-type', 'application/json');
    }
}