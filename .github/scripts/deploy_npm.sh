#!/bin/bash
git config --global user.email digitalpreservation@nationalarchives.gov.uk
git config --global user.name tna-digital-archiving-jenkins
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
