import * as React from 'react';
import './App.css';
import * as models from './models';
import {Corpus} from './models';

interface StateInterface {
  corpusUrl?: string
  corpus?: Corpus;
}

class App extends React.Component<{},StateInterface> {
  state:StateInterface;
  
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


class DocList extends React.Component<any,any> {
  
  render() {
    let app:App = this.props.app;
    let doclist = app.state.corpus && app.state.corpus.doclist;
    doclist = doclist || [];
    return (
      <div className="DocList">
      {
        doclist.map((d:models.Document) =>
          <div className="DocName" key={"DOCID_"+d.docid}>{d.docid}</div>
        )
      }
      </div>
    )
  }
}