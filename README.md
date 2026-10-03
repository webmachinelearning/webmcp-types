# TypeScript definitions for WebMCP

This package augments TypeScript's DOM types with definitions for the [WebMCP specification](https://webmachinelearning.github.io/webmcp/).
It also adds `agentInvoked` and `respondWith()` to `SubmitEvent` from the [declarative API explainer](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md), which the draft does not specify yet.

## Install

- npm: `npm install --save-dev webmcp-types`
- yarn: `yarn add --dev webmcp-types`
- pnpm: `pnpm add -D webmcp-types`

This package requires TypeScript 5.0 or newer.

## Configure

Add `"webmcp-types"` to [`compilerOptions.types`](https://www.typescriptlang.org/tsconfig/types.html) in your `tsconfig.json`, keeping any entries you already have:

```json
{
  "compilerOptions": {
    "types": ["webmcp-types"]
  }
}
```

Alternatively, add a [type reference](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-) at the top of a `.d.ts` file included in your project:

```ts
/// <reference types="webmcp-types" />
```

## Run the type tests

- `npm install`
- `npm test`

The tests in `index.test-d.ts` are statically checked with [Vitest typecheck mode](https://vitest.dev/guide/testing-types) against `tsconfig.json`; they are never executed.

## Publish

[Release Please](https://github.com/googleapis/release-please) keeps a release pull request open with the next version and changelog, based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) on `main`. Merging it creates the GitHub release and publishes to npm through [trusted publishing](https://docs.npmjs.com/trusted-publishers/); no npm token or local publish step is needed.
