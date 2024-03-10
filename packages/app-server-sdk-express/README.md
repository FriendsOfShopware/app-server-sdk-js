# App Server Express

This package can be used to integrate the Shopware App Server into a existing Express application. The App Server package only interacts with with Fetch based Request and Responses. This package allows you to convert from Express Request and Response to Fetch Request and Response.

## Example with Express

```js
import {AppServer, InMemoryShopRepository} from "@friendsofshopware/app-server-sdk";
import express from 'express';
import {convertRequest, convertResponse, rawRequestMiddleware} from '@friendsofshopware/app-server-express';

const app = express();

const cfg = {
    appName: 'Test',
    appSecret: 'testSecret',
    authorizeCallbackUrl: 'http://localhost:8080/app/lifecycle/register/callback'
};

const appServer = new AppServer(cfg, new InMemoryShopRepository);

// The middleware is required to store the raw request body, used by convertRequest method
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
