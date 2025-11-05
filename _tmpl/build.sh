#!/usr/bin/env bash

DIR=$(realpath ${0%/*})
cd $DIR
set -ex

fmt() {
  oxfmt
  oxlint --fix
}

cd src
fmt
cd ../test
fmt
cd ..
rm -rf lib
rsync -avz src/ lib
bun x mdt .
cp README.md lib/
