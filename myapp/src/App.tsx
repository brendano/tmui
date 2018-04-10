import * as React from 'react';
import './App.css';
import * as models from './models';
import {Corpus} from './models';

interface StateInterface {
  corpusUrl?: string
}

class App extends React.Component<StateInterface> {
  state:StateInterface;
  corpus:Corpus;
  constructor(props:any) {
    super(props);
    this.state = {corpusUrl:"http://localhost:8000/tmrun/billbudget/sample"};
    this.handleChange = this.handleChange.bind(this);
  }
  async loadCorpus() {
    this.corpus = await models.loadCorpus(this.state.corpusUrl);
    console.log("LOADED CORPUS " + this.corpus.numDocs());
  }

  handleChange = (e) => {
    console.log("NEW URL "+e.target.value);
    this.setState({corpusUrl: e.target.value});
    this.loadCorpus();
    return true;
  };
  render() {
    return (
<div className="App">
<header className="App-header">
</header>
Corpus URL: <input type="text" name="corpus_url" value={this.state.corpusUrl} onChange={this.handleChange} />
<br/> 
</div>
    );
  }
}

export default App;
