import {Request, Response} from '../../server';
import express from "express";

export function convertResponse(response: Response, expressResponse: any) {
    expressResponse.status(response.statusCode);
    response.headers.forEach((val, key) => {
        expressResponse.header(key, val);
    })

    expressResponse.send(response.body);
}

export function convertRequest(expressRequest: any): Request {
    return {
        body: expressRequest.rawBody || '',
        headers: expressRequest.headers,
        query: expressRequest.query,
        method: expressRequest.method
    };
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