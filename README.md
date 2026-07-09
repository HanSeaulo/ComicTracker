# ComicTracker

ComicTracker is a personal library tracker for manhwa, manga, manhua, western comics, and light novels.

It lets users import a reading library from XLSX, track chapters read, scores, and reading status, and keep the data synced with a PostgreSQL database.

The app is built with Next.js, Prisma, PostgreSQL, and deployed on Vercel. It also includes Docker and Kubernetes configuration for local containerised deployment.

---

## Features

- Import entries from XLSX
- Track chapters read, total chapters, score, and status
- Separate entries by type
- Deduplicated imports with merge rules
- Import history and activity logs
- Password-protected access
- PostgreSQL persistence with Prisma

---

## Tech Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- PostgreSQL / Neon
- Docker
- Docker Compose
- Kubernetes
- Vercel

---

## Local Development

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
APP_USERNAME="your-username"
APP_PASSWORD_HASH="\$2b\$10\$your-bcrypt-hash"
SESSION_SECRET="your-session-secret"
```

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Docker

Build the image:

```bash
docker build -t comictracker .
```

Create a Docker env file:

```bash
cp .env .env.docker.local
```

For Docker, make sure the bcrypt hash uses normal `$` characters instead of escaped `\$`.

Run the container:

```bash
docker run --rm -p 3000:3000 --env-file .env.docker.local comictracker
```

---

## Docker Compose

Run:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

---

## Kubernetes

The `k8s/` folder contains a minimal Kubernetes setup:

- Deployment
- Service
- ConfigMap
- Secret example

The app is stateless. Persistent data is stored in Neon PostgreSQL, so no Persistent Volume is required.

For local Kubernetes testing with kind:

```bash
kind create cluster --name comictracker
docker build -t comictracker:local .
kind load docker-image comictracker:local --name comictracker
```

Create a local Secret from `.env.docker.local`:

```bash
kubectl create secret generic comictracker-secret \
  --from-env-file=.env.docker.local \
  --dry-run=client -o yaml > k8s/secret.local.yaml
```

Apply the manifests:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.local.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

Check the pod:

```bash
kubectl get pods
```

Access the app:

```bash
kubectl port-forward service/comictracker-service 3000:3000
```

Open:

```text
http://localhost:3000
```

---

## Deployment

The live app is deployed with Vercel and Neon.

Production database migrations can be run with:

```bash
npx prisma migrate deploy
```

---

## License

This project is currently unlicensed and intended for personal use.