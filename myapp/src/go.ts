import * as models from './models';

async function main() {
  let c = await models.loadCorpus("http://localhost:8000/tmrun/billbudget/sample");
  console.log(c.numDocs());    
}
main();
