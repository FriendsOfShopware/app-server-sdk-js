import {App} from "shopware-app-server-sdk";
import {Config} from "shopware-app-server-sdk/config";
import {InMemoryShopRepository} from "shopware-app-server-sdk/repository";
import express from 'express';
import {convertRequest, convertResponse, rawRequestMiddleware} from 'shopware-app-server-sdk/runtime/node/express';
import {NodeHmacSigner} from 'shopware-app-server-sdk/runtime/node/signer';

globalThis.fetch = require('node-fetch');

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