# Project Setup Notes

## Local Frontend Environment

Med Scan is a Vite React app. Local configuration comes from `.env.local`, which should not be committed.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create local environment variables from the example file:

   ```sh
   cp .env.example .env.local
   ```

3. Fill in the Supabase settings for the environment you want to use:

   ```sh
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

4. Start the local dev server:

   ```sh
   npm run dev
   ```

5. Open the local app at the Vite URL shown in the terminal. The default configured URL is `http://127.0.0.1:5175`.

## Supabase Environment Setup

Use separate Supabase projects for preview/staging and production whenever possible. This keeps draft validation, demo uploads, and test metrics out of the production database.

For each Supabase project:

1. Create or select the Supabase project.
2. Apply the database migrations from `supabase/migrations`.
3. Confirm the private `attachments` storage bucket exists.
4. Confirm Row Level Security policies are enabled.
5. Create at least one admin auth user for `/admin/login`.
6. Add that admin user's auth ID to `public.admin_users`.
7. Seed local or preview data only in non-production environments.
8. Copy the project URL and public anon key for frontend configuration.

The frontend only needs the public Supabase URL and anon key. Do not put service-role keys, database passwords, or other server secrets in Vite environment variables.

### First Admin User

Admin login has two checks:

1. The email/password must exist in Supabase Authentication.
2. The authenticated user's UUID must be listed in `public.admin_users`.

To bootstrap the first admin:

1. Open the Supabase dashboard for the target environment.
2. Go to Authentication -> Users.
3. Create the admin user or open the existing admin user.
4. Copy the user's UUID.
5. Open SQL Editor and insert the admin row:

   ```sql
   insert into public.admin_users (auth_user_id, display_name)
   values ('00000000-0000-0000-0000-000000000000', 'Admin')
   on conflict (auth_user_id) do update
   set display_name = excluded.display_name;
   ```

6. Replace `00000000-0000-0000-0000-000000000000` with the copied Auth user UUID.

If login succeeds but the app says the account is not listed as a Med Scan admin, this row is missing or points to a different Supabase project.

## Vercel Deployment

Vercel can deploy this app as a standard Vite project.

### One-Time Project Setup

1. Push the repository to the Git provider connected to Vercel.
2. In Vercel, create a new project from the repository.
3. Use the following build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | Vite |
   | Install command | `npm install` |
   | Build command | `npm run build` |
   | Output directory | `dist` |

4. Add environment variables in Vercel:

   | Variable | Preview value | Production value |
   | --- | --- | --- |
   | `VITE_SUPABASE_URL` | Preview Supabase project URL | Production Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Preview public anon key | Production public anon key |

5. Set the production branch in Vercel to the branch used for releases.
6. Keep `vercel.json` in the repository so direct React Router URLs such as `/admin/login` load `index.html`.
7. Deploy once from Vercel to confirm the build succeeds.

### Preview Deployment Flow

Use preview deployments for release candidates and acceptance testing.

1. Open a branch or pull request.
2. Confirm Vercel creates a preview deployment.
3. Confirm the preview deployment uses preview Supabase variables.
4. Run the MVP acceptance checks against the preview URL before merging.

### Production Deployment Flow

Use production only after content and acceptance testing are complete.

1. Confirm the production Supabase project has the latest migrations.
2. Confirm production admin users exist and can sign in.
3. Confirm initial published products have `last_reviewed_at` values.
4. Merge the release branch into the configured production branch.
5. Wait for the Vercel production deployment to finish.
6. Run the release validation checks against the production URL.

## Release Validation Checks

Before treating a deployment as ready, verify these checks on the deployed URL:

1. The scanner route `/` loads on a mobile browser over HTTPS.
2. Camera permission can be granted and the scanner starts.
3. A published barcode opens `/product/:barcode`.
4. An unknown or draft barcode opens `/not-found/:barcode`.
5. Product details show text first and do not preload attachments.
6. Attachment buttons open files or external links only after tapping.
7. `/admin/login` accepts a valid admin account.
8. `/admin/products` is blocked when signed out and available when signed in.
9. An admin can create a draft product, publish it, edit it, and unpublish it.
10. Metrics are recorded for found scans, not-found scans, and attachment opens without identity data.

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
