.PHONY: dev build test deploy rollback check

dev:
	npm run dev

test:
	npm test

check:
	npm run check

build: test
	npm run build

deploy:
	bash infra/deploy.sh

rollback:
	bash infra/deploy.sh rollback
