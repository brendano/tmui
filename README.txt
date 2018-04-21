experiment for topic model viewing
  tmrun/ => pipeline to fit a mallet topic model and export the data for the app
  myapp/ => the webapp itself (needs a better name!)


HOW TO RUN
(cd prebuilt && python -m SimpleHTTPServer)


IMPORTING DATA
Replace "corpus.jsonl" and "tminfo.json".
(These are from: myapp/public/tinycorpus)

Larger examples:
Corpus (it has an extra phrase counts key in it, but that's not necessary)
http://hobbes.cs.umass.edu/~brenocon/tmui_app/tmrun/sotu/sotu.phrases.jsonl
Topic model
http://hobbes.cs.umass.edu/~brenocon/tmui_app/tmrun/sotu/sotu.tm10.tminfo.json

Data format:

(1) corpus.jsonl:  Each line is one JSON object with two keys:
 - docid  (string)
 - text  (string)

(2) tminfo.json: The trained topic model.  The file is just one big JSON with
a bunch of keys.
Specification in myapp/src/models.ts: interface TopicModelInfo.


COMPILING IT
This was tested with node v9.11.1 (installed via homebrew on mac)

1. npm install
2. npm start  (runs locally and rebuilds when files change)
3. npm run build  (creates compiled version)


NOTES

todo: will need to decide on a tokenization representation (ideally
reversible) and perhaps stuff it into the corpus JSONL?
Necessary for token highlighting (unless we retokenize inside the app. ugh.).

todo: need a better way, config-level, to specify the files.

