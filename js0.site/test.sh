#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -ex

cd test

rsync -av --exclude 'package.json' ../../../mod/srv/gen/js .

./main.js

./proto/test.sh
