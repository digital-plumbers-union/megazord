#!/bin/sh

mkdir -p "$3"
erb name="$1" description="$2" hack/package.erb > "$3"/package.json
touch "$3"/index.ts