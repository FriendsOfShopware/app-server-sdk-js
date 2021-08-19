import { Registration } from "./component/registration";
import { HmacSigner } from "./component/signer";
import { Config } from "./config";
import { ShopRepository } from "./repository";
import {ContextResolver} from "./component/context-resolver";

export class App {
    public registration: Registration;
    public contextResolver: ContextResolver;

    constructor(public cfg: Config, public repository: ShopRepository, public signer: HmacSigner) {
        this.registration = new Registration(this);
        this.contextResolver = new ContextResolver(this);
    }
}