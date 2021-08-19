import { Request, Response } from '../server';

export abstract class HmacSigner {
    abstract sign(message: string, secret: string): Promise<string>
    abstract verify(signature: string, data: string, secret: string): Promise<boolean>

    async signResponse(response: Response, secret: string): Promise<void> {
        response.headers.set('shopware-app-signature', await this.sign(response.body, secret))
    }

    async verifyPostRequest(request: Request, secret: string) {
        return await this.verify(request.headers.get('shopware-shop-signature') as string, request.body, secret);
    }
}

export class WebCryptoHmacSigner extends HmacSigner {
    private encoder: TextEncoder;
    private keyCache: Map<string, CryptoKey>

    constructor() {
        super();
        this.encoder = new TextEncoder();
        this.keyCache = new Map<string, CryptoKey>();
    }

    async getKeyForSecret(secret: string) {
        if (this.keyCache.has(secret)) {
            return this.keyCache.get(secret);
        }
    
        const secretKeyData = this.encoder.encode(secret)
        const key = await crypto.subtle.importKey(
            'raw',
            secretKeyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign', 'verify'],
        )
    
        this.keyCache.set(secret, key);
    
        return key;
    }

    async sign(message: string, secret: string) {
        const key = await this.getKeyForSecret(secret);
    
        const mac = await crypto.subtle.sign(
            'HMAC',
            key as CryptoKey,
            this.encoder.encode(message)
        )
    
        return this.buf2hex(mac);
    }

    async verify(signature: string, data: string, secret: string) {
        const signed = await this.sign(data, secret);

        return signature === signed;
    }

    buf2hex(buf: any) {
        return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
    }
}