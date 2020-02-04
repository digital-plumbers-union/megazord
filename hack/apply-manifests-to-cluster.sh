#!/bin/sh

hack/generate-manifests.sh

# share these across bash scripts via .env
BASEDIR=kubernetes
# folder containing built javascript
CLUSTERS="$BASEDIR/dist/clusters"
PATCHES="$BASEDIR/dist/patches"
# folder to write YAML to
OUTDIR="$BASEDIR/generated/clusters"
VENDOR="$BASEDIR/vendor"

# handles resources without namespace until i fix that
kubens default
kubectl apply -f "$OUTDIR" --recursive
kubectl apply -f "$VENDOR" --recursive

