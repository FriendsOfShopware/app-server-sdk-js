import { Response } from '../server';

export function applyResponse(response: Response, expressResponse: any) {
    expressResponse.status(response.statusCode);
    response.headers.forEach((val, key) => {
        expressResponse.header(key, val);
    })

    expressResponse.send(response.body);
}