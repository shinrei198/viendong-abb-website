# Cloudflare setup for media and quote requests

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

`wrangler.json` already binds `MEDIA` to `viendong-media` and enables the Images binding as `IMAGES`.

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

