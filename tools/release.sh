#!/usr/bin/env bash

git checkout gh-pages

git rm -r languages
git rm -r src

git checkout master -- languages
git checkout master -- src
git checkout master -- index.html
git checkout master -- index-random.html