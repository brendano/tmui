import App, * as A from './App';
import * as models from './models';
import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table, AutoSizer, CellMeasurer, Grid, defaultTableRowRenderer } from 'react-virtualized';
import * as d3 from 'd3';
import * as _ from 'lodash';
import './App.css';

interface TopicWordListProps {
  topicModel: models.TopicModel;
  selectedTopic: number;
  app: App;
}
interface TopicWordListState {
  rankFormula: string;
  countThreshold: number;
  countThresholdString: string;
}

export class TopicWordList extends React.Component<TopicWordListProps,TopicWordListState> {

  constructor(props) {
    super(props);
    let state = {rankFormula:"prob", countThreshold:10,countThresholdString:null};
    // this is buggy. it gets an undefined topicmodel object. the loading code and order had to be revamped.
    let tm:models.TopicModel = props.topicModel;
    let t = (tm && tm.token_total_count > 10000) ? 10 : 1;
    state.countThreshold = t;
    state.countThresholdString = t.toString();
    this.state = state;
  }

  renderTopicWords = ({rowData:index}) => {
    // console.log("RTW " + index + " state " + this.state.rankFormula );
    let topic = index;   // todo change when resortable
    let tm = this.props.topicModel;
    if (!tm) return "";
    let words = tm.topicWords(topic, 10, this.state);
    return <div className="TopicWords" key={"TW"+topic}
      style={{whiteSpace:"normal", verticalAlign:"top", color:A.topicColor(topic)}}
    >
      {words.map((w)=>w.replace(/_/g," ")).join(", ")}
    </div>;
  }
  renderTopicNumber = ({rowData:i}) => {
    return <div style={{color: A.topicColor(i)}} key={"TNUM"+i}>{i}</div>;
  }
  updateRankFormula = ((e) => {
    this.setState({rankFormula: e.target.value});
  });
  countThresholdUpdate = (e) => {
    let x:number = parseFloat(e.target.value);
    if (!isFinite(x)) {
      this.setState({countThreshold:1, countThresholdString:e.target.value});
    }
    else {
      this.setState({countThreshold:x, countThresholdString:e.target.value});
    }
  };
  render() {
    let tm = this.props.topicModel;
    if (!tm) return "null..tm..";
    console.log("TWL render, seltopic prop " + this.props.selectedTopic);
    return <div>
      Rank words by:
      <select value={this.state.rankFormula} onChange={this.updateRankFormula}>
        <option value="prob" title="Most common: p(w|k)">Prob</option>
        <option value="pmi" title="Most distinctive: p(w|k)/p(w) ∝ p(k|w) (same ranking as PMI).  The resulting ranking is very sensitive to the frequency threshold."
          >Lift</option>
        <option value="hpmi" title="Both distinctive and common: p(w|k) log[p(w|k)/p(w)] (Weighted PMI)">Info</option>
      </select>
      <div style={{display: this.state.rankFormula=="pmi" ? "hidden" : "inline", paddingLeft:"1em"}}>
        with count at least:
        <input type="text" value={this.state.countThresholdString} style={{width:"6ch"}}
          onChange={this.countThresholdUpdate}
        />
      </div>
      <Table className="TopicWordList" height={500} width={350}
        headerHeight={20} rowHeight={40}
        rowCount={tm.num_topics}
        rowGetter={({index}) => index}
        rowRenderer={(params) => {
          let topic = params.rowData;
          if (this.props.selectedTopic!=null && this.props.selectedTopic===topic) {
            params.style.border = "2px solid black";
            params.style.background = "yellow";
          }
          else {
            params.style.border="2px solid white";
          }
          return defaultTableRowRenderer(params);
        }}
        onRowClick={({event,index,rowData}:{event,index,rowData:any}) => {
          let clickTopic:number = rowData;
          if (clickTopic==null) throw "shouldn't be null";
          let newTopic = (clickTopic===this.props.selectedTopic) ? null : clickTopic;
          console.log("NEW "+newTopic);
          this.props.app.setState({selectedTopic:newTopic});
        }}
      >
        <Column label="Topic" dataKey="NA" width={20} cellDataGetter={(x)=>null}
          cellRenderer={this.renderTopicNumber}
        />

        <Column label="Propor" dataKey="NA" width={35} cellDataGetter={(x)=>null}
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
    </div>
  }
}