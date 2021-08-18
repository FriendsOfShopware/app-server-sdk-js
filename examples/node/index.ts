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

const appServer = new App(cfg, new InMemoryShopRepository, new NodeHmacSigner);

app.get('/authorize', async (req, res) => {
    const resp = await appServer.handshake.authorize(req as Request);

    applyResponse(resp, res);
});

app.post('/authorize/callback', async (req, res) => {
    const resp = await appServer.handshake.authorizeCallback(req as Request);

    applyResponse(resp, res);
});

app.listen(8080);