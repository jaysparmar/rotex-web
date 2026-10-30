## Environment variables

See `.env.example` for the full list. Notes on the S3 media storage vars:

- `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — required for all file uploads (admin media, enquiry/job-application attachments, variant-image import). The bucket must have a public-read bucket policy; this app doesn't sign URLs.
- `AWS_S3_PUBLIC_URL_BASE` — optional. Set this to serve the bucket through a CloudFront/custom domain instead of the raw S3 endpoint. If set, also add that hostname to `images.remotePatterns` in `next.config.ts`.
