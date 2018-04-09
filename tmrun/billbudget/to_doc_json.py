## First basic stage of preprocessing
## should we formalize this as a preferred pre-NLP-preproc corpus format?
import os,sys,json

alltext = open("Bipartisan Budget Act of 2018.txt").read()
parts = alltext.split("\x0C")  # Ctrl-L linefeed

with open("billparts.jsonl",'w') as outfile:
    for i,part in enumerate(parts):
        text = part.decode("utf8","replace")
        print>>outfile, json.dumps({'docid': "page%d" % i, 'text':text})
print "Saved %d docs to %s" % (len(parts), outfile)
