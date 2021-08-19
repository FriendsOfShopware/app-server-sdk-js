# Shopware App Server SDK in TypeScript

## This is WIP!

This SDK is written in pure Typescript with portability in mind to be able to use it on NodeJs, Deno, Cloudflare Worker or other runtimes.

## Goals

- Complete Registration Handshake between Shopware and this SDK
- Verifiying and Signing of Responses
- Provide a simple to use HttpClient

## How to use it?

### NodeJS example

```typescript
import { App } from "../../app";
import { Config } from "../../config";
import { InMemoryShopRepository } from "../../repository";
import express from 'express';
import {convertRequest, convertResponse, rawRequestMiddleware} from '../../node/express';
import { NodeHmacSigner } from '../../node/signer';
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

