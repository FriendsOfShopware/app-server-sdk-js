import { HmacSigner } from '../components/signer';
import { createHmac } from "crypto";

export class NodeHmacSigner extends HmacSigner {
    async sign(message: string, secret: string) {
        const hmac = createHmac("sha256", secret);
        return hmac
            .update(
                Buffer.from(
                    message,
                    "utf-8"
                )
            )
            .digest("hex");
    }

    async verify(signature: string, data: string, secret: string) {
        const gen = await this.sign(data, secret);

        return gen === signature;
    }
}