#!/bin/sh

BASEDIR=kubernetes
# folder containing built javascript
CLUSTERS="$BASEDIR/dist/clusters"
PATCHES="$BASEDIR/dist/patches"
# folder to write YAML to
OUTDIR="$BASEDIR/generated"

rm -rf "$BASEDIR/dist" "$OUTDIR"
yarn ttsc -p "$BASEDIR"
jk generate -o "$OUTDIR" "$CLUSTERS" --verbose
jk generate -o "$OUTDIR" "$PATCHES" --verbose 