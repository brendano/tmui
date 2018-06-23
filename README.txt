Client-side topic model viewer.  Loads the entire corpus and trained topic model on the client-side.
  tmrun/ => pipeline to fit a mallet topic model and export the data for the app
  myapp/ => the webapp itself (needs a better name!)


HOW TO RUN:
This will show it on the SOTU corpus.
(cd myapp/prebuilt && python -m SimpleHTTPServer)

Note it's actually static, but you have to look at it through a server because
file:/// URLs don't work due to javascript mysteries.


IMPORTING DATA:

The data files are "corpus.jsonl" and "tminfo.json".
Delete them and replace them with new ones.

For simpler examples of what they look like, see:
 - myapp/public/tinycorpus


DATA FORMAT:

(1) corpus.jsonl:  Each line is one JSON object with two keys:
 - docid  (string): these must be unique.
 - text  (string)

(2) tminfo.json: The trained topic model.  The file is just one big JSON with
a bunch of keys.
Specification in myapp/src/models.ts: interface TopicModelInfo.


COMPILING:
This was tested with node v9.11.1 (installed via homebrew on mac)

1. npm install
2. npm start  (runs locally and rebuilds when files change)
3. npm run build  (creates compiled version)


NOTES:
todo: will need to decide on a tokenization representation (ideally
reversible) and perhaps stuff it into the corpus JSONL?
Necessary for token highlighting (unless we retokenize inside the app. ugh.).

todo: need a better way, config-level, to specify the files.

