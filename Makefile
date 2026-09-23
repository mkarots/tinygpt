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

# Run unit tests
.PHONY: test
test:
	$(NPX) --yes tsx --test src/utils/chatHistory.test.ts src/utils/knowledgeContext.test.ts src/application/use-cases/CreateAgentUseCase.test.ts src/application/use-cases/ChatUseCase.test.ts src/lib/saveAgent.test.ts src/lib/supabase-config.test.ts src/lib/routes.test.ts src/infrastructure/services/GeminiEmbeddingService.test.ts src/app/layout.test.ts

# Clean build artifacts
.PHONY: clean
clean:
	rm -rf .next node_modules

