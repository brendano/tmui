import * as models from './models';
import {TopicModelInfo} from './models';
import axios, {AxiosResponse} from 'axios';

async function f1() {
  let c = await models.loadCorpus("http://localhost:3000/tmrun/billbudget/sample");
  console.log(c.numDocs());    
}

async function f2() {
  let a = await axios.get("http://localhost:3000/tmrun/out1.tminfo.json");
  let b = await a.data;
  let c:TopicModelInfo = b;
  let d:models.TopicModel = new models.TopicModel(b);
  console.log(d.num_topics);
  console.log(d.docTopicProbs("billbudget/billparts.phrases.malletdir/page138.txt"));
  for (let k=0; k<d.num_topics; k++) {
    // console.log(k + " || " + d.topicWords(k,10));
  }
  // console.log(JSON.parse(b));
  // let c:TopicModelInfo = b;
  // console.log(c);
  // console.log(a.data);
}

// f2();

function f3() {
  console.log(models.ranked_phrase_merge([ "A", "B"], 99));
  console.log(models.ranked_phrase_merge([ "A", "B", "A_B"], 99));
  console.log(models.ranked_phrase_merge([ "A", "B", "C", "D", "B_D"], 99));
  console.log(models.ranked_phrase_merge([ "A", "B", "C", "D", "B_D", "C_D"], 99));
}
// f3()


function f4() {
  // check that instance member initialization before the constructor indeed gives separate things
  let m = new models.TopicModel({num_topics:0,n_topic:[],doclengths:{},vocab:[],n_topic_word_dicts:[], n_topic_doc_dicts:[]});
  console.log(m.vocab_set);
  m.vocab_set.add("ASDSF");
  console.log(m.vocab_set);
  let m2 = new models.TopicModel({num_topics:0,n_topic:[],doclengths:{},vocab:[],n_topic_word_dicts:[], n_topic_doc_dicts:[]});
  console.log(m2.vocab_set);

}
f4();