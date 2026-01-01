Backend structure (created)

- controllers/ # request handlers
- routes/ # express route definitions
- models/ # data models (ORM or plain objects)
- middlewares/ # express middlewares
- config/ # configuration loaders
- utils/ # helper utilities
- tests/ # basic tests

Placeholders (.gitkeep) created to keep folders in VCS.

## Database setup

This backend can connect to a Postgres database. Steps to initialize a local database named `nexgenus`:

1. Ensure Postgres is running on your machine and you have connection credentials.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` or `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGPORT`.
3. Run:

```bash
cd backend
npm install
npm run init-db
```

This will create the database named `nexgenus` (or the database specified by `PGDATABASE`).

You can verify the connection after starting the server by visiting `/api/db/status`.
