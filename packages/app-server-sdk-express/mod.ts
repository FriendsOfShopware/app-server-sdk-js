/**
 * This module provides a way to convert between the fetch API and the Express API
 * @module
 */

interface ExpressResponse {
    status: (status: number) => void;
    header: (key: string, value: string) => void;
    send: (body: string) => void;
}

interface ExpressRequest {
    protocol: string;
    get: (key: string) => string;
    originalUrl: string;
    headers: {[key: string]: string};
    method: string;
    rawBody?: string;
    setEncoding: (encoding: string) => void;
    on: (event: string, callback: Function) => void;
}

/**
 * Converts a fetch Response to a Express Response 
 */
export async function convertResponse(response: Response, expressResponse: ExpressResponse) {
    expressResponse.status(response.status);
    response.headers.forEach((val, key) => {
        expressResponse.header(key, val);
    })

    expressResponse.send(await response.text());
}

/**
 * Converts a Express request to a fetch Request
 */
export function convertRequest(expressRequest: ExpressRequest): Request {
    const headers = new Headers();

    for (const [key, value] of Object.entries(expressRequest.headers)) {
        headers.set(key, value as string);
    }

    const options: {headers: Headers, method: string, body?: string} = {
        headers,
        method: expressRequest.method,
    };

    if (expressRequest.rawBody) {
        options.body = expressRequest.rawBody;
    }

    return new Request(expressRequest.protocol + '://' + expressRequest.get('host') + expressRequest.originalUrl, options);
}

/**
 * Middleware to parse the raw body of a request and add it to the request object
 * This is required as we can compute only the hash of the raw body and a parsed body might be different
 */
export function rawRequestMiddleware(req: ExpressRequest, res: ExpressResponse, next: Function): void {
    const contentType = req.headers['content-type'] || ''
        , mime = contentType.split(';')[0];

    if (mime != 'application/json') {
        return next();
    }

    let data = '';
    req.setEncoding('utf8');

    req.on('data', function(chunk: string) {
        data += chunk;
    });

    req.on('end', function() {
        req.rawBody = data;
        next();
    });
}