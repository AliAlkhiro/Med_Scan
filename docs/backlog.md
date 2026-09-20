# Med Scan MVP Backlog

This backlog breaks the Med Scan MVP into manageable development steps. It is based on the product scope, routes, data model, security model, and recommended build order in [design.md](design.md).

Each item should be small enough to implement, test, and review independently. Later items should not expand the MVP beyond the non-goals in [design.md](design.md#3-non-goals).

## Milestone 0: Project Foundation

### 0.1 Create the frontend app shell - Done

References: [design.md sections 6 and 7](design.md#6-recommended-tech-stack)

Scope:

- Create a Vite React TypeScript project.
- Add Tailwind CSS.
- Set up basic routing for public and admin paths.
- Add placeholder pages for all MVP routes.
- Add environment variable handling for Supabase settings.

Acceptance criteria:

- The app runs locally.
- Routes exist for `/`, `/product/:barcode`, `/not-found/:barcode`, `/admin/login`, `/admin/products`, `/admin/products/new`, `/admin/products/:id`, and `/admin/metrics`.
- Admin code is route-separated so it can be lazy-loaded later.

### 0.2 Add shared application layout and UI primitives - Done

References: [design.md sections 8 and 13](design.md#8-pharmacist-interface)

Scope:

- Add minimal layouts for pharmacist and admin areas.
- Add reusable loading, error, empty state, button, input, textarea, select, and status components.
- Keep the pharmacist interface simple and scan-focused.

Acceptance criteria:

- Public pages do not expose admin navigation.
- Admin pages have a consistent management layout.
- Loading, retry, and error states can be reused by later work.

## Milestone 1: Supabase Backend Baseline

### 1.1 Create database schema migrations - Done

References: [design.md section 11](design.md#11-data-model)

Scope:

- Create migrations for `products`, `product_barcodes`, `attachments`, `usage_metrics`, and optional `admin_users`.
- Add constraints for unique barcodes and product relationships.
- Add timestamps and basic indexes for barcode lookup and metrics queries.

Acceptance criteria:

- Migrations can create the schema from scratch.
- `product_barcodes.barcode` is unique.
- Attachments require either `storage_path` or `external_url`.
- Attachment type is constrained to `pdf`, `image`, `video`, or `link`.

### 1.2 Configure Supabase Storage - Done

References: [design.md sections 10 and 14](design.md#10-attachments)

Scope:

- Create an attachments storage bucket.
- Decide whether files are public or accessed through signed URLs.
- Document the chosen behavior in the project setup notes.

Acceptance criteria:

- Admins can upload files to the bucket.
- Public users can only open attachments linked to published products.
- The chosen access model supports PDF, image, and video files.

### 1.3 Add Row Level Security policies - Done

References: [design.md section 14](design.md#14-security-and-permissions)

Scope:

- Enable RLS on MVP tables.
- Add public read access for published product lookup only.
- Prevent public listing of all products.
- Allow authenticated admins to manage product data, barcodes, attachments, and metrics views.
- Allow anonymous usage metric creation without storing identity.

Acceptance criteria:

- Draft products are hidden from public access.
- Public users cannot create, update, or delete product data.
- Authenticated admins can perform all MVP admin actions.
- Anonymous metrics can be inserted without pharmacist, patient, or pharmacy identity.

### 1.4 Add seed data for local testing - Done

References: [design.md sections 9, 10, and 17](design.md#17-mvp-scope)

Scope:

- Add at least one published product.
- Add at least one draft product.
- Add multiple barcodes to one product.
- Add sample attachment metadata.

Acceptance criteria:

- Published product lookup succeeds by barcode.
- Draft product lookup returns not found for public users.
- Seed data supports product detail, not-found, and attachment UI testing.

## Milestone 2: Public Pharmacist Lookup

### 2.1 Build product lookup service - Done

References: [design.md section 12](design.md#12-api-design)

Scope:

- Implement lookup by barcode using Supabase.
- Return only published product details.
- Return attachment metadata, not file contents.
- Record `scan_found` and `scan_not_found` events.

Acceptance criteria:

- Published product barcode returns product details.
- Missing barcode returns a not-found result.
- Draft product barcode behaves like not found.
- Metrics are recorded anonymously.

### 2.2 Build product details page - Done

References: [design.md sections 5.1, 8, and 9](design.md#9-product-details-content)

Scope:

- Display compact product details for a scanned barcode.
- Show key fields first: trade name, generic name, strength, dosage form, manufacturer, and pack description.
- Show optional details only when present.
- Add a clear "scan another product" action.

Acceptance criteria:

- Product details are readable on mobile.
- Missing optional fields do not create empty UI sections.
- The page can be loaded directly from `/product/:barcode`.
- The pharmacist can return to scanning in one tap.

### 2.3 Build product not-found page - Done

References: [design.md section 5.1](design.md#51-pharmacist-product-lookup)

Scope:

- Show a simple not-found message for unknown or unpublished barcodes.
- Show the scanned barcode.
- Add a "scan another product" action.

Acceptance criteria:

- The page does not imply the medicine is invalid or unsafe.
- The page keeps the pharmacist workflow simple.
- The scanned barcode is visible for troubleshooting.

## Milestone 3: Camera Scanner

### 3.1 Add barcode scanner screen - Done

References: [design.md sections 6 and 8](design.md#8-pharmacist-interface)

Scope:

- Add camera scanning with `@zxing/browser`.
- Prioritize 1D barcode formats listed in the design document.
- Navigate to product details or not-found result after a scan.
- Prevent duplicate rapid submissions for the same scan event.

Acceptance criteria:

- The scanner starts from `/`.
- Supported 1D barcodes can be detected on a real phone camera.
- The scanner shows clear permission, loading, scanning, and error states.
- A successful scan stops or pauses scanning before navigation.

### 3.2 Add scanner device controls - Done

References: [design.md section 8](design.md#8-pharmacist-interface)

Scope:

- Add a torch toggle when the device supports it.
- Add camera permission recovery messaging.
- Add a retry action when camera startup fails.

Acceptance criteria:

- The torch button only appears when supported.
- Permission denial shows an understandable recovery path.
- Scanner failure does not trap the user on a broken screen.

### 3.3 Field-test scanner behavior - Done

References: [design.md sections 17 and 20](design.md#20-recommended-build-order)

Scope:

- Test scanning on real phones.
- Test with local Iraqi medicine packages where available.
- Record barcode types that succeed or fail.

Acceptance criteria:

- Field test notes identify tested devices, browsers, product packages, and barcode formats.
- Any need for 2D/Data Matrix support is documented as a future decision, not added silently to MVP scope.

## Milestone 4: Admin Authentication and Product Management

### 4.1 Build admin login and route protection - Done

References: [design.md sections 7 and 14](design.md#14-security-and-permissions)

Scope:

- Add Supabase Auth login for admins.
- Protect all `/admin/*` routes except `/admin/login`.
- Add logout.
- Redirect unauthenticated users to login.

Acceptance criteria:

- Public pharmacist routes remain accessible without login.
- Admin routes require authenticated admin access.
- Login and logout work across page refreshes.

### 4.2 Build admin product list - Done

References: [design.md sections 5.3 and 17](design.md#17-mvp-scope)

Scope:

- List products for admins.
- Show trade name, generic name, published status, last reviewed date, and updated date.
- Add actions to create or edit products.

Acceptance criteria:

- Admins can see draft and published products.
- The list makes publication status obvious.
- Admins can navigate to create and edit screens.

### 4.3 Build product create/edit form - Done

References: [design.md sections 9 and 15](design.md#15-content-quality-and-safety)

Scope:

- Add form fields for MVP product details.
- Support save as draft.
- Support publish and unpublish.
- Require enough content for a useful public detail page before publishing.

Acceptance criteria:

- Admins can create a draft product.
- Admins can edit existing products.
- Publishing requires core fields such as trade name and at least one barcode.
- Public lookup changes when a product is published or unpublished.

### 4.4 Add barcode management - Done

References: [design.md section 11.2](design.md#112-product_barcodes)

Scope:

- Allow admins to add and remove product barcodes.
- Capture barcode type when known.
- Validate duplicate barcodes before save.

Acceptance criteria:

- One product can have multiple barcodes.
- Duplicate barcodes cannot be saved.
- Removing a barcode removes public lookup by that barcode.

## Milestone 5: Attachments

### 5.1 Add attachment metadata management - Done

References: [design.md section 10](design.md#10-attachments)

Scope:

- Allow admins to add, edit, remove, and reorder attachment metadata.
- Support labels, type, file path, external URL, size, and MIME type.
- Support YouTube or external video links.

Acceptance criteria:

- Each attachment has a clear pharmacist-facing label.
- Attachments can be sorted.
- Invalid metadata, such as missing both file and external URL, cannot be saved.

### 5.2 Add file upload for attachments - Done

References: [design.md sections 10 and 13](design.md#13-slow-internet-strategy)

Scope:

- Upload PDFs, images, and videos to Supabase Storage.
- Store resulting metadata in `attachments`.
- Avoid automatically loading uploaded files in the public product response.

Acceptance criteria:

- Admins can upload supported file types.
- Uploaded file metadata is saved with the product.
- Public product details still return metadata only.

### 5.3 Build public attachment opening - Done

References: [design.md sections 5.2 and 12](design.md#12-api-design)

Scope:

- Add attachment buttons to product details.
- Open files or external links only when tapped.
- Verify attachment belongs to a published product before opening.
- Record `attachment_opened` metrics.

Acceptance criteria:

- Attachments are not preloaded with product details.
- Tapping an attachment opens the correct file or external link.
- Draft product attachments cannot be opened publicly.
- Attachment-open metrics are recorded anonymously.

## Milestone 6: Metrics

### 6.1 Add metrics query layer - Done

References: [design.md sections 11.4 and 16](design.md#16-metrics)

Scope:

- Add queries for total scans, found scans, not-found scans, most scanned products, common missing barcodes, and attachment opens.
- Keep metrics anonymous.

Acceptance criteria:

- Metrics do not expose pharmacist, patient, device, or pharmacy identity.
- Query results match the event types in the design document.
- Queries are efficient enough for MVP volumes.

### 6.2 Build admin metrics page - Done

References: [design.md sections 7 and 16](design.md#16-metrics)

Scope:

- Display MVP metrics in a simple admin view.
- Add basic date range filtering if it can be done without expanding scope significantly.

Acceptance criteria:

- Admins can see total scans, found scans, not-found scans, common missing barcodes, most scanned products, and attachment opens.
- The page is protected behind admin auth.
- No personal or pharmacy-level tracking is shown.

## Milestone 7: Slow Internet and PWA Readiness

### 7.1 Add PWA app shell caching - Done

References: [design.md sections 6, 13, and 17](design.md#13-slow-internet-strategy)

Scope:

- Configure `vite-plugin-pwa`.
- Cache the app shell.
- Avoid caching the full product database.
- Avoid preloading attachments.

Acceptance criteria:

- The app shell can reload after first visit on poor connectivity.
- Product data still comes from backend lookup.
- Attachments are fetched only after user action.

### 7.2 Cache most recently viewed product locally - Done

References: [design.md section 13](design.md#13-slow-internet-strategy)

Scope:

- Cache the most recently viewed product details locally.
- Show a clear stale/offline state if cached content is used.

Acceptance criteria:

- Recent product details can be displayed when backend lookup temporarily fails.
- Cached content is clearly identified as cached.
- Cache does not become a full offline product database.

### 7.3 Bundle and loading optimization

References: [design.md section 13](design.md#13-slow-internet-strategy)

Scope:

- Lazy-load admin routes.
- Review initial bundle size.
- Ensure product details are text-first and attachment-light.

Acceptance criteria:

- Public scanner route does not eagerly load admin-only code.
- Initial loading behavior is acceptable on slow connections.
- Large assets are not included in the initial app bundle.

## Milestone 8: Deployment and Release Validation

### 8.1 Configure deployment environments

References: [design.md section 6](design.md#6-recommended-tech-stack)

Scope:

- Configure Vercel deployment.
- Configure Supabase environment variables.
- Document local, preview, and production setup.

Acceptance criteria:

- The app can deploy to Vercel.
- Supabase credentials are environment-specific.
- Setup instructions are enough for another developer to run the app.

### 8.2 Run MVP acceptance testing

References: [design.md sections 17 and 20](design.md#20-recommended-build-order)

Scope:

- Test the complete pharmacist lookup flow.
- Test the complete admin product creation flow.
- Test publish/unpublish visibility.
- Test attachment opening.
- Test metrics recording.

Acceptance criteria:

- A seeded product can be scanned and viewed on a phone.
- An admin can create, publish, edit, and unpublish a product.
- Unknown barcodes show not found.
- Attachments open only when tapped.
- Metrics are recorded without identity data.

### 8.3 Prepare MVP launch checklist

References: [design.md sections 15 and 19](design.md#15-content-quality-and-safety)

Scope:

- Confirm medical/content review ownership.
- Confirm initial product records are reviewed before publishing.
- Confirm unsupported features remain out of scope.
- Document known risks and post-MVP decisions.

Acceptance criteria:

- Launch checklist explicitly names who reviews product content.
- Initial published records have `last_reviewed_at` values.
- Deferred items such as 2D barcode support and multilingual UI remain tracked as future work.

## Future Backlog Candidates

These items are intentionally outside the MVP unless field testing or product review changes the scope. They come from [design.md section 18](design.md#18-future-enhancements).

- Admin product search.
- Pharmacist-side manual barcode entry.
- Arabic, Kurdish, and English language support.
- 2D/Data Matrix barcode support.
- Reviewer approval workflow.
- Spreadsheet import.
- Duplicate barcode detection tools.
- Image compression pipeline.
- Better video hosting workflow.
- Offline cache for selected products.
- Admin audit log.
- Country-specific regulatory source links.
- Native wrapper if web camera support is insufficient.
