import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table, AutoSizer, CellMeasurer, Grid } from 'react-virtualized';
import * as d3 from 'd3';
import * as _ from 'lodash';
import './App.css';
import {DocList} from './DocList';
import {TopicWordList} from './TopicWordList';
import * as models from './models';

interface AppState {
  corpusUrl: string;
  topicModelUrl?:string;
  corpus?: models.Corpus;
  topicModel?: models.TopicModel;
  docidSelection?: string;
}

class App extends React.Component<{},AppState> {
  
  constructor(props:any) {
    super(props);
    this.state = {
      corpusUrl: "tmrun/billbudget/billparts.phrases.jsonl",
      topicModelUrl: "tmrun/out1.tminfo.json"
    };
    this.loadCorpus();
    this.loadTopicModel();
  }
  async loadCorpus() {
    this.setState({corpus: await models.loadCorpus(this.state.corpusUrl)});  
  }
  async loadTopicModel() {
    this.setState({topicModel: await models.loadTopicModel(this.state.topicModelUrl)});
  }

  handleChange = (e) => {
    // using this syntax, don't have to worry about .bind() to get 'this' right?
    this.setState({corpusUrl: e.target.value});
    this.loadCorpus();
  }

  render() {
    return (
<div className="App">
<header className="App-header">
</header>
<form onSubmit={(e)=>{e.preventDefault()}}>
  Corpus URL: <input style={{width:"800px",border:"1px solid gray"}} type="text" name="corpus_url" value={this.state.corpusUrl} onChange={this.handleChange} />
  <br/>
  <input type="submit" value="Update settings" />
</form>
<div>
  {this.state.corpus && this.state.corpus.numDocs()} docs
</div>
<table className="LayoutTable"><tbody><tr>
  <td style={{verticalAlign:"top"}}>
      <TopicWordList topicModel={this.state.topicModel} />
  </td>
  <td style={{verticalAlign:"top"}}>
    <DocList app={this} />
  </td>
  <td style={{verticalAlign:"top"}}>
    <DocViewer corpus={this.state.corpus} docid={this.state.docidSelection} />
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

interface DocViewerProps {
  docid:string;
  corpus:models.Corpus;
}

class DocViewer extends React.Component<DocViewerProps,{}> {
  render() {
    let text = null;
    if (this.props.corpus !== undefined) {
      let doc = this.props.corpus.docid2doc[this.props.docid];
      text = doc ? doc.text : "";
    } else {
      text = "";
    }
    return (
      <div className="DocViewer container">
      <div className="DocViewer content">
      {text}
      </div>
      </div>
    );
  }

}

