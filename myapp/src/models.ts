// import {Promise} from 'es6-promise';
import axios, {AxiosResponse} from 'axios';
import * as utils from './utils';
import * as _ from 'lodash';
// import { defaultCoreCipherList } from 'constants';
// import wait from 'wait.for-es6';
// var wait=require('wait.for-es6');

// >>> print json.dumps(nltk.corpus.stopwords.words("english"))
const ENGLISH_STOPWORDS = new Set(["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven", "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren", "won", "wouldn"]);


export class Corpus {
  docid2doc: object = {};
  doclist: Document[] = [];
  constructor() {
  }
  numDocs() {
    return this.doclist.length;
  }
}

export interface Document {
  docid: string;
  text?: string;
  tokens?: string[];  // intended for non-reversible list of non-WS tokens. but could accomodate WS tokens too?
  tokensSpacyStyle?: TokenSpacyStyle[];
  tokensCoreNLPStyle?: TokenCoreNLPStyle[];
}

/* Try to use key names same as to Spacy API. They use trailing underscores for string versions; without trailing underscore are integer (hash) versions.  Or is this not worth trying to be consistent with? */
export interface TokenSpacyStyle {
  text: string;
  whitespace_: string;  // trailing whitespace on the right
  pos_?: string; // coarse POS tag
  tag_?: string; // fine-grained POS tag
}

/** Key names same are CoreNLP json output from e.g. curl --data "The man wanted to go to work." 'http://localhost:9000/?properties={%22annotators%22%3A%22tokenize%2Cssplit%2Cpos%22}' 
 */
export interface TokenCoreNLPStyle {
  originalText?: string;
  word?: string;
  lemma?: string;
  pos?: string;  // i guess this is PTB-style, fine-grained tag
  after?: string; //whitespace after this token
  before?: string; //whitespace before this token. i guess this is repetitive?
  characterOffsetBegin?: number;
  characterOffsetEnd?: number;

}

/* this function is a bad idea */
export function sleep(milliseconds:number) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

export async function loadCorpus(url:string) {
  return axios.get(url)
    .then(function (resp: AxiosResponse) {
      let cc = new Corpus();
      let ss = resp.data;
      let parts = ss.split("\n");
      for (let line of parts) {
        line=line.trim();
        if (line.length==0) continue;
        let doc = JSON.parse(line);
        cc.doclist.push(doc);
        // todo need to use a real dict structure. ideally we would do the following check, but it will fail if a docid is e.g. "toString"
        // if (cc.docid2doc[doc.docid] !== undefined) {
        //     throw "docid duplicated: " + doc.docid;
        // }
        cc.docid2doc[doc.docid] = doc;
      }
      return cc;
    });
}

export async function loadTopicModel(url:string) {
  let a = await axios.get(url);
  let c = new TopicModel(a.data);
  console.log(`loaded TM numtopics ${c.num_topics} topic sizes ${c.n_topic}`);
  return c;
}

export interface TopicModelInfo {
  readonly num_topics: number;  // the number of topics
  readonly n_topic: number[];   // list (length num_topics): global token count per topic
  readonly doclengths: object;  // (docid as string) => num tokens in that doc
  readonly vocab: string[];     // model vocabulary as a list of strings.

  // need to give either count (n_) or probability (p_) versions
  // count-based versions designed for collapsed inference (e.g. CGS)

  // list (length num_topics) => (docid as string) => topic's count in that doc 
  // n_topic_doc_dicts[3]["dog"] = num instances of 'dog' under topic 3
  readonly n_topic_doc_dicts?: Array<Map<string,number>>;
  
  // list (length num_topics) => (word as string) => word's count in that topic 
  // n_topic_doc_dicts[3]["doc0050"] = num tokens of topic 3 in doc0050
  readonly n_topic_word_dicts?: Array<Map<string,number>>;

