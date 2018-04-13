import * as models from './models';
import {TopicModelInfo} from './models';
import axios, {AxiosResponse} from 'axios';

async function f1() {
  let c = await models.loadCorpus("http://localhost:8000/tmrun/billbudget/sample");
  console.log(c.numDocs());    
}

async function f2() {
  let a = await axios.get("http://localhost:8000/tmrun/out1.tminfo.json");
  let b = await a.data;
  let c:TopicModelInfo = b;
  // console.log(JSON.parse(b));
  // let c:TopicModelInfo = b;
  // console.log(c);
  // console.log(a.data);
}

f2();
