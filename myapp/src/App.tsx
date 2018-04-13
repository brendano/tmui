import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table, AutoSizer, CellMeasurer, Grid } from 'react-virtualized'
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
    // this.state = {corpusUrl:"http://localhost:8000/tmrun/billbudget/sample"};
    this.state = {corpusUrl:"http://localhost:8000/tmrun/billbudget/billparts.phrases.jsonl"};
    
    this.loadCorpus();
  }
  async loadCorpus() {
    this.setState({corpus: await models.loadCorpus(this.state.corpusUrl)});  
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
<table className="LayoutTable">
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
  curdoclist() {
    let app:App = this.props.app;
    let doclist = app.state.corpus && app.state.corpus.doclist;
    doclist = doclist || [];
    return doclist;
  }
  render() {
    let app:App = this.props.app;
    let doclist = this.curdoclist();
    // console.log(doclist.map((x) => x!==undefined && x!==null ? "ok" : x));

    return <Table
        className="DocList"
        width={300}
        height={300}
        headerHeight={20}
        rowHeight={20}
        rowCount={doclist.length}
        rowGetter={({index}) => {
          let doclist = this.curdoclist();
          // console.log(`${index}  ${doclist.length}`);
          // if( ! (index < doclist.length)) throw "Wtf";
          // console.log("ROWGET DOCLIST " + doclist);
          return doclist[index];
        }}
        onRowClick={({ event, index, rowData }) => {
          // rowData is a Document but the type system doesn't recognize it
          console.log(rowData["docid"]);
          app.setState({docidSelection: rowData["docid"]});
        }}
      >

        <Column label="Docid" dataKey="docid" width={100} />
      
      </Table>;

    // return <div className="DocList" style={{width:200,border:"1px solid gray"}}>
    //   {
    //     doclist.map( (d:models.Document) => {
    //       let sel = d.docid!==undefined && d.docid===app.state.docidSelection;
    //       return <div 
    //         className={"DocName " + (sel ? "sel" : "")}
    //         key={"DOCID_"+d.docid}
    //         onClick={e=> {app.setState({docidSelection:d.docid }) }}
    //       >{d.docid}</div>
    //     })
    //   }
    // </div>;
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
      <div className="DocViewer container">
      <div className="DocViewer content">
      {text}
      </div>
      </div>
    );
  }

}
