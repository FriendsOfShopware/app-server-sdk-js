import { HmacSigner } from '../components/signer';

export class NodeHmacSigner extends HmacSigner {
    async sign(message: string, secret: string) {
        const crypto = require('crypto');

        return crypto.createHmac('sha256', secret)
            .update(message)
            .digest('hex');
    }

    async verify(signature: string, data: string, secret: string) {
        const gen = await this.sign(data, secret);

        return gen === signature;
    }
}