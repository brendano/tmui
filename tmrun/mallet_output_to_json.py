from __future__ import division
import phrasehelp
from collections import defaultdict, Counter, OrderedDict
from pprint import pprint
# import numpy as np
import sys,re,gzip,json

tmstate_filename=sys.argv[1]
assert tmstate_filename.endswith(".gz")
outfilename = tmstate_filename.replace(".tmstate.gz","") + ".tminfo.json"
print "%s => %s" % (tmstate_filename, outfilename)

word2id,id2word={},[]
docname2docnum = {}  ## mallet's notion of docname and their integer docnum.  what we're calling their docname is very similar to what our app calls a docid.
doclengths = Counter() # index by docname

n_topic_word = Counter()
n_topic_doc = Counter()
n_topic = Counter()

seen_docs = set()

for i,line in enumerate(gzip.open(tmstate_filename)):
    # if i>10000:break
    if line.startswith("#"): continue
    docnum, docname, pos, wordid, word, topic = line.split()
    docnum=int(docnum)
    # mallet docname is a full file path. revise to just the docid,
    # assuming  convention of DOCID.txt
    docname = docname.split("/")[-1].replace(".txt","")
    if docname not in docname2docnum:
        docname2docnum[docname] = docnum
    topic=int(topic)
    n_topic_word[topic,word] += 1
    n_topic_doc[topic,docname] += 1
    n_topic[topic] += 1
    doclengths[docname] += 1
    if word not in word2id:
        word2id[word] = len(word2id)
        id2word.append(word)
num_docs = len(docname2docnum)
num_topics = len(n_topic)
assert set(xrange(num_topics)) == set(n_topic.keys())

# n_topic = [n_topic[k] for k in xrange(num_topics)]
n_topic_word_dicts = [  
    {w:n_topic_word[k,w] for w in id2word if n_topic_word[k,w]}
    for k in xrange(num_topics)]
n_topic_doc_dicts = [
    {docname:n_topic_doc[k,docname] for docname in docname2docnum if n_topic_doc[k,docname]}
    for k in xrange(num_topics)]

out = {}
out['num_topics'] = num_topics
out['n_topic'] = [n_topic[k] for k in xrange(num_topics)]
out['n_topic_word_dicts'] = n_topic_word_dicts
out['n_topic_doc_dicts'] = n_topic_doc_dicts
out['doclengths'] = dict(doclengths)
out['vocab'] = id2word

with open(outfilename,'w') as outfile:
    json.dump(out, outfile, indent=4)
