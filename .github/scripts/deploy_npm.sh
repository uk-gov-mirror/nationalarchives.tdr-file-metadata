#!/bin/bash
git config --global user.email 181243999+tna-da-bot@users.noreply.github.com
git config --global user.name tna-da-bot
git checkout -b $BRANCH_NAME
git push -u origin $BRANCH_NAME
npm config set //registry.npmjs.org/:_authToken=$1
npm ci
npm run build:prod
npm version patch
git add package.json package-lock.json
git commit -m 'Update npm version'
git push
npm publish --access public
echo set-npm-version=$(awk '/version/{gsub(/("|",)/,"",$2);print $2}' package.json) >> $GITHUB_OUTPUT
cd ..
