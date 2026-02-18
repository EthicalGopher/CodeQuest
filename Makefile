run :
	git pull origin main
	npm install
	npm run dev

push :
	git add .
	git commit -m "made changes"
	git push origin main