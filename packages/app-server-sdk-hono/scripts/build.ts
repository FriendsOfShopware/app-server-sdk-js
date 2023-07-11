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
    webSocket: false,
  },
  mappings: {
    "https://deno.land/x/hono@v3.1.8/mod.ts": {
      name: "hono",
      version: "^3.1.8",
      peerDependency: false,
    },
    "https://deno.land/x/hono@v3.1.8/http-exception.ts": {
      name: "hono",
      version: "^3.1.8",
      subPath: "http-exception",
    },
    "https://deno.land/x/shopware_app_server_sdk@0.0.39/mod.ts": {
      name: "@friendsofshopware/app-server-sdk",
      version: "^0.0.39",
      peerDependency: false,
    },
  },
  compilerOptions: {
    lib: ["es2022", "dom", "webworker"],
  },
  package: {
    name: "@friendsofshopware/app-server-sdk-hono",
    version: Deno.args[0],
    description: "Hono Integration for Shopware App Server SDK",
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
