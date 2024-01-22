.PHONY: test lint format

test:
	cd python-sdk; make install-dev; make test

init-python-sdk:
	cd python-sdk; make install-dev

init: init-python-sdk init-server

init-js-sdk:
	cd javascript-sdk; npm install

init-server:
	cd server; npm install