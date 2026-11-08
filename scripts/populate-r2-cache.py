#!/usr/bin/env python3
"""Populate the Agentika staging R2 incremental cache from a local OpenNext build.

Why this script exists
----------------------
`opennextjs-cloudflare deploy` populates the R2 incremental cache as part of
the deploy, but its `ensureR2Bucket` step calls the Cloudflare API through the
`cloudflare` JS SDK, whose HTTP client bypasses this VM's egress proxy. The
vault credential reaches the API only as an `hsurr:` surrogate that the proxy
swaps for the real token, so the SDK call is rejected with 400/9106
"Authentication failed" and the whole deploy aborts before uploading.

`wrangler r2 object put` (and curl, and Node fetch) go through the proxy, so
the surrogate is swapped and the calls authenticate. This script replicates
exactly what the adapter's `populateCache` does — same asset walk
(`getCacheAssets`), same key derivation (`computeCacheKey`:
`incremental-cache/<buildId>/<sha256(routeKey) hex>.<cache|fetch>`) — but
uploads with `wrangler r2 object put` instead of the adapter's populate
worker.

Usage (from the repo root, after `npx opennextjs-cloudflare build`):
    python3 scripts/populate-r2-cache.py
Then deploy the already-built worker without re-running populate:
    CLOUDFLARE_API_TOKEN=<surrogate> OPEN_NEXT_DEPLOY=true wrangler deploy

The surrogate is fetched from the registered `custom.cloudflare` connection
at runtime; no credential is stored in this file. Re-run after every rebuild:
a new build has a new build ID, so all cache keys change.
"""
import hashlib
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import dynamic_credential_entry

BUCKET = "agentika-staging-inc-cache"
ACCOUNT_ID = "39058c7c1fe9230c935b19991fa373fe"
PREFIX = "incremental-cache"
WORKERS = 8


def collect_assets(cache_dir: Path):
    """Mirror the adapter's getCacheAssets(): (r2_key, file_path) pairs."""
    assets = []
    for path in sorted(cache_dir.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(cache_dir).as_posix()
        parts = rel.split("/")
        if parts[0] == "__fetch":
            if len(parts) < 3:
                raise ValueError(f"Invalid fetch cache path: {rel}")
            build_id, key_parts = parts[1], parts[2:]
            route_key = "/" + "/".join(key_parts)
            cache_type = "fetch"
        else:
            if not rel.endswith(".cache") or len(parts) < 2:
                raise ValueError(f"Invalid cache path: {rel}")
            build_id, key_parts = parts[0], parts[1:]
            route_key = "/" + "/".join(key_parts)
            route_key = route_key[: -len(".cache")]
            cache_type = "cache"
        digest = hashlib.sha256(route_key.encode()).hexdigest()
        r2_key = f"{PREFIX}/{build_id}/{digest}.{cache_type}"
        assets.append((r2_key, str(path)))
    return assets


def upload(env, item):
    r2_key, filepath = item
    result = subprocess.run(
        ["wrangler", "r2", "object", "put", f"{BUCKET}/{r2_key}",
         "--file", filepath, "--remote"],
        capture_output=True, text=True, timeout=120, env=env,
    )
    ok = result.returncode == 0
    if not ok:
        print(f"FAILED {r2_key}: {(result.stdout + result.stderr)[-300:]}")
    return ok


def main():
    repo = Path(__file__).resolve().parent.parent
    cache_dir = repo / ".open-next" / "cache"
    if not cache_dir.is_dir():
        print("No .open-next/cache found; run `npx opennextjs-cloudflare build` first.")
        return 2
    assets = collect_assets(cache_dir)
    print(f"{len(assets)} cache assets to upload to R2 bucket {BUCKET}")
    surr = str(dynamic_credential_entry("custom.cloudflare", "access_token")["surrogate"]).strip()
    env = dict(os.environ,
               CLOUDFLARE_API_TOKEN=surr,
               CLOUDFLARE_ACCOUNT_ID=ACCOUNT_ID)
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        results = list(pool.map(lambda item: upload(env, item), assets))
    failed = results.count(False)
    print(f"Uploaded {results.count(True)}/{len(results)} objects; {failed} failed.")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
