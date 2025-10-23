#!/usr/bin/env bash

DIR=$(realpath ${0%/*})
cd $DIR
set -ex

fmt() {
  oxfmt
  oxlint --fix
}

./test.sh
cd src
fmt
cd ../test
rm -rf bundle
fmt
./bundle.js
cd ..
rm -rf lib
rsync -avz src/ lib
./minify.js
bun x mdt .
cp README.md lib/
