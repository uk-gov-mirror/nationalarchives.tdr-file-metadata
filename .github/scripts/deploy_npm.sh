#!/bin/bash
set -e
git config --global user.email 181243999+tna-da-bot@users.noreply.github.com
git config --global user.name tna-da-bot
git checkout -b $BRANCH_NAME
git push -u origin $BRANCH_NAME
npm config set //registry.npmjs.org/:_authToken=$1
npm ci
npm run build:prod
npm version patch -m 'Update npm version v%s'
git push
echo set-npm-version=$(awk '/version/{gsub(/("|",)/,"",$2);print $2}' package.json) >> $GITHUB_OUTPUT
npm publish --access public
cd ..
