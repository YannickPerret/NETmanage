.DEFAULT_GOAL := help
SHELL := /bin/bash

COMPOSE ?= docker compose
APP     ?= app
DB      ?= db

# ==============================================================================
# Help
# ==============================================================================

.PHONY: help
help: ## Affiche cette aide
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# ==============================================================================
# Local dev (no Docker)
# ==============================================================================

.PHONY: install
install: ## Installe les dépendances npm
	npm install

.PHONY: dev
dev: ## Lance le serveur Adonis en mode dev (HMR)
	npm run dev

.PHONY: build
build: ## Build production (node ace build)
	npm run build

.PHONY: typecheck
typecheck: ## Vérifie les types TS
	npm run typecheck

.PHONY: lint
lint: ## Lint eslint
	npm run lint

.PHONY: format
format: ## Prettier sur tout le repo
	npm run format

.PHONY: test
test: ## Lance les tests Japa
	npm run test

# ==============================================================================
# Database (local, via l'app hôte)
# ==============================================================================

.PHONY: migrate
migrate: ## Exécute les migrations
	node ace migration:run

.PHONY: migrate-rollback
migrate-rollback: ## Rollback la dernière batch
	node ace migration:rollback

.PHONY: migrate-fresh
migrate-fresh: ## Drop + run + seed (⚠️ destructif)
	node ace migration:fresh --seed

.PHONY: seed
seed: ## Lance les seeders
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
up: ## docker compose up -d (build si besoin)
	$(COMPOSE) up -d --build

.PHONY: down
down: ## docker compose down
	$(COMPOSE) down

.PHONY: restart
restart: down up ## Restart complet

.PHONY: logs
logs: ## Suivre les logs app
	$(COMPOSE) logs -f $(APP)

.PHONY: logs-db
logs-db: ## Suivre les logs db
	$(COMPOSE) logs -f $(DB)

.PHONY: ps
ps: ## Liste les containers
	$(COMPOSE) ps

.PHONY: sh
sh: ## Shell dans le container app
	$(COMPOSE) exec $(APP) sh

.PHONY: psql
psql: ## Shell psql dans la base
	$(COMPOSE) exec $(DB) psql -U $${DB_USER:-netmanage} -d $${DB_DATABASE:-netmanage}

.PHONY: docker-migrate
docker-migrate: ## Migrations dans le container app
	$(COMPOSE) exec $(APP) node ace migration:run --force

.PHONY: docker-seed
docker-seed: ## Seed dans le container app
	$(COMPOSE) exec $(APP) node ace db:seed

.PHONY: docker-fresh
docker-fresh: ## Fresh migrate + seed dans le container (⚠️ destructif)
	$(COMPOSE) exec $(APP) node ace migration:fresh --seed

.PHONY: rebuild
rebuild: ## Rebuild l'image app sans cache
	$(COMPOSE) build --no-cache $(APP)

.PHONY: clean
clean: ## Stop + remove containers, volumes, orphans (⚠️ supprime la DB)
	$(COMPOSE) down -v --remove-orphans
