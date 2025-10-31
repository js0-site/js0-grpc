#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -ex

cd test

if [ -d "protobuf" ]; then
  cd protobuf
  # git pull
else
  git clone --depth=1 git@github.com:protocolbuffers/protobuf.git
  cd protobuf
fi

outdir=../../src/import

rm -rf $outdir
mkdir -p $outdir

rsync -av --exclude='test_*' \
  --exclude='*unittest.proto' \
  --exclude='*_test.proto' \
  --exclude='unittest_*' \
  --exclude='*_unittest_*' \
  --include='*/' \
  --include='*.proto' \
  --exclude='*' ./src/google $outdir
