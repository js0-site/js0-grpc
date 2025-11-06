#!/usr/bin/env bash

set -e
DIR=$(realpath ${0%/*})
cd $DIR
if [ ! -d node_modules ]; then
  bun i
  cd ..
  bun i
  cd $DIR
fi
set -x

rm -rf lib
bun x cep -c src -o lib
