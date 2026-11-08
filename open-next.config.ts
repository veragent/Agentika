import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import R2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"
import KVTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache"

// Staging: R2 incremental cache + KV tag cache, bound in wrangler.jsonc
// (NEXT_INC_CACHE_R2_BUCKET, NEXT_TAG_CACHE_KV). KV tag cache is
// experimental and eventually consistent (revalidation can take up to ~60s).
export default defineCloudflareConfig({
  incrementalCache: R2IncrementalCache,
  tagCache: KVTagCache,
})
