# Kodayak

[![Live Demo](https://img.shields.io/badge/Live_Demo-kodayak.com-blue?style=for-the-badge)](https://www.kodayak.com/)

A collaborative event photography platform that transforms any event into a shared photo experience. Guests scan a QR code and start capturing memories instantly — no app download required.

## Features

- **No App Required** - Guests simply scan a QR code and start capturing. Works instantly on any smartphone browser.
- **Works Offline** - Photos are queued locally and uploaded automatically when connection is restored.
- **Real-time Gallery** - Watch your gallery grow live as guests capture moments.
- **QR Code Sharing** - Print on table cards, display on screens, or include in invitations.
- **Bulk Download** - Download all photos at once in original quality.
- **Secure & Private** - Photos are encrypted and private, with full access control.

## Tech Stack

- **Framework:** Next.js 16 with Turbopack
- **Frontend:** React 19, Tailwind CSS v4
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Better Auth
- **Storage:** Cloudflare R2 (S3-compatible)
- **UI Components:** shadcn/ui, Radix UI
- **PWA:** next-pwa for offline support

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudflare R2 bucket (or S3-compatible storage)

### Installation

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Configure your database URL, R2 credentials, and auth secrets.

3. Set up the database:

   ```bash
   npm run db:push
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command               | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Start development server with Turbopack      |
| `npm run dev:network` | Start dev server accessible on local network |
| `npm run build`       | Build for production                         |
| `npm run start`       | Start production server                      |
| `npm run lint`        | Run ESLint                                   |
| `npm run db:push`     | Push schema changes to database              |
| `npm run db:migrate`  | Run database migrations                      |
| `npm run db:studio`   | Open Prisma Studio                           |
| `npm run db:seed`     | Seed the database                            |

## License

Private - All rights reserved.
