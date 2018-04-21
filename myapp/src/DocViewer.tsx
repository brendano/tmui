import * as React from 'react';
import 'react-virtualized/styles.css'
import * as models from './models';

export interface DocViewerProps {
  docid:string;
  corpus:models.Corpus;
}

export class DocViewerSimple extends React.Component<DocViewerProps,{}> {
  render() {
    if (this.props.corpus==null || this.props.docid==null) {
      return <div className="DocViewer container"></div>;
    }
    let doc = this.props.corpus.docid2doc[this.props.docid];
    let text = doc ? doc.text : "";
    return (
      <div className="DocViewer container" style={{maxWidth:"400px"}}>
        <i>Document {this.props.docid}</i>
        <br/><br/>
        <div className="DocViewer content">
        {text}
        </div>
      </div>
    );
  }
}
