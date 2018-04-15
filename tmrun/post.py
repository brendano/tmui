"""
Post-process Mallet tmstate output to view topics.
This was more of a test that I understood the tmstate format if anything.
"""
from __future__ import division
import phrasehelp
from collections import defaultdict, Counter, OrderedDict
from pprint import pprint
import numpy as np
import sys,re,gzip

word2id,id2word={},[]
doc2id,id2doc={},[]

n_topic_word = Counter()
n_topic_doc = Counter()
n_topic = Counter()

filename=sys.argv[1]
for line in gzip.open(filename):
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
n_topic_array = np.array([n_topic[k] for k in xrange(num_topics)])
n_topic_word_array = np.array([  
    [n_topic_word[k,id2word[w]] for w in xrange(len(id2word))]
    for k in xrange(num_topics)])
print num_topics, n_topic_array

# better order? maybe?
from sklearn.decomposition import PCA
xx=n_topic_word_array
xx=xx/xx.sum(1)[np.newaxis].T
xx=np.log1p(xx)
pp=PCA(1).fit(xx.T)
for k in pp.components_[0].argsort():
# for k in (-n_topic_array).argsort():
    print
    print "Topic %s (%s tokens)" % (k, n_topic_array[k])
    wc = np.array([n_topic_word[k,id2word[wid]] for wid in xrange(len(id2word))])
    tops =  (-wc).argsort()[:20]
    # print ", ".join("%s (%s)" % (id2word[wi],wc[wi]) for wi in tops)
    # print ", ".join("%s" % id2word[wi] for wi in tops)
    # pprint(phrase_merge2( wc, 20 ))
    print ", ".join(phrasehelp.pick_from_cluster(c) for c in phrasehelp.phrase_merge2(wc, 20, id2word))


