import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table } from 'react-virtualized'
import './App.css';
import * as models from './models';
import {Corpus} from './models';

interface AppState {
  corpusUrl: string
  corpus?: Corpus;
}

class App extends React.Component<{},AppState> {
  state:AppState;
  
  constructor(props:any) {
    super(props);
    this.state = {corpusUrl:"http://localhost:8000/tmrun/billbudget/sample"};
    this.loadCorpus();
    // this.handleChange = this.handleChange.bind(this);
  }
  async loadCorpus() {
    this.setState({corpus: await models.loadCorpus(this.state.corpusUrl)});  
    console.log("LOADED CORPUS ");
  }

  handleChange = (e) => {
    // console.log(e);
    console.log("NEW URL "+e.target.value);
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
<DocList app={this} />
</div>
    );
  }
}

export default App;


interface DocListState {
  selection: string;
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
    return (
      <div className="DocList" style={{width:200,border:"1px solid gray"}}>
      {
        doclist.map((d:models.Document) =>
          <div className={"DocName " + (d.docid===this.state.selection ? "sel" : "")} 
            key={"DOCID_"+d.docid}
            onClick={e=> {console.log(d.docid); this.setState({selection:d.docid}) }}
          >{d.docid}</div>
        )
      }
      </div>
    )
  }
}

