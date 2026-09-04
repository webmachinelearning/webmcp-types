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

This package requires TypeScript 5.0 or newer.

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

### Run the type tests

- `npm install`
- `npm test`

The tests in `index.test-d.ts` are statically checked with [Vitest typecheck mode](https://vitest.dev/guide/testing-types) against `tsconfig.json`; they are never executed.

### Publish a new npm package version

[Release Please](https://github.com/googleapis/release-please) keeps a release pull request open with the next version and changelog, based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) on `main`. Merging it creates the GitHub release and publishes to npm through [trusted publishing](https://docs.npmjs.com/trusted-publishers/); no npm token or local publish step is needed.
