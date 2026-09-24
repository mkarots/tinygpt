# Variables
NPM := npm
NPX := npx

# Default target
.PHONY: all
all: install lint type-check build

# Install dependencies
.PHONY: install
install:
	$(NPM) ci

# Run development server
.PHONY: dev
dev:
	$(NPM) run dev

# Build the application
.PHONY: build
build:
	$(NPM) run build

# Run linting
.PHONY: lint
lint:
	$(NPM) run lint

# Run type checking
.PHONY: type-check
type-check:
	$(NPX) tsc --noEmit

# Run unit tests. Same suite CI runs via npm test.
.PHONY: test
test:
	$(NPM) test

# Clean build artifacts
.PHONY: clean
clean:
	rm -rf .next node_modules

