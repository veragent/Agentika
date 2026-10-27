/**
 * Chrome Origin Trial token for WebMCP on www.agentika.web.id.
 *
 * Origin trial tokens are PUBLIC BY DESIGN: the browser receives this token
 * in a response header (and a meta tag) on every page load, and anyone can
 * read it from the served page. It is not a secret, API key, or credential.
 *
 * Registered origin: https://www.agentika.web.id:443 (subdomains included).
 * Feature: WebMCP. Expires: 2027-03-30 07:00 WIB.
 * Renew the trial before expiry or WebMCP stops activating for visitors.
 *
 * Used in two places (same token, kept in sync):
 * - next.config.ts → `Origin-Trial` response header (all pages).
 * - src/app/layout.tsx → <meta http-equiv="origin-trial"> (document head).
 */
export const WEBMCP_ORIGIN_TRIAL_TOKEN =
  "A/kKBhPnAj0UkY9Qce2PmvbAoOQvwerAP7iO3HO1/H0pIxCQkyK5k2OkG6vUgVSrK3uD3DpXZlOH/QhBbuXOew8AAAB6eyJvcmlnaW4iOiJodHRwczovL3d3dy5hZ2VudGlrYS53ZWIuaWQ6NDQzIiwiZmVhdHVyZSI6IldlYk1DUCIsImV4cGlyeSI6MTgwNjM2NDgwMCwiaXNTdWJkb21haW4iOnRydWUsImlzVGhpcmRQYXJ0eSI6dHJ1ZX0="
