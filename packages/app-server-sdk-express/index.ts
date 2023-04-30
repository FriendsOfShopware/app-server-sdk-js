import express from "express";

export function convertResponse(response: Response, expressResponse: express.Response) {
    expressResponse.status(response.status);
    response.headers.forEach((val, key) => {
        expressResponse.header(key, val);
    })

    response.text().then((text) => {
        expressResponse.send(text);
    });
}

export function convertRequest(expressRequest: express.Request): Request {
    const headers = new Headers();

    for (const [key, value] of Object.entries(expressRequest.headers)) {
        headers.set(key, value as string);
    }

    return new Request(expressRequest.url, {
        headers,
        method: expressRequest.method,
        // @ts-ignore
        body: expressRequest.rawBody || '',
    });
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