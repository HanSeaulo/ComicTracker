This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started (Postgres)

### 1) Configure environment variables

Create or update `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
```

Notes:
- For **Neon**, `DATABASE_URL` should be the pooled connection string and `DIRECT_URL` the non-pooled string for migrations.
- For **Supabase**, use the connection string Supabase provides. `DIRECT_URL` can be the same as `DATABASE_URL` if you don't have a separate direct connection.

### 2) Apply schema and generate client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3) Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Common commands

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
