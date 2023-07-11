import { build, emptyDir } from "https://deno.land/x/dnt@0.35.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  test: false,
  scriptModule: false,
  declaration: 'separate',
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
    customDev: [
      {
        package: {
          name: "express",
          version: "^4.18.2",
        },
        typesPackage: {
          name: "@types/express",
          version: "^4.17.17",
        },
        globalNames: ["express"]
      }
    ]
  },
  mappings: {
    "https://deno.land/x/express@v0.0.0/mod.ts": {
      name: "express",
      version: "^4.18.2",
      peerDependency: false,
    },
  },
  compilerOptions: {
    lib: ["es2022", "dom", "webworker"],
  },
  package: {
    name: "@friendsofshopware/app-server-sdk-express",
    version: Deno.args[0],
    description: "Express Integration for Shopware App Server SDK",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/FriendsOfShopware/app-server-sdk-js.git",
    },
    bugs: {
      url: "https://github.com/FriendsOfShopware/app-server-sdk-js/issues",
    },
    devDependencies: {
      "@types/express": "^4.17.17",
    }
  }
});
