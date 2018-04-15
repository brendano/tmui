import App, * as A from './App';
import * as models from './models';
import * as React from 'react';
import 'react-virtualized/styles.css'
import { Column, Table, AutoSizer, CellMeasurer, Grid } from 'react-virtualized';
import * as d3 from 'd3';
import * as _ from 'lodash';
import './App.css';

interface TopicWordListProps {
  topicModel:models.TopicModel;
}
interface TopicWordListState {
  selected_topic: number;
}

export class TopicWordList extends React.Component<TopicWordListProps,TopicWordListState> {
  state={selected_topic:null};

  renderTopicWords = ({rowData:index}) => {
    console.log("RTW " + index);
    let topic = index;   // todo change when resortable
    let tm = this.props.topicModel;
    if (!tm) return "";
    
    return <div className="TopicWords" key={"TW"+topic}
      style={{whiteSpace:"normal", verticalAlign:"top", color:A.topicColor(topic)}}
    >
      {tm.topicWords(topic, 10).map((w)=>w.replace(/_/g," ")).join(", ")}
    </div>;
  }
  renderTopicNumber = ({rowData:i}) => {
    return <div style={{color:A.topicColor(i)}} key={"TNUM"+i}>{i}</div>;
  }
  render() {
    let tm = this.props.topicModel;
    if (!tm) return "null..tm..";
    return <Table className="TopicWordList" height={500} width={350}
      headerHeight={20} rowHeight={40}
      rowCount={tm.num_topics}
      rowGetter={({index}) => index}
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
  }
}