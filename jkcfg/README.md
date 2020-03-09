This directory contains packages and models defined in TypeScript generated using `jkcfg`.

## Generation

To From root:

```sh
hack/generate-manifests.sh
```

### Caveats

- Have to use [`ttypescript`](https://www.npmjs.com/package/ttypescript) because `jk` doesn't provide a method to register modules, e.g., `tsconfig-paths`.  `ttypescript` lets us use [`typescript-transform-paths`](https://www.npmjs.com/package/typescript-transform-paths).

- Can't use Node built-ins.  That is why this directory gets its own `tsconfig.json` -- to help make that clear.

## `jkcfg`

While writing configurations for `jk`...

- Make each module composable, meaning it has a single `default` export that `jk` can use to generate.
- Rely on `valuesForGenerate()` from `@jkcfg/kubernetes` instead of including filepaths in exported modules.