  // list (length num_topics) => (docid as string) => topic's prob in that doc 
  // p_topic_doc_dicts[3]["doc0050"] = P(z=3 | d=doc0050)
  readonly p_topic_doc_dicts?: Array<Map<string,number>>;
  // list (length num_topics) => (word as string) => word's prob in that topic 
  // p_topic_word_dicts[3]["dog"] = P(w=dog | z=3)
  readonly p_topic_word_dicts?: Array<Map<string,number>>;
}

export class TopicModel implements TopicModelInfo {
  readonly num_topics:number;
  readonly n_topic:number[];
  readonly n_topic_word_dicts: Array<Map<string,number>>;
  readonly n_topic_doc_dicts: Array<Map<string,number>>;  
  docTopicProbsCache: Map<string,Float32Array>;
  readonly doclengths:object;
  readonly vocab:string[];
  vocab_set:Set<string> = new Set();
  word_total_counts;
  token_total_count:number;

  constructor(data:TopicModelInfo) {
    // should i use .keys() or something else?
    for (let key in data) {
      this[key] = data[key];
    }
    this.docTopicProbsCache = new Map();

    for (let w of this.vocab) {
      this.vocab_set.add(w);
    }
    this.token_total_count = utils.arraysum(this.n_topic);
    this.word_total_counts = {};
    this.vocab.forEach((w) => {
      let Nw = utils.arraysum(_.range(this.num_topics).map((k) => (this.n_topic_word_dicts[k][w] || 0) ));
      // console.log(w + " " + Nw);
      this.word_total_counts[w] = Nw;
    });
  }
  
  public docTopicProbs(docid:string) {
    if (this.docTopicProbsCache.has(docid)) {
      return this.docTopicProbsCache.get(docid);
    }
    if (!this.doclengths[docid]) {
      // console.log("unseen docid " + docid);
      let r = new Float32Array(this.num_topics).fill(0);
      this.docTopicProbsCache.set(docid,r);
      return r;
    }
    let probs = new Float32Array(this.num_topics);
    let N = this.doclengths[docid];
    if (N==0) return probs.fill(1/this.num_topics);
    for (let k=0; k<this.num_topics; k++) {
      probs[k] = (this.n_topic_doc_dicts[k][docid] || 0.0) / N;
    }
    if ( Math.abs(utils.arraysum(probs) - 1) > 1e-5) throw "normalization error";
    this.docTopicProbsCache[docid] = probs;
    return probs;
  }

  public docsetTopicProbs(docids:string[]) {
    let probs = new Float32Array(this.num_topics).fill(0);
    // accumulate counts actually
    for (let docid of docids) {
      if (!this.doclengths[docid]) continue;
      for (let k=0; k<this.num_topics; k++) {
        probs[k] += this.n_topic_doc_dicts[k][docid];
      }
    }
    utils.arraynormalize_inplace(probs);
    return probs;

  }

  public wordGlobalProb(word:string) {
    return this.word_total_counts[word] / this.token_total_count;
  }

  public topicGlobalProb(topic:number) {
    return this.n_topic[topic]/this.token_total_count;
  }

  public topicWords(topic:number, topk:number, {rankFormula, countThreshold}): string[] {
    let wc = this.n_topic_word_dicts[topic];
    let words = this.vocab.filter( (w)=>wc[w] && wc[w]>0);
    let ct:number = countThreshold || 1;
    words = words.filter((w) => this.word_total_counts[w] >= ct);

    let scorefn;
    rankFormula = rankFormula || "hpmi";
    if (rankFormula=="prob") {
      scorefn = (w) => -wc[w];
    }
    else if (rankFormula=="hpmi") {
      // p(w,k)*PMI(w,k) \propto p(w|k)*PMI(w,k)  "half-pmi"
      scorefn = (w) => {
        // if (wc[w]==0) return 999;
        let p_w = this.wordGlobalProb(w);
        let p_w_k = wc[w]/this.n_topic[topic];
        // let p_wk = wc[w]/this.token_total_count;
        return -p_w_k*Math.log(p_w_k/p_w);
      };
    }
    else if (rankFormula=="pmi") {
      // p(k|w) aka PMI ranking, with thresholding
      scorefn = (w) => {
        let Nw = this.word_total_counts[w];
        if (Nw < ct) return 0;
        return -wc[w]/Nw;
      };
    }
    else {
      throw "bad formula option: " + rankFormula
    }
    words = _.sortBy(words, scorefn);
    // words = words.slice(0,topk);
    // words = ranked_phrase_merge(words, topk);
    words = ranked_phrase_merge(words, -1, (retlist:string[])=> 
      utils.arraysum(retlist.map((w)=>1+w.length)) >= 100 );
    return words;
  }

