# Shopware App Server SDK in TypeScript

This SDK is written in pure Typescript with portability in mind being able to use it on NodeJs, Deno, Cloudflare Worker or other runtimes.

## Features

- Provides registration process for app
- Verify and signing of requests / responses
- preconfigured API Client
- Complete Registration Handshake between Shopware and this

## How to use it?

Checkout examples folder for all examples.

### NodeJS example

See `examples/node` folder for a full example

```typescript
import {AppServer, AppConfigurationInterface, InMemoryShopRepository} from "@friendsofshopware/app-server-sdk";
import express from 'express';
import {convertRequest, convertResponse, rawRequestMiddleware} from '@friendsofshopware/app-server-sdk-express';

const app = express();

const cfg: AppConfigurationInterface = {
    appName: 'Test',
    appSecret: 'testSecret',
    authorizeCallbackUrl: 'http://localhost:8080/app/lifecycle/register/callback'
};

const appServer = new AppServer(cfg, new InMemoryShopRepository);

app.use(rawRequestMiddleware);

app.get('/app/lifecycle/register', async (req, res) => {
    const resp = await appServer.registration.authorize(convertRequest(req));

    convertResponse(resp, res);
});

app.post('/app/lifecycle/register/callback', async (req, res) => {
    const resp = await appServer.registration.authorizeCallback(convertRequest(req));

    convertResponse(resp, res);
});

app.post('/event/product-changed', async (req, res) => {
    const context = await appServer.contextResolver.fromSource(convertRequest(req));

    console.log(await context.httpClient.post('/search/product'));

    res.send();
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
