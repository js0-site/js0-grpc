#!/usr/bin/env bash

DIR=$(realpath ${0%/*})
cd $DIR
set -ex

if [ -z "$1" ]; then
  echo "USAGE : $0 project_name"
  exit 1
else
  PROJECT=$1
fi

cd $PROJECT

./build.sh
../sh/verNext.js

git add -u
git commit -m.
git pull
git push
cd lib
npm publish --access=public
