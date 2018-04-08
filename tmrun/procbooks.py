import phrasemachine
import re,sys,os
# import chardet

outdir = sys.argv[1]
files = sys.argv[2:]
os.system("mkdir -p %s" % outdir)
print "OUTPUT TO",outdir

d = 10
for i in range(0,len(files),d):
    batch = files[i:i+d]
    print "BATCH",i,batch
    alltext = "\n\n".join(open(f).read() for f in batch)
    alltext = alltext.decode("utf-8","ignore")
    # phrases="";words=""
    phrasecounts = phrasemachine.get_phrases(alltext, tagger='spacy', output=['counts','tokens'])
    phrases = u" ".join(" ".join([w.replace(" ","_")]*c) for w,c in phrasecounts['counts'].most_common(999999))
    words = u" ".join(phrasecounts['tokens'])

    print>>open("%s/batch%04d.txt" % (outdir,i),'w'), phrases.lower().encode("utf8"), words.lower().encode("utf8")
