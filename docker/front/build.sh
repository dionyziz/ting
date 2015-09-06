#!/bin/bash
export JOBS=MAX
pushd /usr/src/app
export PATH=$(npm bin):$PATH
npm install
bower --allow-root install
popd
