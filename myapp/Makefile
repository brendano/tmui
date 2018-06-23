# Only for commandline tests.  Can stop using if figure out how to use npm for commandline compiling
#
%.js: %.ts
	tsc --lib DOM,ES6 $<

standalone:
	# npm run build  # takes a while
	rm -rf prebuilt
	cp -r build prebuilt
	(cd prebuilt && rm -rf sotu)
	(cd prebuilt && ln -sf ../public/sotu/corpus.jsonl .)
	(cd prebuilt && ln -sf ../public/sotu/tminfo.json .)

serve:
	(cd prebuilt && python -m SimpleHTTPServer)

