import {Request, Response} from '../server';

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

export function rawRequestMiddleware(req, res, next) {
    const contentType = req.headers['content-type'] || ''
        , mime = contentType.split(';')[0];

    if (mime != 'application/json') {
        return next();
    }

    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end', function() {
        req.rawBody = data;
        next();
    });
}