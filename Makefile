.PHONY: test lint format

test:
	cd python-sdk; pytest tests/

lint:
	cd python-sdk; black rebuff/ tests/
	cd python-sdk; flake8 rebuff/ tests/
	cd python-sdk; isort rebuff/ tests/
	cd python-sdk; mypy rebuff/ tests/

format:
	cd python-sdk; isort rebuff/ tests/
	cd python-sdk; black rebuff/ tests/


init: init-python-sdk init-server

init-python-sdk:
	cd python-sdk; pip install -e '.[dev]' -U

init-server:
	cd server; npm install

publish-python-sdk:
	cd python-sdk; python-sdk setup.py sdist bdist_wheel
	cd python-sdk; twine upload dist/*