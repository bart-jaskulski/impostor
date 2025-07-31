## Image Storage (S3 Configuration)

The following environment variables are required to configure the application for storing images using an S3-compatible service:

- `S3_ENDPOINT`: (Optional) The complete URL to the S3-compatible storage endpoint (e.g., `http://localhost:9000` for a local MinIO instance, or the endpoint provided by your S3-compatible storage provider). **If you are using AWS S3, this variable should generally not be set.**
- `S3_REGION`: The AWS region where your S3 bucket is located (e.g., `us-east-1`, `eu-west-2`).
- `S3_ACCESS_KEY_ID`: The access key ID for your S3 service account.
- `S3_SECRET_ACCESS_KEY`: The secret access key for your S3 service account.
- `S3_BUCKET_NAME`: The name of the S3 bucket where images will be stored.
