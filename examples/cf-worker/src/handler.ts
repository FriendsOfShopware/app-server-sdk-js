import {App} from "../../../app";
import {Config} from "../../../config";
import {WebCryptoHmacSigner} from "../../../components/signer";
import {convertRequest, convertResponse, CloudflareShopRepository} from "../../../cf-worker";

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
