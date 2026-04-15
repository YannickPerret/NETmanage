.DEFAULT_GOAL := help
SHELL := /bin/bash

COMPOSE ?= docker compose
APP     ?= app
DB      ?= db

# ==============================================================================
# Help
# ==============================================================================

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# ==============================================================================
# Bootstrap — full install from scratch
# ==============================================================================

.PHONY: setup
setup: ## Full install from scratch (db docker + deps + migrations + seed + app docker)
	@echo "==> 1/6 Checking .env"
	@test -f .env || (echo "Copying .env.example to .env" && cp .env.example .env)
	@echo "==> 2/6 Starting Postgres"
	$(COMPOSE) up -d $(DB)
	@echo "==> 3/6 Waiting for Postgres to accept connections as $${DB_USER:-netmanage}"
	@until $(COMPOSE) exec -T $(DB) psql -U $${DB_USER:-netmanage} -d $${DB_DATABASE:-netmanage} -c "SELECT 1" > /dev/null 2>&1; do \
		echo "  ... waiting for db"; sleep 1; \
	done
	@echo "==> 4/6 Installing npm dependencies"
	npm install
	@echo "==> 5/6 Running migrations + seeders (regenerates database/schema.ts)"
	DB_HOST=127.0.0.1 node ace migration:run
	DB_HOST=127.0.0.1 node ace db:seed
	@echo "==> 6/6 Building and starting the app container"
	$(COMPOSE) up -d --build $(APP)
	@echo ""
	@echo "✅ Setup complete — app available at http://localhost:3333"

.PHONY: reset
reset: clean setup ## Full reset: tear down everything then re-run setup (⚠️ wipes the db)

# ==============================================================================
# Local dev (no Docker)
# ==============================================================================

.PHONY: install
install: ## Install npm dependencies
	npm install

.PHONY: dev
dev: ## Run Adonis dev server (HMR)
	npm run dev

.PHONY: build
build: ## Production build (node ace build)
	npm run build

.PHONY: typecheck
typecheck: ## TypeScript type check
	npm run typecheck

.PHONY: lint
lint: ## Lint with eslint
	npm run lint

.PHONY: format
format: ## Format the repo with prettier
	npm run format

.PHONY: test
test: ## Run Japa tests
	npm run test

# ==============================================================================
# Database (local host commands)
# ==============================================================================

.PHONY: migrate
migrate: ## Run migrations
	node ace migration:run

.PHONY: migrate-rollback
migrate-rollback: ## Rollback the last batch
	node ace migration:rollback

.PHONY: migrate-fresh
migrate-fresh: ## Drop + run + seed (⚠️ destructive)
	node ace migration:fresh --seed

.PHONY: seed
seed: ## Run seeders
	node ace db:seed

.PHONY: make-migration
make-migration: ## make make-migration name=create_xxx_table
	node ace make:migration $(name)

.PHONY: make-model
make-model: ## make make-model name=Xxx
	node ace make:model $(name)

.PHONY: make-controller
make-controller: ## make make-controller name=Xxx
	node ace make:controller $(name)

# ==============================================================================
# Docker
# ==============================================================================

.PHONY: up
up: ## docker compose up -d (build if needed) — production build
	$(COMPOSE) up -d --build

.PHONY: dev-up
dev-up: ## Start stack in dev mode with HMR (db + app with mounted source)
	$(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "→ tailing app logs (Ctrl+C to detach)"
	$(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml logs -f $(APP)

.PHONY: dev-down
dev-down: ## Stop dev stack
	$(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml down

.PHONY: down
down: ## docker compose down
	$(COMPOSE) down

.PHONY: restart
restart: down up ## Full restart

.PHONY: logs
logs: ## Tail app logs
	$(COMPOSE) logs -f $(APP)

.PHONY: logs-db
logs-db: ## Tail db logs
	$(COMPOSE) logs -f $(DB)

.PHONY: ps
ps: ## List containers
	$(COMPOSE) ps

.PHONY: sh
sh: ## Shell into the app container
	$(COMPOSE) exec $(APP) sh

.PHONY: psql
psql: ## psql shell into the database
	$(COMPOSE) exec $(DB) psql -U $${DB_USER:-netmanage} -d $${DB_DATABASE:-netmanage}

.PHONY: docker-migrate
docker-migrate: ## Run migrations inside the app container
	$(COMPOSE) exec $(APP) node ace migration:run --force

.PHONY: docker-seed
docker-seed: ## Run seeders inside the app container
	$(COMPOSE) exec $(APP) node ace db:seed

.PHONY: docker-fresh
docker-fresh: ## Fresh migrate + seed inside the app container (⚠️ destructive)
	$(COMPOSE) exec $(APP) node ace migration:fresh --seed

.PHONY: rebuild
rebuild: ## Rebuild the app image without cache
	$(COMPOSE) build --no-cache $(APP)

.PHONY: clean
clean: ## Stop + remove containers, volumes, orphans (⚠️ wipes the db)
	$(COMPOSE) down -v --remove-orphans
