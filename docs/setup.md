# Project Setup Notes

## Supabase Storage

Med Scan uses a Supabase Storage bucket named `attachments` for uploaded PDFs, images, and videos. The bucket is private, not public.

Uploaded files should be saved with their object path stored in `public.attachments.storage_path`. Public users can only read objects whose `storage_path` belongs to an attachment on a published product. Draft product attachments and unlinked objects are not readable by anonymous users.

The frontend should generate signed URLs when a pharmacist opens an attachment instead of exposing a public bucket URL. This supports PDF, image, and video attachments while keeping unpublished content protected. External media such as YouTube links should continue to use `public.attachments.external_url`.

Authenticated admins listed in `public.admin_users` can upload, replace, and delete objects in the `attachments` bucket. Allowed uploaded MIME types are PDF, common web image formats, and MP4/WebM/QuickTime video, with a 50 MB object size limit.

## Local Seed Data

The local seed migration creates a published demo product and a draft demo product.

Useful public lookup barcodes:

- `5901234123457` published demo product, EAN-13.
- `96385074` same published demo product, EAN-8 alias.
- `4006381333931` draft demo product, should behave as not found publicly.

The published demo product includes sample PDF, image, and external link attachment metadata. The storage paths are metadata fixtures for UI testing; upload matching files to the `attachments` bucket only when testing actual file opening.
