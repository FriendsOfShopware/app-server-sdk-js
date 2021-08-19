# Shopware App Server SDK in TypeScript

## This is WIP!

This SDK is written in pure Typescript with portability in mind being able to use it on NodeJs, Deno, Cloudflare Worker or other runtimes.

## Goals

- Complete Registration Handshake between Shopware and this SDK
- Verifying and Signing of Responses
- Provide a simple to use HttpClient

## How to use it?

### NodeJS example

See `examples/node` folder for a full example

```typescript
import {App} from "shopware-app-server-sdk";
import {Config} from "shopware-app-server-sdk/config";
import {InMemoryShopRepository} from "shopware-app-server-sdk/repository";
import express from 'express';
import {convertRequest, convertResponse, rawRequestMiddleware} from 'shopware-app-server-sdk/runtime/node/express';
import {NodeHmacSigner} from 'shopware-app-server-sdk/runtime/node/signer';

const app = express();

const cfg: Config = {
    appName: 'Test',
    appSecret: 'testSecret',
    authorizeCallbackUrl: 'http://app-server.dev.localhost/authorize/callback'
};

const appServer = new App(cfg, new InMemoryShopRepository, new NodeHmacSigner);

app.use(rawRequestMiddleware);

app.get('/authorize', async (req, res) => {
    const resp = await appServer.registration.authorize(convertRequest(req));

    convertResponse(resp, res);
});

app.post('/authorize/callback', async (req, res) => {
    // @ts-ignore
    console.log(req.rawBody)
    const resp = await appServer.registration.authorizeCallback(convertRequest(req));

    convertResponse(resp, res);
});

app.listen(process.env.PORT || 8080, () => {
    console.log(`App listening at http://0.0.0.0:${process.env.PORT || 8080}`)
})
```


### Cloudflare example

See `examples/cf-worker` folder for a full example

```typescript
import {App} from "shopware-app-server-sdk";
import {Config} from "shopware-app-server-sdk/config";
import {WebCryptoHmacSigner} from "shopware-app-server-sdk/component/signer";
import {convertRequest, convertResponse, CloudflareShopRepository} from "shopware-app-server-sdk/runtime/cf-worker";

const cfg: Config = {
    appName: 'Test',
    appSecret: 'testSecret',
    authorizeCallbackUrl: 'https://xxxx.shyim.workers.dev/authorize/callback'
};

export async function handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // This requires that an KV storage has been bound to shopStorage
    // @ts-ignore
    const app = new App(cfg, new CloudflareShopRepository(globalThis.shopStorage), new WebCryptoHmacSigner());

    if (url.pathname.startsWith('/authorize/callback')) {
        const req = await convertRequest(request);
        return await convertResponse(await app.registration.authorizeCallback(req));
    }

    if (url.pathname.startsWith('/authorize')) {
        const req = await convertRequest(request);
        return await convertResponse(await app.registration.authorize(req));
    }

    return new Response(`Not found`)
}

```
