import json
with open("sotu.jsonl",'w') as f:
    for line in open("from_jslda.txt"):
        docid1,docid2,text = line.split("\t")
        assert docid1==docid2
        year = docid1.split("_")[0]
        passage=docid1.split("_")[-1]
        year=int(year)
        passage=int(passage)
        text=text.strip()
        print>>f, json.dumps({'year':year, 'passage':passage,
            'docid':docid1, 'text':text.decode("utf8")})
        
