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
  selectedTopic?: number;
}

class App extends React.Component<{},AppState> {
  
  constructor(props:any) {
    super(props);
    this.state = {
      corpusUrl:    "tmrun/sotu/sotu.phrases.jsonl",
      topicModelUrl:"tmrun/sotu/sotu.tm10.tminfo.json"
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
    console.log("APP render");
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
<div>
  {this.state.corpus && this.state.corpus.numDocs()} docs
</div>
<table className="LayoutTable"><tbody><tr>
  <td style={{verticalAlign:"top"}}>
    <TopicWordList app={this} topicModel={this.state.topicModel} selectedTopic={this.state.selectedTopic} />
  </td>
  <td style={{verticalAlign:"top"}}>
    <DocList app={this} selectedTopic={this.state.selectedTopic} />
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
    if (this.props.corpus==null || this.props.docid==null) {
      return <div className="DocViewer container"></div>;
    }
    let doc = this.props.corpus.docid2doc[this.props.docid];
    let text = doc ? doc.text : "";
    return (
      <div className="DocViewer container">
        <i>Document {this.props.docid}</i>
        <br/><br/>
        <div className="DocViewer content">
        {text}
        </div>
      </div>
    );
  }

}

