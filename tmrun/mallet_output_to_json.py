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
# doc2id,id2doc={},[]

n_topic_word = Counter()
n_topic_doc = Counter()
n_topic = Counter()

for line in gzip.open(tmstate_filename):
    if line.startswith("#"): continue
    docid, doc, pos, wordid, word, topic = line.split()
    topic=int(topic)
    n_topic_word[topic,word] += 1
    n_topic_doc[topic,doc] += 1
    n_topic[topic] += 1
    if word not in word2id:
        word2id[word] = len(word2id)
        id2word.append(word)
num_topics = len(n_topic)
# n_topic = [n_topic[k] for k in xrange(num_topics)]
# n_topic_word = [  
#     [n_topic_word[k,id2word[w]] for w in xrange(len(id2word))]
#     for k in xrange(num_topics)]
print num_topics, n_topic

out = {}
out['num_topics'] = num_topics
out['n_topic'] = dict(n_topic)
out['n_topic_word'] = dict(n_topic_word)
out['n_topic_doc'] = dict(n_topic_doc)
out['vocab'] = id2word

with open(outfilename,'w') as outfile:
    json.dump(out, outfile, indent=4)
