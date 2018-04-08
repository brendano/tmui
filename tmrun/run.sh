#!/bin/zsh
set -eux

indir="$1"
outname=$2
# outname="${indir:a:t}"
echo "input $indir => output $outname"

MALLET=$HOME/sw/ml/mallet-2.0.7/bin/mallet

$MALLET import-dir --input "$indir" --output "${outname}.mallet_import"  --token-regex '\S+' --keep-sequence --remove-stopwords

$MALLET train-topics --input "${outname}.mallet_import" --num-topics 20 --output-state "${outname}.tmstate.gz" --optimize-interval 10

# zcat "${outname}.tmstate.gz" | python post.py
python post.py ${outname}.tmstate.gz
