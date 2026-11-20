# FitLink

## Local setup

1. Install Node.js 20 or newer.
2. From this directory, run `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to the pooled connection string from Neon.
4. Run `npm run db:migrate` to create the PostgreSQL tables.
5. Optionally import the existing local JSON records with `npm run db:import:legacy`.
6. Run `npm start` and open `http://localhost:3000`.

The legacy import reads local JSON files from `BackEnd/`. Those files are intentionally ignored by Git because they may contain account credentials or other private records. User passwords are hashed during import.

## Vercel and Neon

Import the GitHub repository into Vercel and set the project **Root Directory** to `FitLink`. Add `DATABASE_URL` as a Vercel environment variable using the pooled Neon connection string, then deploy. Run `npm run db:migrate` once against the same Neon database before opening the deployed app. Vercel detects the Express app from the root `index.js` entry point and serves the files in `public/` through its CDN. The static site and API use the same origin; no localhost URL or permissive CORS configuration is needed.

The local Express server is `BackEnd/index.js`. Never commit `.env` or private JSON data files.

## Before accepting real users

The existing browser app identifies users using values stored in `localStorage` and sends usernames to account-changing endpoints. Passwords are now hashed, but this is not a substitute for server-side authentication and authorization. Add authenticated sessions/tokens and authorize every account mutation before using real accounts. The payment form is currently a client-side demonstration and does not process payments; connect a payment provider before accepting payment details.
