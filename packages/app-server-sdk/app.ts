import { Registration } from "./registration.ts";
import { HmacSigner } from "./signer.ts";
import { ShopRepository } from "./repository.ts";
import { ContextResolver } from "./context-resolver.ts";

export class AppServer {
  public registration: Registration;
  public contextResolver: ContextResolver;

  constructor(
    public cfg: AppConfig,
    public repository: ShopRepository,
    public signer: HmacSigner,
  ) {
    this.registration = new Registration(this);
    this.contextResolver = new ContextResolver(this);
  }
}

export interface AppConfig {
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
