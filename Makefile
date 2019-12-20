all:
	$(MAKE) --print-directory --directory=content/intro-mathprog-or/open-optimization
	@echo "############################"
	@echo "#### Available products ####"
	@echo "############################"
	@$(MAKE) list-products

# This target is used by the CI infrastructure
list-products:
	@echo content/intro-mathprog-or/open-optimization/open-optimization.pdf

.PHONY: check

# This target is used by the CI infrastructure
check: all
