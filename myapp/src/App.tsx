import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table, AutoSizer, CellMeasurer, Grid } from 'react-virtualized';
import * as d3 from 'd3';
import * as _ from 'lodash';
import './App.css';
import {DocList} from './DocList';
import {TopicWordList} from './TopicWordList';
import {DocViewerSimple} from './DocViewer';
import * as models from './models';
import axios, {AxiosResponse} from 'axios';

interface AppState {
  corpusUrl: string;
  topicModelUrl?:string;
  corpus?: models.Corpus;
  topicModel?: models.TopicModel;
  docidSelection?: string;
  selectedTopic?: number;
}

class App extends React.Component<{},AppState> {
  
  constructor(props:any) {
    super(props);
    this.state = {
      corpusUrl:    "should_not_be_used_corpus.jsonl",
      topicModelUrl:"should_not_be_used_tminfo.json",
    };
    this.constructorStuff();
  }
  async constructorStuff() {
    await this.loadConfig();
    console.log("about to loadcorpus");
    await this.loadCorpus();
    await this.loadTopicModel();
  }

  async loadConfig() {
    console.log("loadconfig start");
    let config = await this.fetchConfig();
    if (config===null) {
      // show error in ui?
    } else {
      this.setState({corpusUrl: config.corpusUrl, topicModelUrl: config.topicModelUrl  });
    }
  }
  async fetchConfig() {
    let config = await axios.get("config.json")
    .then((resp:AxiosResponse) => {
      return resp.data;
    })
    .catch((r) => {
      console.log("ERROR " + r);
      return null;
    });
    console.log("config:");
    console.log(config);
    return config;
  }
  async loadCorpus() {
    this.setState({corpus: await models.loadCorpus(this.state.corpusUrl)});  
  }
  async loadTopicModel() {
    this.setState({topicModel: await models.loadTopicModel(this.state.topicModelUrl)});
  }
  handleChangeCorpus = (e) => {
    // using this syntax, don't have to worry about .bind() to get 'this' right?
    this.setState({corpusUrl: e.target.value});
    this.loadCorpus();
  }
  handleChangeTM = (e) => {
    // using this syntax, don't have to worry about .bind() to get 'this' right?
    this.setState({topicModelUrl: e.target.value});
    this.loadTopicModel();
  }

  render() {
    return (
<div className="App">
<header className="App-header">
</header>
<form onSubmit={(e)=>{e.preventDefault()}}>
  Corpus: <input style={{width:"200px",border:"1px solid gray"}} type="text" name="corpus_url" value={this.state.corpusUrl} onChange={this.handleChangeCorpus} />
  Topic Model: <input style={{width:"200px",border:"1px solid gray"}} type="text" name="tm_url" value={this.state.topicModelUrl} onChange={this.handleChangeTM} />
  <br/>
  <input type="submit" value="Update settings" />
</form>
<table className="LayoutTable"><tbody><tr>
  <td style={{verticalAlign:"top"}}>
    <TopicWordList app={this} topicModel={this.state.topicModel} selectedTopic={this.state.selectedTopic} />
  </td>
  <td style={{verticalAlign:"top"}}>
    <DocList app={this} selectedTopic={this.state.selectedTopic} />
  </td>
  <td style={{verticalAlign:"top"}}>
    <DocViewerSimple corpus={this.state.corpus} docid={this.state.docidSelection} />
  </td>
</tr></tbody></table>
</div>
    );
  }
}

export default App;

export function topicColor(k:number) {
  let xx = d3.schemeCategory10;
  return xx[k % xx.length];

}
