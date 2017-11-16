#!/bin/sh

echo 'Pushing to Github!'
git checkout auto-gen
git add .
git commit -m 'Running autoupdate'
git push origin auto-gen