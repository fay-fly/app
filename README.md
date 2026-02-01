<h1 align="center">FayFly</h1>

![FayFly](./public/preview-desktop.png)

## About

FayFly is a full-featured social media starter built with Next.js, Prisma, and NextAuth.

### Features

- **Authentication** - Email/password and Google OAuth with NextAuth.js, including email verification and password reset
- **User Profiles** - Profile pages with avatar and cover image uploads, bio, and editable settings
- **Follow System** - Subscriber/subscription relationships between users
- **Posts** - Create, delete, and display posts with image uploads and hashtag support
- **Engagement** - Like and comment system with real-time counters
- **Pins** - Save posts to a personal collection
- **Notifications** - In-app notification system with unread counts and mark-as-read
- **Search** - Search users and posts by hashtags with recent search history

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Set up the database:

```bash
npx prisma migrate dev
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Prisma with PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
