#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -ex

./build.sh

cd ./test/js0_test

rm -rf gen

mise exec -- $DIR/lib/cli.js
