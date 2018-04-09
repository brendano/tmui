# happy helpers for phrasemachine
import phrasemachine
import json,sys,os
from collections import defaultdict, Counter, OrderedDict
import nltk
STOPWORDS = set(nltk.corpus.stopwords.words("english"))

def unicodify(s):
    if isinstance(s,unicode): return s
    if isinstance(s,str): return s.decode("utf8","replace")
    return unicode(s)

def stringify(s):
    if isinstance(s,str): return s
    if isinstance(s,unicode): return s.encode("utf8")
    return str(s)

def text_to_legacy_token_output(text, **phrasemachine_opts):
    """
    Augment the text with phrases and return it AS TEXT (unicode object).
    Designed for things like Mallet which expect just a bunch of tokens.
    Recommendation: use option tagger='spacy'
    """

    text = unicodify(text)

    phrasecounts = phrasemachine.get_phrases(text, output=['counts','tokens'], **phrasemachine_opts)
    phrases = u" ".join(" ".join([w.replace(" ","_")]*c) for w,c in phrasecounts['counts'].most_common(999999))
    out = [text]
    out.append("\n")
    out.append(phrases)
    return u"\n".join(out)

def phrase_merge2(topic_word_weightvec, desired_num, id2word):
    """
    Does dynamic merging of overlapping phrases to show a ranked list that's desired_num terms long.  It actually builds up a list of **term clusters**, each consisting of all terms that share at least one non-stopword.
    builds internal representation {resultposition: [(termstr, {set of unigrams in termstr}), ...] }
    the key (a list of pairs) is a "cluster"
    """
    resultlist = OrderedDict()
    order = (-topic_word_weightvec).argsort()
    for i in order:
        cur_w = id2word[i]
        cur_uniset = set(cur_w.split("_")) - STOPWORDS
        matches = [(i2,c) for (i2,c) in resultlist.items() \
                if any((prev_uniset & cur_uniset) for (prev_w,prev_uniset) in c)]
        # matches=[]
        if not matches:
            resultlist[i] = [(cur_w,cur_uniset)]
        elif matches:
            for (i2,c2) in matches[1:]:
                assert isinstance(matches[0][1], list)
                matches[0][1].extend(c2)
            matches[0][1].append((cur_w,cur_uniset))
            for (i2,c2) in matches[1:]:
                del resultlist[i2]
        if len(resultlist) >= desired_num:
            break
    return resultlist.values()

def pick_from_cluster(cluster):
    cc = list(enumerate(cluster[:]))
    cc.sort(key=lambda (i,(w,uniset)): (-len(uniset),i))
    i, (w,uniset)= cc[0]
    return w


def add_phrases(corpus_jsonl_filename, output_jsonl_filename=None):
    """Run phrasemachine and create a new phrase-enhanced JSONL corpus"""
    if not output_jsonl_filename:
        output_jsonl_filename = corpus_jsonl_filename.replace(".jsonl","") + ".phrases.jsonl"
    print "Adding phrases %s => %s" % (corpus_jsonl_filename, output_jsonl_filename)
    def procdoc(doc):
        phrasecounts = phrasemachine.get_phrases(doc['text'], output=['counts','tokens'], tagger='spacy')
        doc['tokens'] = phrasecounts['tokens']
        doc['phrase_counts'] = dict(phrasecounts['counts'])

    with open(output_jsonl_filename, 'w') as outfile:
        for i,line in enumerate(open(corpus_jsonl_filename)):
            doc = json.loads(line)
            procdoc(doc)
            print>>outfile, json.dumps(doc)
    print "Processed %s docs (records/lines)" % i
    return output_jsonl_filename

def make_mallet_dir(corpus_jsonl_filename, output_dir=None):
    if not output_dir:
        output_dir = corpus_jsonl_filename.replace(".jsonl","") + ".malletdir"
    print "%s => %s/" % (corpus_jsonl_filename, output_dir)
    os.system("mkdir -p %s" % output_dir)
    for i,line in enumerate(open(corpus_jsonl_filename)):
        doc = json.loads(line)
        text = doc['text']
        if 'phrase_counts' in doc:
            phrasetext = u" ".join(" ".join([w.replace(" ","_")]*c) for w,c in doc['phrase_counts'].items())
            text += "\n\n" + phrasetext
        with open("%s/%s.txt" % (output_dir, doc['docid']), 'w') as outfile:
            print>>outfile, text.encode("utf8")
    print "Wrote %s files" % i
    return output_dir

if __name__=='__main__':
    eval(sys.argv[1])(*sys.argv[2:])
