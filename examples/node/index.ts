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