  topicWordProb(topic:number, word:string):number {
    // add pseudocounts?
    let numer = this.n_topic_word_dicts[topic][word];
    let denom = this.n_topic[topic];
    if (denom <= 0) {
      return this.wordGlobalProb(word);
    }
    return numer / denom;
  }

  /** for figuring it out post-hoc. ideally we should have instead taken this as input from the topic model inference.
   */
  public inferTokenTopics(docid:string, word:string): Float32Array {
    let prior = this.docTopicProbs(docid); // technically speaking it should use theta as prior... in the Gibbs sampler this is actually poserior proportion mean, not the theta prior.
    if (!this.vocab_set.has(word)) return prior
    let posterior = (new Float32Array(this.num_topics)).fill(0);
    for (let k=0; k<this.num_topics; k++) {
      posterior[k] = prior[k] * this.topicWordProb(k,word);
    }
    utils.arraynormalize_inplace(posterior);
    return posterior;
  }

}

/** Take in RANKED (leftmost is highest) list of phrases (assuming underscore separator).
 * Return num_desired phrase clusters, where each cluster is a connected component of input terms
 * that share a non-stopword.
 */
export function ranked_phrase_merge(wordlist:string[],  num_desired: number,
  is_done_yet?: Function
) {
  // Build up a ranked list of term clusters to return.
  // ES6 Map is supposed to preserve insertion order, so we can use that.
  // Note we will sometimes delete things from this list.
  let resultlist = new Map<number,Set<string>>();

  // For each cluster, have to choose a single string representation
  let getReturnList = () => Array.from(resultlist.values()).map( (cluster:Set<string>) => {
    return _.sortBy(Array.from(cluster), (term) => -term.length)[0];
  });
  let isDone = () => (
    is_done_yet!==undefined ? is_done_yet(getReturnList()) :
    resultlist.size >= num_desired
  );
  let get_uniset = (term) => new Set(term.split("_").filter((w)=> !ENGLISH_STOPWORDS.has(w)));
  // let get_uniset = (term) => new Set(term.split("_"));

  for (let i=0; i<wordlist.length; i++) {
    let cur_w = wordlist[i];
    let cur_uniset = new Set(get_uniset(cur_w));

    // find all previous clusters the current term matches.
    // then merge all of them into the highest-ranked one.
    let matches = Array.from(resultlist.entries()).filter(
      ([prev_i, prev_cluster]) => 
        Array.from(prev_cluster).some((prev_w) => {
          let prev_uniset = get_uniset(prev_w);
          return utils.setintersect(prev_uniset, cur_uniset).size > 0;
        })
    );
    if (matches.length==0) {
      resultlist.set(i, new Set([cur_w]));
    }
    else {
      // merge.  set new cluster at position of highest-ranked match
      let newclus = utils.setunion_many(matches.map(([prev_i, prev_cluster]) => prev_cluster));
      newclus.add(cur_w);
      let new_i = matches[0][0];
      resultlist.set(new_i, newclus);
      // delete all non-highest, now-merged old clusters
      matches.slice(1,matches.length).forEach( ([prev_i, prev_cluster]) => {
        resultlist.delete(prev_i);
      });
    }
    // stop if we've passed the end criterion.
    // slightly better might be to finish up the last cluster.
    if (isDone()) {
      break;
    }
  }
  return getReturnList();
}

export * from './models';
