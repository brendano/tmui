// import {Promise} from 'es6-promise';
import axios, {AxiosResponse} from 'axios';
import * as utils from './utils';
import * as _ from 'lodash';
// import { defaultCoreCipherList } from 'constants';
// import wait from 'wait.for-es6';
// var wait=require('wait.for-es6');


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
  readonly doclengths:object;
  readonly vocab:string[];

  constructor(data:TopicModelInfo) {
    // should i use .keys() or something else?
    for (let key in data) {
      this[key] = data[key];
    }
  }
  
  public docTopicProbs(docid:string) {
    if (!this.doclengths[docid]) {
      return new Float32Array(this.num_topics).fill(0);
    }
    let probs = new Float32Array(this.num_topics);
    let N = this.doclengths[docid];
    if (N==0) return probs.fill(1/this.num_topics);
    for (let k=0; k<this.num_topics; k++) {
      probs[k] = (this.n_topic_doc_dicts[k][docid] || 0.0) / N;
    }
    
    if ( Math.abs(utils.arraysum(probs) - 1) > 1e-5) throw "normalization error";
    return probs;
  }

  public topicGlobalProb(topic:number) {
    let Ncorpus = utils.arraysum(this.n_topic);
    return this.n_topic[topic]/Ncorpus;
  }

  topicWords(topic:number, topk:number): string[] {
    let wc = this.n_topic_word_dicts[topic];
    let words = this.vocab.filter( (w)=>wc[w] && wc[w]>0);
    let scorefn = (w) => -wc[w];  // prob ranking .. or could use pmi, hpmi...
    words = _.sortBy(words, scorefn);
    words = words.slice(0,topk);
    return words;
  }

}

export * from './models';
