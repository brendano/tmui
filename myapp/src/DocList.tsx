import App, * as A from './App';
import * as models from './models';
import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table, AutoSizer, CellMeasurer, Grid } from 'react-virtualized';
import * as d3 from 'd3';
import * as _ from 'lodash';
import './App.css';

interface DocListState {
}

export class DocList extends React.Component<any,DocListState> {
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
          <span className="docTopicProb" style={{color:A.topicColor(k)}}>
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
