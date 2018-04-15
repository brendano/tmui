Scripts to help preprocess and train a Mallet topic model on a corpus.
Specifically done on an example case of a Congressional bill.

Corpus-specific preprocessing, resulting in whole-corpus-JSONL:
$ (cd billbudget && pdftotext Bipartisan\ Budget\ Act\ of\ 2018.pdf)
$ (cd billbudget && python to_doc_json.py)
Saved 653 docs to <closed file 'billparts.jsonl', mode 'w' at 0x10069b540>
    
Add phrases -- optional:
$ python phrasehelp.py add_phrases billbudget/billparts.jsonl
Adding phrases billbudget/billparts.jsonl => billbudget/billparts.phrases.jsonl
Processed 652 docs (records/lines)

Export in Mallet-friendly format:
$ python phrasehelp.py make_mallet_dir billbudget/billparts.phrases.jsonl
billbudget/billparts.phrases.jsonl => billbudget/billparts.phrases.malletdir/
Wrote 652 files

Run Mallet, saving out1.tmstate.gz
$ ./mallet.sh billbudget/billparts.phrases.malletdir out1

Look at topics on the commandline if you want - not necessary
$ python post.py out1.tmstate.gz

Prepare for import into the JS app.  This step should be eliminated and moved
to JS, esp if we start doing more dynamic topic count aggregations anyway.
$ python mallet_output_to_json.py out1.tmstate.gz
out1.tmstate.gz => out1.tminfo.json

