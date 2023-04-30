import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  test: false,
  scriptModule: false,
  shims: {
    deno: false,
  },
  compilerOptions: {
    lib: ["es2022", "dom", "webworker"],
  },
  package: {
    name: "@friendsofshopware/app-server-sdk",
    version: Deno.args[0],
    description: "Shopware App Server SDK",
    keywords: ["shopware", "app-server", "sdk", "appsystem"],
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/FriendsOfShopware/app-server-sdk-js.git",
    },
    bugs: {
      url: "https://github.com/FriendsOfShopware/app-server-sdk-js/issues",
    },
    engines: {
      "node": ">=18.0.0",
    }
  },
  postBuild() {
    Deno.copyFileSync("./README.md", "./npm/README.md");
    Deno.copyFileSync("./LICENSE", "./npm/LICENSE");
  },
});
