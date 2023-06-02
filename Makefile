.PHONY: test lint format

test:
	cd py-client; pytest tests/

lint:
	cd py-client; black rebuff/ tests/
	cd py-client; flake8 rebuff/ tests/
	cd py-client; isort rebuff/ tests/
	cd py-client; mypy rebuff/ tests/

format:
	cd py-client; isort rebuff/ tests/
	cd py-client; black rebuff/ tests/


init: init-py-client init-server

init-py-client:
	cd py-client; pip install -e '.[dev]' -U

init-server:
	cd server; npm install

publish-py-client:
	cd py-client; py-client setup.py sdist bdist_wheel
	cd py-client; twine upload dist/*