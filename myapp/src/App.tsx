import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table, AutoSizer, CellMeasurer, Grid } from 'react-virtualized';
import * as d3 from 'd3';
import * as _ from 'lodash';
import './App.css';
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
      corpusUrl: "/tmrun/billbudget/billparts.phrases.jsonl",
      topicModelUrl: "/tmrun/out1.tminfo.json"
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

function topicColor(k:number) {
  let xx = d3.schemeCategory10;
  return xx[k % xx.length];

}
interface DocListState {
}

class DocList extends React.Component<any,DocListState> {
  constructor(props) {
    super(props);
    this.state = {selection:null};
  }
  curdoclist() {
    let app:App = this.props.app;
    let doclist = app.state.corpus && app.state.corpus.doclist;
    doclist = doclist || [];
    return doclist;
  }
  topicModel() {
    let app:App = this.props.app;
    return app.state.topicModel;
  }
  topicProbCellRenderer = ({rowData}) => {
    let doc:models.Document = rowData;
    let probs = this.topicModel().docTopicProbs(doc.docid);
    let x = Array.from(probs).map((prob,k)=> [prob,k])
      .filter(([p,k])=>p>0);
    let s = _.sortBy(x, ([p,k])=> -p)
      .map( ([prob,k],i)=>
          <span className="docTopicProb" style={{color:topicColor(k)}}>
            <span className="topicNum">{k}:</span>
            <span className="topicProb">{(Math.max(prob,0.01)*100).toFixed(0)}%</span>
          </span>
      );
    return s;
  }
  render() {
    let app:App = this.props.app;
    let doclist = this.curdoclist();
    // console.log(doclist.map((x) => x!==undefined && x!==null ? "ok" : x));

    return <Table
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
  }
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

interface TopicWordListProps {
  topicModel:models.TopicModel;
}
interface TopicWordListState {
  selected_topic: number;
}
class TopicWordList extends React.Component<TopicWordListProps,TopicWordListState> {
  state={selected_topic:null};
  renderTopicWords = ({rowData:index}) => {
    console.log("RTW " + index);
    let topic = index;   // todo change when resortable
    let tm = this.props.topicModel;
    if (!tm) return "";
    
    return <div className="TopicWords" key={"TW"+topic}
      style={{whiteSpace:"normal", color:topicColor(topic)}}
    >
      {tm.topicWords(topic, 10).join(", ")}
    </div>;
  }
  renderTopicNumber = ({rowData:i}) => {
    return <div style={{color:topicColor(i)}} key={"TNUM"+i}>{i}</div>;
  }
  render() {
    let tm = this.props.topicModel;
    if (!tm) return "NULL TM";
    return <Table className="TopicWordList" height={500} width={350}
      headerHeight={20} rowHeight={40}
      rowCount={tm.num_topics}
      rowGetter={({index}) => index}
    >
      <Column label="Topic" dataKey="NA" width={20} cellDataGetter={(x)=>null}
        cellRenderer={this.renderTopicNumber}
      />

      <Column label="Propor" dataKey="NA" width={50} cellDataGetter={(x)=>null}
        style={{textAlign:"center"}}
        cellRenderer={({rowData:i})=> {
          let p = this.props.topicModel.topicGlobalProb(i);
          return <span className="topicProb">{ (Math.max(p,.01)*100).toFixed(0)}%</span>
        }}
      />

      <Column label="Words" dataKey="NA" width={300} cellDataGetter={(x)=>null}
        cellRenderer={this.renderTopicWords} 
      />

    </Table>
  }
}