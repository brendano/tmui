import App, * as A from './App';
import * as models from './models';
import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table, AutoSizer, CellMeasurer, Grid } from 'react-virtualized';
import * as d3 from 'd3';
import * as _ from 'lodash';
import './App.css';

interface DocListState {
  explicitTopicThreshold?: number;
  explicitTopicThresholdString: string;
  // predicate: "filter" | "order";
  predicate: string;
  topicProbVisMode: "numbers" | "shapes";
}

interface DocListProps {
  app: App;
  selectedTopic:number;
}

let MINIMUM_TOPIC_THRESH:number = 0.01;

export class DocList extends React.Component<DocListProps,DocListState> {
  docListCache: Map<string,models.Document[]>;

  constructor(props) {
    super(props);
    console.log("DL consructor");
    this.state = {predicate:"order", explicitTopicThreshold:0.50, explicitTopicThresholdString:"0.50",
      topicProbVisMode:"numbers"
    };
    this.docListCache = new Map();
  }

  getDocListCacheKey() {
    return `${this.state.predicate} ${this.state.explicitTopicThreshold} ${this.props.selectedTopic}`;
  }

  curdoclist() {
    // console.log("curdoclist");
    if (this.docListCache.has(this.getDocListCacheKey())) {
      return this.docListCache.get(this.getDocListCacheKey());
    }
    console.log("curdoclist not cached: " + this.getDocListCacheKey());
    let app:App = this.props.app;
    let doclist:models.Document[] = app.state.corpus ? app.state.corpus.doclist : [];
    if (this.props.selectedTopic != null) {
      let k = this.props.selectedTopic;
      let tm=this.topicModel();
      let thresh = (this.state.predicate=="filter") ? this.state.explicitTopicThreshold
        : (this.state.predicate=="order") ? MINIMUM_TOPIC_THRESH : null;
      if (thresh==null) throw "threhsold bug";
      doclist = doclist.filter((d) => tm.docTopicProbs(d.docid)[k] >= thresh );
      if (this.state.predicate=="order") {
        doclist = _.sortBy(doclist, (d) => -tm.docTopicProbs(d.docid)[k])
      }
    }
    this.docListCache.set(this.getDocListCacheKey(), doclist);
    return doclist;
  }
  topicModel() {
    let app:App = this.props.app;
    return app.state.topicModel;
  }
  topicProbCellRenderer = ({rowData}) => {
    if (!this.topicModel()) return "";
    let doc:models.Document = rowData;
    let probs = this.topicModel().docTopicProbs(doc.docid);
    let prob_ks = Array.from(probs).map((prob,k)=> [prob,k]).filter(([p,k])=>p>0);
    prob_ks = _.sortBy(prob_ks, ([p,k])=> -p);
    if (this.state.topicProbVisMode=="numbers") {
      return prob_ks.map( ([prob,k],i)=>
        <span className="docTopicProb" style={{color:A.topicColor(k)}} key={k}>
          <span className="topicNum">{k}:</span>
          <span className="topicProb">{(Math.max(prob,0.01)*100).toFixed(0)}%</span>
        </span>);
    }
    else if (this.state.topicProbVisMode=="shapes") {
      return "todo";
    }
    throw "error";
  }
  render() {
    // console.log("DOCLIST render");
    let width = 300;
    let app:App = this.props.app;
    let doclist = this.curdoclist();
    let k=this.props.selectedTopic;
    let topinfo = [];
    if (this.props.selectedTopic == null) {
      topinfo.push(<span>by corpus order</span>);
    }
    else {
      topinfo.push(<select value={this.state.predicate}
          onChange={(e)=>this.setState({predicate: e.target.value}) } >
        <option value="order">ordered by</option>
        <option value="filter">filtered to</option>
      </select>);
      topinfo.push(<span style={{color:A.topicColor(k)}}>&nbsp;topic {k}</span>);
      if (this.state.predicate=="order") {
        topinfo.push(<span>&nbsp;with proportion at least 1%</span>);
      }
      else if (this.state.predicate=="filter") {
        topinfo.push(<span>
          &nbsp;with proportion at least
            <input type="text" style={{width:"5ch"}} value={this.state.explicitTopicThresholdString}
              onChange={(e) => {
                this.setState({explicitTopicThresholdString:e.target.value});
                let x:number = parseFloat(e.target.value);
                if (isFinite(x)) {
                  this.setState({explicitTopicThreshold:x})
                } else {
                  this.setState({explicitTopicThreshold:0.01})
                }
              }}
            />
        </span>);
      }
      else {
        throw "bad predicate value: " + this.state.predicate;
      }
    }
    return <div style={{width:width}}>
      <span style={{minWidth:"5ch", display:"inline-block", textAlign:"center"}}>{doclist.length}</span> documents {topinfo}
      <Table
        className="DocList"
        width={300}
        height={500}
        headerHeight={20}
        rowHeight={20}
        rowCount={doclist.length}
        rowGetter={({index}) => {
          let doclist = this.curdoclist();
          // if( ! (index < doclist.length)) throw "Wtf";
          return doclist[index];
        }}
        onRowClick={({ event, index, rowData }) => {
          // rowData is a Document but the type system doesn't recognize it. i'm using this wrong?
          app.setState({docidSelection: rowData["docid"]});
        }}
      >

        <Column label="Topics" dataKey="NA" width={200}
          cellDataGetter={(x) => null}
          cellRenderer={this.topicProbCellRenderer}
          />
        <Column label="Docid" dataKey="docid" width={100} />
      
      </Table>;
    </div>
  }
}
