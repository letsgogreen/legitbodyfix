# R2 video upload setup

The admin page asks the server for a 15-minute, single-file upload URL. The browser then uploads the video directly to R2, so large files do not pass through Vercel.

## Required Vercel Production environment variables

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET=legitbodyfix-videos`
- `R2_PUBLIC_BASE_URL`

`R2_PUBLIC_BASE_URL` must be the HTTPS public address of the bucket, without a trailing slash. Use a custom domain for production, for example `https://media.example.com`. Cloudflare's `r2.dev` URL is suitable only for temporary testing.

## Required R2 CORS policy

In Cloudflare R2, open the `legitbodyfix-videos` bucket, open **Settings**, then add this CORS policy:

```json
[
  {
    "AllowedOrigins": ["https://legitbodyfix.vercel.app"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Do not put any R2 secret in browser code, GitHub, or this file.
