# Developer Portfolio

A responsive portfolio built with React, TypeScript, TanStack Start, and Tailwind CSS. It includes a resume page, project pages, and a coding dashboard backed by server-side platform integrations.

## Features

- Server endpoint at `/api/stats` that aggregates GitHub, Codeforces, and LeetCode profile data.
- GitHub profile summary, repositories, activity, and language counts using the GitHub REST API.
- Codeforces rating history, contest information, accepted submissions, and unique solved-problem counts using the Codeforces API.
- LeetCode problem counts, difficulty breakdown, activity, contest details, and recent accepted submissions when its unofficial GraphQL endpoint is available.
- Independent provider states, request timeouts, validation, server-side caching, and graceful fallback for unavailable data.
- Responsive resume and portfolio pages with links to platform profiles and project repositories.

## Requirements

- Node.js 20 or newer
- npm

## Local development

```sh
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

The development server runs at `http://localhost:3000`.

## Configuration

Edit `.env` to configure profile handles and provider settings. Usernames and handles are public profile identifiers; keep tokens and other credentials server-side.

| Variable | Purpose |
| --- | --- |
| `VITE_GITHUB_USERNAME` | GitHub profile used to load public repositories and activity. |
| `GITHUB_TOKEN` | Optional server-side GitHub token for API access with a higher rate limit. Never expose or commit a real token. |
| `VITE_CODEFORCES_HANDLE` | Codeforces handle used by the public API integration. |
| `LEETCODE_USERNAME` | Server-side LeetCode username. Leave empty to disable this integration. |
| `VITE_LEETCODE_USERNAME` | Public LeetCode handle used to build profile links in the browser. |
| `LEETCODE_REFRESH_INTERVAL_MS` | LeetCode cache refresh interval in milliseconds; defaults to 30 minutes. |

`.env.example` contains sample settings. Real `.env` files are ignored by Git.

## Commands

```sh
npm run dev      # Start the development server
npm test         # Run the provider tests
npm run build    # Create the production build
```

## API

`GET /api/stats` returns separate GitHub, Codeforces, and LeetCode results so a provider failure does not prevent other data from appearing. The LeetCode integration can be explicitly refreshed with `GET /api/stats?refresh=leetcode`.

LeetCode results use one of these states:

- `success`: validated current data.
- `cached`: the live refresh failed, so the last validated response is returned with its update time.
- `unavailable`: no validated response is available.
- `not_configured`: no LeetCode username is set.

## Deployment

The project is configured for Netlify with `netlify.toml`. Connect the repository to Netlify, set the required environment variables in the site settings, and deploy. Netlify runs `vite build` and publishes `dist/client`.

## Data limitations

GitHub and Codeforces data use their public APIs. LeetCode does not provide a broadly supported public profile API for these statistics, so this portfolio uses an unofficial GraphQL endpoint. Its schema, availability, and rate limits may change. When LeetCode data cannot be validated, the dashboard reports that state and links to the public profile rather than presenting estimates.
