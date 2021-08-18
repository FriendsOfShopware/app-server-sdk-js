import { Response } from '../server';

export abstract class HmacSigner {
    abstract sign(message: string, secret: string): Promise<string>
    abstract verify(signature: string, data: string, secret: string): Promise<boolean>

    async signResponse(response: Response, secret: string): Promise<void> {
        response.headers.set('shopware-app-signature', await this.sign(response.body, secret))
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
            key,
            this.encoder.encode(message)
        )
    
        return atob(String.fromCharCode(...new Uint8Array(mac)));
    }

    async verify(signature: string, data: string, secret: string) {
        const key = await this.getKeyForSecret(secret);
    
        return await crypto.subtle.verify(
            'HMAC',
            key,
            this.encoder.encode(signature),
            this.encoder.encode(data)
        )
    }
}