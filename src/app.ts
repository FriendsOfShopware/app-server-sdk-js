import { Registration } from "./registration.ts";
import { WebCryptoHmacSigner } from "./signer.ts";
import { ShopRepositoryInterface } from "./repository.ts";
import { ContextResolver } from "./context-resolver.ts";

/**
* AppServer is the main class, this is where you start your app
*/
export class AppServer {
  public registration: Registration;
  public contextResolver: ContextResolver;
  public signer: WebCryptoHmacSigner;

  constructor(
    public cfg: Configuration,
    public repository: ShopRepositoryInterface
  ) {
    this.registration = new Registration(this);
    this.contextResolver = new ContextResolver(this);
    this.signer = new WebCryptoHmacSigner()
  }
}

interface Configuration {
  /**
   * Your app name
   */
  appName: string;

  /**
   * Your app secret
   */
  appSecret: string;

  /**
   * URL to authorize callback url
   */
  authorizeCallbackUrl: string;
}
