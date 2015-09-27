JSCS ?= node_modules/.bin/jscs
JSHINT ?= node_modules/.bin/jshint

SRC ?=
SRC += $(shell find lib/ -name '*.js')
TEST ?=
TEST += $(shell find test/ -name '*.js')

lint:
	@echo Checking style
	@$(JSCS) $(SRC) $(TEST)
	@echo Checking stupid mistakes
	@$(JSHINT) $(SRC)

.PHONY: lint
