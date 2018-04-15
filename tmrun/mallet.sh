#!/bin/zsh
set -eux

indir="$1"   # format: one text file for every doc
outname=$2
ntopics=$3
# outname="${indir:a:t}"
echo "input $indir => output $outname"

MALLET=$HOME/sw/ml/mallet-2.0.7/bin/mallet

$MALLET import-dir --input "$indir" --output "${outname}.mallet_import"  \
    --token-regex '[\p{L}\p{N}_]+' --keep-sequence --remove-stopwords
# $MALLET import-dir --input "$indir" --output "${outname}.mallet_import"  --keep-sequence --remove-stopwords

$MALLET train-topics --input "${outname}.mallet_import" --num-topics $ntopics --output-state "${outname}.tmstate.gz" --optimize-interval 10

# view phrase-y topics
# zcat "${outname}.tmstate.gz" | python post.py
# python post.py ${outname}.tmstate.gz
