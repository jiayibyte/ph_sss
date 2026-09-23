.PHONY: dev build test deploy rollback check server-setup nightly-status nightly-run nightly-log

DEPLOY_HOST ?= $(or $(AYTOOL_HOST),139)

dev:
	npm run dev

test:
	npm test

check:
	npm run check

build: test
	npm run build
	npm run audit

deploy:
	bash infra/deploy.sh

rollback:
	bash infra/deploy.sh rollback

# Nightly rebuilds on the server (infra/server/README.md)
server-setup:
	ssh $(DEPLOY_HOST) 'rm -rf /tmp/aytool-server-setup'
	scp -q -r infra/server $(DEPLOY_HOST):/tmp/aytool-server-setup
	ssh $(DEPLOY_HOST) 'bash /tmp/aytool-server-setup/setup.sh && rm -rf /tmp/aytool-server-setup'

nightly-status:
	ssh $(DEPLOY_HOST) /opt/aytool/bin/aytool-rebuild status

nightly-run:
	ssh $(DEPLOY_HOST) 'systemctl start aytool-rebuild.service; journalctl -u aytool-rebuild.service --since "-15min" --no-pager -o cat | tail -n 40'

nightly-log:
	ssh $(DEPLOY_HOST) 'journalctl -u aytool-rebuild.service -n 80 --no-pager -o short-iso'
