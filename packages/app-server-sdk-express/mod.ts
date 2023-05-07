import express from "https://deno.land/x/express@v0.0.0/mod.ts";

export async function convertResponse(response: Response, expressResponse: express.Response) {
    expressResponse.status(response.status);
    response.headers.forEach((val, key) => {
        expressResponse.header(key, val);
    })

    expressResponse.send(await response.text());
}

export function convertRequest(expressRequest: express.Request): Request {
    const headers = new Headers();

    for (const [key, value] of Object.entries(expressRequest.headers)) {
        headers.set(key, value as string);
    }

    const options: {headers: Headers, method: string, body?: string} = {
        headers,
        method: expressRequest.method,
    };

    // @ts-ignore
    if (expressRequest.rawBody) {
        // @ts-ignore
        options.body = expressRequest.rawBody;
    }

    return new Request(expressRequest.protocol + '://' + expressRequest.get('host') + expressRequest.originalUrl, options);
}

export function rawRequestMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
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
        // @ts-ignore
        req.rawBody = data;
        next();
    });
}