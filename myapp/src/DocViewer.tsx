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

export class DocViewer extends React.Component<DocViewerProps,{}> {
  renderTokens(doc:models.Document) {
    if (doc.tokensSpacyStyle) {
      return this.renderTokensSpacyStyle(doc.tokensSpacyStyle);
    }
    else if (doc.tokens) {
      return this.renderTokensStrings(doc.tokens);
    }
    else {
      throw "unhandled token type";
    }
  }
  renderTokensSpacyStyle(tokens: models.TokenSpacyStyle[]) {
    return tokens.map((t) => {
      <span className="token">
        <span className="text">{t.text}</span>
        <span className="ws">{t.whitespace_ || ""}</span>
      </span>
    })
  }
  renderTokensStrings(tokens: string[]) {
    throw "unimplemented";
  }
  render() {
    if (this.props.corpus==null || this.props.docid==null) {
      return <div className="DocViewer container"></div>;
    }
    let doc:models.Document = this.props.corpus.docid2doc[this.props.docid];
    let text;
    if (doc.tokens) {
      text = this.renderTokens(doc);
    }
    else {
      text = doc ? doc.text : "";
    }
    
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
