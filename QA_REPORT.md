# Portfolio QA Report

**Overall status: Pass with issues.** The local portfolio and live providers worked in the tested paths. Three confirmed application defects were fixed during this run. Dependency advisories and production deployment checks remain outstanding.

## Verified

- Ran the app locally and checked `/`, `/projects`, `/resume`, and `/contact`; each returned HTTP 200. The resume PDF and primary profile, platform, and project images also returned HTTP 200.
- Requested `/api/stats` once after adding GitHub and Codeforces response validation. It returned HTTP 200 with GitHub `ok`, Codeforces `ok`, and LeetCode `success`.
- Captured and inspected layouts at 320×568, 375×812, 390×844, 768×1024, 1366×768, and 1920×1080. No horizontal document overflow or failed image loads were found. Fixed the clipped/overlapping small-screen navigation by adding an accessible collapsible menu for screens below 1024 px.
- Exercised the theme toggle and reload; the selected theme persisted. Expanded the About card, opened and closed the mobile menu through navigation, checked the Contact scroll, navigated among routes, and verified browser back navigation.
- Checked form validation and mocked both contact responses without sending a real message. Empty required fields are rejected; a mocked 503 now shows an error and retains the form, while a mocked 200 shows confirmation.
- Checked rendered links and controls: no unnamed buttons or links, no unsafe `target="_blank"` links, and one homepage `h1`.
- Added runtime validation and malformed-response tests for GitHub and Codeforces. Blog Markdown now escapes raw HTML and rejects unsafe URL schemes.
- `npm test`: **15 passed**. `npx tsc --noEmit`: passed. `npm run build`: passed. `git diff --check`: passed. No lint script is configured.

The Netlify dev adapter could not complete its Edge Functions setup because it attempted an unavailable remote fetch. Browser QA therefore used a temporary Vite config without the Netlify adapter; it was removed afterward, and the local server is stopped. Actual Netlify form delivery was not verified.

## Fixed defects

1. **Mobile navigation clipping** — at 320 px, the Contact link was outside the viewport and the theme control overlapped navigation. Added a menu with all six links and verified it at mobile and tablet widths.
2. **False contact success** — a mocked 503 previously displayed “Message Sent!” despite failure. The form now checks the response, shows an accessible error, and disables duplicate submission while sending.
3. **Untrusted content and stats assumptions** — blog Markdown allowed raw HTML; GitHub and Codeforces payloads were not fully validated before caching/rendering. Added sanitizing Markdown rendering, provider validators, and tests for valid and malformed payloads.

## Outstanding findings

### High — dependency advisories

`npm audit --omit=dev` reported **19 advisories: 3 critical, 11 high, 3 moderate, and 2 low**, including TanStack Start server-side XSS/serialization advisories. `npm audit fix` could not resolve the tree: the patched TanStack Start release requires Vite 8, while this project uses Vite 7.3.1. No forced dependency update was applied. Coordinate a TanStack/Vite upgrade, then rerun the audit, tests, and build before production.

### Medium — response security headers

`netlify.toml` does not configure security headers. Add and verify appropriate headers, including a Content Security Policy, before deployment. Netlify function responses may require framework-level configuration rather than static asset rules.

### Low — performance and SEO

- `public/icons/instagram.png` is 1,614,418 bytes and `public/icons/x.png` is 419,809 bytes, though each is displayed as a small icon. Resize or optimize these assets.
- The root route sets a title but no meta description or Open Graph metadata. No sitemap or `robots.txt` was found.
- `package.json` declares `@tailwindcss/vite`, `lucide-react`, and `tailwindcss` in both dependency sections; remove duplicate declarations in a dependency cleanup.
- `src/components/TechText.jsx`, its declaration, and the Checkbox, HoverCard, and Separator wrappers appear unreferenced. Jobs and education collections also have no current route consumer. They were left in place pending confirmation that they are not intended for future use.

## Not verified

- Netlify’s production contact-form storage/delivery, deployment environment variables, and production response headers.
- Lighthouse or axe scores; neither tool is configured in the project. Screen-reader behavior and keyboard-only navigation need a manual pass.
- Automated external-link reachability. Links were checked for presence and safe `rel` attributes, not followed to third-party sites.
- Live-provider failure modes for GitHub and Codeforces were tested with deterministic validator unit cases; live testing observed successful responses only. LeetCode timeout, GraphQL, cache, missing-username, and fallback cases are covered by the existing unit tests.

## Recommended next actions

1. Upgrade the TanStack/Vite toolchain together and clear the dependency audit.
2. Add and verify deployment security headers.
3. Optimize the oversized social icons and add missing SEO metadata.
4. Run a screen-reader/keyboard accessibility pass and verify contact delivery on a Netlify deploy preview.
