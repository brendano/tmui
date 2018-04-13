// import {Promise} from 'es6-promise';
import axios, {AxiosResponse} from 'axios';
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

export interface TopicModelInfo {
  num_topics:number;
  n_topic:number;
  n_topic_word_dicts: object[];
  n_topic_doc_dicts: object[];
}

export * from './models';