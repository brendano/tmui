#!/bin/zsh
# Run the whole pipeline, starting with corpus-JSONL
set -eu
tgt="$1"
here="$(dirname $0)"
set -x
python $here/phrasehelp.py add_phrases ${tgt}.jsonl
python $here/phrasehelp.py make_mallet_dir ${tgt}.phrases.jsonl
$here/mallet.sh $tgt.phrases.malletdir ${tgt}.tm1 10
python $here/mallet_output_to_json.py ${tgt}.tm1.tmstate.gz

