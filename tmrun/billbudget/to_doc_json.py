## First basic stage of preprocessing
## should we formalize this as a preferred pre-NLP-preproc corpus format?
import os,sys,json,re

alltext = open("Bipartisan Budget Act of 2018.txt").read()
parts = alltext.split("\x0C")  # Ctrl-L linefeed

with open("billparts.jsonl",'w') as outfile:
    for i,part in enumerate(parts):
        text = part.decode("utf8","replace")

        # print "===",i
        # print text
        # text = re.sub(r'\n *\n *(\d{1,4}) *\n *\n', "\n\\1 ", text, re.M)
        text = re.sub(r'\n[ \r\t]*\n[ \r\t]*(\d{1,2})[ \r\t]*\n[ \r\t]*\n', "\n", text, re.M|re.S)
        # print text

        print>>outfile, json.dumps({'docid': "page%d" % i, 'text':text})
print "Saved %d docs to %s" % (len(parts), outfile)
