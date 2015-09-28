JSCS ?= node_modules/.bin/jscs
JSHINT ?= node_modules/.bin/jshint
MOCHA ?= node_modules/.bin/mocha

SRC ?=
SRC += $(shell find lib/ -name '*.js')
TEST ?=
TEST += $(shell find test/ lib/ -name '*-test.js')
GREP ?=

test:
	$(MOCHA) --reporter=spec $(TEST)
	make lint

test-grep:
	$(MOCHA) --reporter=spec $(TEST) --grep "$(GREP)"
	make lint

lint:
	@echo Checking style
	@$(JSCS) $(SRC)
	@echo Checking stupid mistakes
	@$(JSHINT) $(SRC)

.PHONY: lint test
