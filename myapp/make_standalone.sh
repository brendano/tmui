#!/bin/zsh
set -eux
npm run build  # takes a while
# rm -rf build/tmrun
cp public/tinycorpus/* build
