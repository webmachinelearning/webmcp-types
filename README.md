# Typescript Type Definitions for WebMCP

This package defines Typescript types (`.d.ts`) for the [WebMCP specification](https://webmachinelearning.github.io/webmcp).

Use this package to augment the ambient [`"dom"`](https://www.typescriptlang.org/docs/handbook/compiler-options.html#compiler-options) type definitions with the new definitions for WebMCP.

## What are declaration files?

See the [TypeScript handbook](http://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html).


## How can I use them?

### Install

- npm: `npm install --save-dev webmcp-types`
- yarn: `yarn add --dev webmcp-types`
- pnpm: `pnpm add -D webmcp-types`

### Configure

Since this package is outside DefinitelyTyped, the dependency won't be picked up automatically.
There are several ways to add a additional TypeScript type definition dependencies to your TypeScript project:

#### TypeScript `tsc` and `tsc`-based bundlers

In `tsconfig.json`:

```js
{
  // ...
  "compilerOptions": {
    // ...
    "types": ["webmcp-types"]
  }
}
```

Or you can use `typeRoots`:

```js
{
  // ...
  "compilerOptions": {
    // ...
    "typeRoots": ["./node_modules/webmcp-types", "./node_modules/@types"]
  }
}
```

#### Inline in TypeScript

This may work better if your toolchain doesn't read `tsconfig.json`.

```ts
/// <reference types="webmcp-types" />
```

#### Webpack

If you use Webpack and the options above aren't sufficient (this has not been verified),
you may need the following in `webpack.config.js`:

```js
"types": ["webmcp-types"]
```

### Publish a new npm package version

(only for people who have npm publish access)

* Make sure you are in the upstream repo, not your forked one. And make sure you are synced to latest commit intended for publish
  - `git checkout main`
  - `git pull https://github.com/webmachinelearning/webmcp-types.git main`
    - (If you are using HTTPS regularly. You can use remote names like `origin`, just make sure you are referring to the right repo)
* Create the version tag and commit, and push
  - `npm version patch`
  - `git push https://github.com/webmachinelearning/webmcp-types.git main --tags`
* publish the package
  - `npm publish --otp=<code>`
    - Replace `<code>` with the one-time password from your authenticator, since two-factors authentication is required to publish.
    - If you are doing for the first time, you will do `npm adduser` first and it will guide you through adding the npm account.
