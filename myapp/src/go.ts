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
    console.log(k + " || " + d.topicWords(k,10));
  }
  // console.log(JSON.parse(b));
  // let c:TopicModelInfo = b;
  // console.log(c);
  // console.log(a.data);
}

f2();
