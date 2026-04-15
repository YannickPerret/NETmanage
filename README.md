# NetManage

Application de ticketing (AdonisJS v7 + Inertia/React + PostgreSQL).

## Stack

- **Backend** : AdonisJS v7, Lucid ORM
- **Frontend** : Inertia.js + React 19 + Vite
- **DB** : PostgreSQL 17
- **Runtime** : Node.js ≥ 24

## Démarrage rapide (Docker)

```sh
cp .env.example .env   # si besoin
make up                # build + démarre app + postgres
make docker-migrate    # migrations
make docker-seed       # données de démo (dev only)
```

App → http://localhost:3333

## Dev local (sans Docker)

Requis : Node 24+, Postgres 17 sur `127.0.0.1:5432`.

```sh
make install
make migrate
make seed
make dev               # HMR sur http://localhost:3333
```

## Commandes utiles

| Commande              | Description                              |
| --------------------- | ---------------------------------------- |
| `make help`           | Liste toutes les cibles                  |
| `make up` / `down`    | Démarre / arrête la stack Docker         |
| `make logs`           | Logs de l'app                            |
| `make psql`           | Shell Postgres dans le container         |
| `make docker-fresh`   | Drop + migrate + seed (⚠️ destructif)   |
| `make test`           | Lance Japa                               |
| `make typecheck`      | Vérifie les types TS                     |

## Modèle de données

- `Company` → `Branch` → `User` (clients liés à une succursale)
- `User` : `type` = `client` | `technician`
- `Ticket` : title, description, `status`, `priority`, `category`, issuer polymorphe (`company` ou `user`), N `groups`, N `technicians`
- `Attachment` : polymorphe (`attachable_type` / `attachable_id`)

Lookups fixes seedés : statuses (`open`, `in_progress`, `pending`, `resolved`, `closed`), priorities (`low`→`critical`), categories (`incident`, `request`, `question`, `bug`), groups (`technique`, `support`, `web`, `securite`).

## Structure

```
app/
  models/        # Lucid models
  controllers/
config/          # database.ts, auth.ts, ...
database/
  migrations/
  factories/
  seeders/
  schema.ts      # auto-généré — NE PAS éditer
inertia/         # frontend React
start/           # routes, kernel, env
```

## Variables d'environnement

Voir `.env`. Clés principales :

```
APP_KEY=...
HOST=0.0.0.0
PORT=3333
DB_HOST=127.0.0.1      # "db" dans Docker
DB_PORT=5432
DB_USER=netmanage
DB_PASSWORD=netmanage
DB_DATABASE=netmanage
```

Générer une clé : `node ace generate:key`.
