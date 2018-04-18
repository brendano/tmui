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
  docid: string
  text?: string
  // will it allow more?
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
  readonly num_topics:number;
  readonly n_topic:number;
  readonly n_topic_word_dicts: Array<Map<string,number>>;
  readonly n_topic_doc_dicts: Array<Map<string,number>>;
  readonly doclengths:object;
  readonly vocab:string[];
}

export class TopicModel implements TopicModelInfo {
  readonly num_topics:number;
  readonly n_topic:number;
  readonly n_topic_word_dicts: Array<Map<string,number>>;
  readonly n_topic_doc_dicts: Array<Map<string,number>>;
  docTopicProbsCache: Map<string,Float32Array>;
  readonly doclengths:object;
  readonly vocab:string[];
  word_total_counts;
  token_total_count:number;

  constructor(data:TopicModelInfo) {
    // should i use .keys() or something else?
    for (let key in data) {
      this[key] = data[key];
    }
    this.docTopicProbsCache = new Map();

    this.token_total_count = utils.arraysum(this.n_topic);
    this.word_total_counts = {};
    this.vocab.forEach((w) => {
      let Nw = utils.arraysum(_.range(this.num_topics).map((k) => (this.n_topic_word_dicts[k][w] || 0) ));
      // console.log(w + " " + Nw);
      this.word_total_counts[w] = Nw;
    });
  }
  
  public docTopicProbs(docid:string) {
    if (!this.doclengths[docid]) {
      // console.log("unseen docid " + docid);
      return new Float32Array(this.num_topics).fill(0);
    }
    if (this.docTopicProbsCache.has(docid)) {
      return this.docTopicProbsCache.get(docid);
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

  public wordGlobalProb(word:string) {
    return this.word_total_counts[word] / this.token_total_count;
  }

  public topicGlobalProb(topic:number) {
    let Ncorpus = utils.arraysum(this.n_topic);
    return this.n_topic[topic]/Ncorpus;
  }

  topicWords(topic:number, topk:number, {rankFormula, countThreshold}): string[] {
    let wc = this.n_topic_word_dicts[topic];
    let words = this.vocab.filter( (w)=>wc[w] && wc[w]>0);
    let scorefn;
    rankFormula = rankFormula || "hpmi";

    let ct:number = countThreshold;
    if (ct==0 || ct===undefined || ct===null) ct=1;
    words = words.filter((w) => this.word_total_counts[w] >= ct);

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
    words = ranked_phrase_merge(words, topk);
    return words;
  }

}

/** Take in RANKED (leftmost is highest) list of phrases (assuming underscore separator).
 * Return num_desired phrase clusters, where each cluster is a connected component of input terms
 * that share a non-stopword.
 * 
 */
export function ranked_phrase_merge(wordlist:string[], num_desired:number) {
  // Build up a ranked list of term clusters to return.
  // ES6 Map is supposed to preserve insertion order, so we can use that.
  // Note we will sometimes delete things from this list.
  let resultlist = new Map<number,Set<string>>();

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
    // slightly better would be to fill up the last cluster
    if (resultlist.size >= num_desired) {
      break;
    }
  }
  // For each cluster, have to choose a single string representation
  let ret = Array.from(resultlist.values()).map( (cluster:Set<string>) => {
    return _.sortBy(Array.from(cluster), (term) => -term.length)[0];
  })
  return ret;
}

export * from './models';
