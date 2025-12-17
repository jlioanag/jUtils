# jUtils

Private Discord bot

- Running on Node
- Using Discord.js + Prisma

## Commands

- `/health`: Query bot health
- `/join [game]`: Join a game channel
- `/leave [game]`: Leave a game channel

## Setup dev

```bash
cp .env.example .env # replace placeholders with your creds
pnpm install
pnpm prisma generate
pnpm start
```

## Deploy

```bash
docker compose up -d
```