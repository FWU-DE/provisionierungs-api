# VIDIS Rostering UI

This is the web interface for the VIDIS Rostering project, built with [Next.js](https://nextjs.org).

## Technologies

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **State Management & Data Fetching**: [Apollo Client](https://www.apollographql.com/docs/react/) with [gql.tada](https://gql-tada.0no.co/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Authentication**: OpenID Connect with [openid-client](https://github.com/panva/node-openid-client)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation

## Getting Started

### Environment Variables

Ensure you have the necessary environment variables configured. You may need to create a `.env.local` file based on the project's requirements. Key variables include:

- `SELF_BASE_URL`: The base URL of this UI application.
- `AUTH_URL`: The OpenID Connect provider URL.
- `AUTH_CLIENT_ID`: The OIDC client ID.
- `AUTH_CLIENT_SECRET`: The OIDC client secret.
- `SESSION_SECRET`: Secret key used to encrypt/decrypt session cookies.
- `API_BASE_URL`: The base URL for the backend API.

### Scripts

First, install dependencies from the root of the monorepo:

```bash
pnpm install
```

Then, run the development server for the UI app:

```bash
pnpm dev --filter @fwu/vidis-rostering-ui
```

Or run directly from this directory:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Commands

- `pnpm dev`: Starts the development server with Turbopack.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Runs ESLint to check for code quality issues.
- `pnpm check-types`: Runs TypeScript compiler to check for type errors.
- `pnpm clean`: Removes build artifacts (`.next/`, `.turbo/`).

## Developer Note: Retrieving User JWT

To retrieve the user's JWT from the cookies for debugging or performing manual queries:

1. Locate the session cookie named `session`.
2. The cookie value is a JWT encrypted/signed with the `SESSION_SECRET`.
3. Decrypt the JWT to access its payload.
4. The `accessToken` property within the decrypted JWT is the actual user's access token.
5. This access token can be used to perform authorized queries against the backend's GraphQL endpoints (typically by passing it in the `Authorization: Bearer <token>` header).
