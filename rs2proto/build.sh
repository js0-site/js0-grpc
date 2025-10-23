#!/usr/bin/env bash

DIR=$(realpath ${0%/*})
cd $DIR
set -ex

rm -rf lib
bun x cep -c src -o lib
