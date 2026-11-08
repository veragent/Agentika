import { defineCloudflareConfig } from "@opennextjs/cloudflare"

// Staging test: default dummy cache overrides (no KV/R2 bindings yet).
// ISR revalidation will not persist across requests in this config;
// that is acceptable for the staging smoke test. For production,
// bind KV (tag cache) + R2 (incremental cache) as documented at
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig()
