# Project Setup Notes

## Supabase Storage

Med Scan uses a Supabase Storage bucket named `attachments` for uploaded PDFs, images, and videos. The bucket is private, not public.

Uploaded files should be saved with their object path stored in `public.attachments.storage_path`. Public users can only read objects whose `storage_path` belongs to an attachment on a published product. Draft product attachments and unlinked objects are not readable by anonymous users.

The frontend should generate signed URLs when a pharmacist opens an attachment instead of exposing a public bucket URL. This supports PDF, image, and video attachments while keeping unpublished content protected. External media such as YouTube links should continue to use `public.attachments.external_url`.

Authenticated admins listed in `public.admin_users` can upload, replace, and delete objects in the `attachments` bucket. Allowed uploaded MIME types are PDF, common web image formats, and MP4/WebM/QuickTime video, with a 50 MB object size limit.
