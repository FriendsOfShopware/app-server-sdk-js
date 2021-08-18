import { Handshake } from "./components/handshake";
import { HmacSigner } from "./components/signer";
import { Config } from "./config";
import { ShopRepository } from "./repository";

export class App {
    public handshake: Handshake;

    constructor(public cfg: Config, public repository: ShopRepository, public signer: HmacSigner) {
        this.handshake = new Handshake(this);
    }
}