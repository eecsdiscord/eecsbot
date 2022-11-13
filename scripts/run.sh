#!/bin/bash -e
source ~/.nvm/nvm.sh
nvm use || nvm install

exec npm run serve
