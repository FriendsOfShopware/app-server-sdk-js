import { Registration } from "./registration.ts";
import { HmacSigner } from "./signer.ts";
import { ShopRepositoryInterface } from "./repository.ts";
import { ContextResolver } from "./context-resolver.ts";

export class AppServer {
  public registration: Registration;
  public contextResolver: ContextResolver;

  constructor(
    public cfg: AppConfigurationInterface,
    public repository: ShopRepositoryInterface,
    public signer: HmacSigner,
  ) {
    this.registration = new Registration(this);
    this.contextResolver = new ContextResolver(this);
  }
}

export interface AppConfigurationInterface {
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
