# Cloudflare setup for media and quote requests

## Production CMS storage

Editable website content is stored in D1, independently from deployed source files.
The `cms_sections` table keeps a separate revisioned row for each content group:

- `news` and `newsCategories`
- `videos` and `videoCategories`
- `banners`
- `products`
- `settings`
- `homePage`

Run all D1 migrations before deploying the Worker:

```powershell
npx wrangler d1 migrations apply viendong-quotes --remote
npm run build
npx wrangler deploy
```

On the first `GET /api/content` after migration, the Worker imports the legacy
`site_data` KV value only when `cms_sections` is empty. It records the completed
migration as `legacy-kv-site-data-v1` and leaves the KV value untouched as a
rollback source. Later code deployments never reseed or replace populated D1
content.

Each admin write updates only one section through `PUT /api/content/:section`.
The client sends the last revision it loaded; D1 rejects stale writes with HTTP
409 so two open admin sessions cannot silently overwrite each other.

Production verification:

```powershell
npx wrangler d1 execute viendong-quotes --remote --command "SELECT section_key, revision, updated_at, length(payload_json) AS bytes FROM cms_sections ORDER BY section_key;"
```

Do not delete the legacy KV `site_data` key until D1 backups and restore drills
have been verified. New media files remain in R2 and are not stored in D1.

The application code is ready for D1 and R2, but the production resources must be created in the target Cloudflare account before deployment.

## 1. Create and bind D1

```powershell
npx wrangler d1 create viendong-quotes
```

Copy the returned `database_id` into `wrangler.json`:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "viendong-quotes",
    "database_id": "PASTE_DATABASE_ID_HERE"
  }
]
```

Then apply the schema:

```powershell
npx wrangler d1 migrations apply viendong-quotes --remote
```

## 2. Create R2 media storage

`wrangler.json` binds `MEDIA` to `viendong-media`. The admin converts source files to WebP in the browser before upload, so a paid Cloudflare Images binding is optional rather than required.

```powershell
npx wrangler r2 bucket create viendong-media
```

New images uploaded in admin are resized in the browser, encoded as WebP, optionally normalized again by Cloudflare Images, and stored in R2. TIFF input is decoded in the browser before upload.

## 3. Migrate the current public product images

Preview the migration list first:

```powershell
npm run r2:migrate
```

After verifying the bucket/account, execute it:

```powershell
npm run r2:migrate -- --execute
```

The object keys preserve current paths such as `products/...`. The Worker reads R2 first and falls back to the deployed static asset, so a partial migration does not break product images.
