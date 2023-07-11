import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  test: false,
  scriptModule: false,
  shims: {
    deno: false,
    blob: false,
    crypto: false,
    domException: false,
    prompts: false,
    timers: false,
    undici: false,
    weakRef: false,
    webSocket: false
  },
  mappings: {
    "https://deno.land/x/shopware_app_server_sdk/mod.ts": {
      name: "@friendsofshopware/app-server-sdk",
      version: "^0.0.39",
      peerDependency: false,
    },
  },
  compilerOptions: {
    lib: ["es2022", "dom", "webworker"],
  },
  package: {
    name: "@friendsofshopware/app-server-sdk-cloudflare",
    version: Deno.args[0],
    description: "Cloudflare Integration for Shopware App Server SDK",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/FriendsOfShopware/app-server-sdk-js.git",
    },
    bugs: {
      url: "https://github.com/FriendsOfShopware/app-server-sdk-js/issues",
    },
  }
});
