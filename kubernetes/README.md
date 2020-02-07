This directory contains Kubernetes manifests defined in TypeScript and generated using `jkcfg`.

## Generation

To From root:

```sh
hack/generate-manifests.sh
```

### Caveats

- Have to use [`ttypescript`](https://www.npmjs.com/package/ttypescript) because `jk` doesn't provide a method to register modules, e.g., `tsconfig-paths`.  `ttypescript` lets us use [`typescript-transform-paths`](https://www.npmjs.com/package/typescript-transform-paths).

- Can't use Node built-ins.  Seems kinda stupid.  That is why this directory gets its own `tsconfig.json` and a different import scope, `@k8s/` -- to help make that clear.

- Can't use `"allowSyntheticDefaultImports": true` for some reason...

## `jkcfg`

While writing configurations for `jk`...

- Make each module composable, meaning it has a single `default` export that `jk` can use to generate.
- Don't include directory in exported file names.  Allow user of `jk` or author of composite module to decide what directory is used.

### macros / utils
- service class / function to reduce:
  - base name + func
  - namespace spam
  - resource name spam
  - large export
- subjects + roles array builder
- boilerplate builder


## sealedsecrets

seal secrets raw for specific namespace, pipe them into files using sed or other text processing utilities

import those files using `$INLINE_JSON` and `$INLINE_FILE` via typescript transform plugin that inlines those files.  this gets around reading issue during jkcfg generate.

might be better to use jkcfg config files which are created using kubeseal?