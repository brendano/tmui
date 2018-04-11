import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table } from 'react-virtualized'
import './App.css';
import * as models from './models';
import {Corpus} from './models';

interface AppState {
  corpusUrl: string;
  corpus?: Corpus;
  docidSelection?: string;
}

class App extends React.Component<{},AppState> {
  
  constructor(props:any) {
    super(props);
    this.state = {corpusUrl:"http://localhost:8000/tmrun/billbudget/sample"};
    this.loadCorpus();
    // this.handleChange = this.handleChange.bind(this);
  }
  async loadCorpus() {
    this.setState({corpus: await models.loadCorpus(this.state.corpusUrl)});  
  }

  handleChange = (e) => {
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
<table>
<tr><td style={{verticalAlign:"top"}}>
<DocList app={this} />
</td>
<td style={{verticalAlign:"top"}}>
<DocViewer corpus={this.state.corpus} docid={this.state.docidSelection} />
</td></tr>
</table>
</div>
    );
  }
}

export default App;


interface DocListState {
}
class DocList extends React.Component<any,DocListState> {
  constructor(props) {
    super(props);
    this.state = {selection:null};
  }
  render() {
    let app:App = this.props.app;
    let doclist = app.state.corpus && app.state.corpus.doclist;
    doclist = doclist || [];
    return <div className="DocList" style={{width:200,border:"1px solid gray"}}>
      {
        doclist.map( (d:models.Document) => {
          let sel = d.docid!==undefined && d.docid===app.state.docidSelection;
          return <div 
            className={"DocName " + (sel ? "sel" : "")}
            key={"DOCID_"+d.docid}
            onClick={e=> {app.setState({docidSelection:d.docid }) }}
          >{d.docid}</div>
        })
      }
    </div>;
  }
}

interface DocViewerProps {
  docid:string;
  corpus:Corpus;
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
      <div style={{
        border:"1px solid gray",
        whiteSpace: "pre-wrap"}}
      >{text}
      </div>
    );
  }

}
