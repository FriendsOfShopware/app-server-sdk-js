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
import { Request } from "../../server";
import { applyResponse } from '../../node/express';
import { NodeHmacSigner } from '../../node/signer';
const app = express();

const cfg: Config = {
    appName: 'Test',
    appSecret: 'testSecret',
    authorizeCallbackUrl: 'http://localhost/callback'
};

// Use in memory shop repository. The registered shops are gone after restart. Add a own implementation to store persistent
const appServer = new App(cfg, new InMemoryShopRepository, new NodeHmacSigner);

app.get('/authorize', async (req, res) => {
    const resp = await appServer.registration.authorize(req as Request);

    applyResponse(resp, res);
});

app.post('/authorize/callback', async (req, res) => {
    const resp = await appServer.registration.authorizeCallback(req as Request);

    applyResponse(resp, res);
});

app.listen(8080);
```

