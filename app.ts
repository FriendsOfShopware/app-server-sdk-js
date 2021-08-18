import { Registration } from "./components/registration";
import { HmacSigner } from "./components/signer";
import { Config } from "./config";
import { ShopRepository } from "./repository";

export class App {
    public registration: Registration;

    constructor(public cfg: Config, public repository: ShopRepository, public signer: HmacSigner) {
        this.registration = new Registration(this);
    }
}