from __future__ import division
import phrasemachine
import phrasehelp
import re,os
# import chardet

outdir = "pages"
os.system("mkdir -p %s" % outdir)

alltext = open("Bipartisan Budget Act of 2018.txt").read()
parts = alltext.split("\x0C")  # Ctrl-L linefeed
for i,part in enumerate(parts):
    print "%d of %d" % (i, len(parts)), 
    text = part.decode("utf8","replace")
    text = phrasehelp.text_to_legacy_token_output(text, tagger='spacy')
    outfile = "%s/%04d.txt" % (outdir,i)
    print "=>",outfile
    print>>open(outfile, 'w'), text.encode("utf8")
