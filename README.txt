experiment for topic model viewing
currently the directories are
tmrun/ => pipeline to fit a mallet topic model and export the data for the app
myapp/ => the webapp itself (needs a better name!)
for the app, "npm install", "npm start", and/or "npm run build" should run it

DATA FORMATS
Currently two files are needed to make it work.

(1) The corpus JSONL.  Each line is one JSON object with two keys:
 - docid  (string)
 - text  (string)

(2) The topic model JSON.  One file is just one big JSON with a bunch of keys.
See myapp/src/models.ts:TopicModelInfo.


todo: will need to decide on a tokenization representation (ideally
reversible) and perhaps stuff it into the corpus JSONL?
Necessary for token highlighting (unless we retokenize inside the app. ugh.).

todo: need a better way, config-level, to specify the files.

