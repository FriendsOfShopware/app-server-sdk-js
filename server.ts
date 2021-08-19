export const HTTP_OK = 200;

export interface Request {
    query: Map<string, string>,
    headers: Map<string, string>,
    body: string,
    method: string
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