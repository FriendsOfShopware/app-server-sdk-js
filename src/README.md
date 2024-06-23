# App Server

This package can be used to create a Shopware App Backend. It's build independent of any JavaScript framework. It relies on Fetch-standardized Request and Response objects.

## Standalone example with Bun

```js
import { AppServer, InMemoryShopRepository } from '@friendsofshopware/app-server'
import { notification } from '@friendsofshopware/app-server/helper/app-actions'

const app = new AppServer({
    appName: 'MyApp',
    appSecret: 'my-secret',
    authorizeCallbackUrl: 'http://localhost:3000/authorize/callback',
}, new InMemoryShopRepository());

const server = Bun.serve({
    port: 3000,
    async fetch(request) {
        const { pathname } = new URL(request.url);
        if (pathname === '/authorize') {
            return app.registration.authorize(request);
        } else if (pathname === '/authorize/callback') {
            return app.registration.authorizeCallback(request);
        } else if (pathname === '/app/product') {
            const context = await app.contextResolver.fromSource(request);

            // do something with payload, and http client

            const notification = notification('success', 'Product created');

            // sign the response, with the shop secret
            await app.signer.signResponse(, context.shop.getShopSecret());

            return resp;
        }

        return new Response('Not found', { status: 404 });
    },
});

console.log(`Listening on localhost:${server.port}`);
```
