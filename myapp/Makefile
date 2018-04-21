%.js: %.ts
	tsc --lib DOM,ES6 $<

standalone:
	npm run build  # takes a while
	cp public/tinycorpus/* build
	mv build prebuilt

serve:
	(cd prebuilt && python -m SimpleHTTPServer)

