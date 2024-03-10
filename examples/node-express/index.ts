import {AppServer, InMemoryShopRepository } from "@friendsofshopware/app-server";
import express from 'express';
import {convertRequest, convertResponse, rawRequestMiddleware} from '@friendsofshopware/app-server-express';

const app = express();

const cfg = {
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