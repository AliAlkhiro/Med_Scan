# Med Scan Design Document

## 1. Project Summary

Med Scan is a lightweight web application for pharmacists in Iraq. Its purpose is simple: scan a medicine or medical product barcode and immediately display centrally maintained product details.

The application is not a pharmacy management system, dispensing system, inventory system, or prescription workflow. It is a support/reference tool for unusual medicines, unfamiliar products, medical devices, or products where the pharmacist wants quick access to trusted reference material.

The system has two areas in one web app:

- Public pharmacist area: no login, scan-only, read-only.
- Admin area: login required, central data entry and product management.

The first version should prioritize speed, reliability on slow internet, and simple mobile use.

## 2. Goals

- Let a pharmacist scan a product barcode and view product details quickly.
- Support 1D barcodes for the MVP.
- Keep the pharmacist interface extremely simple: scan product, get details.
- Allow a central admin team to create, edit, publish, and unpublish product records.
- Support optional product attachments, downloaded only when requested.
- Work well on mobile devices and unstable or slow internet connections.
- Collect simple anonymous usage metrics to measure adoption and usefulness.
- Avoid patient data, prescription data, scan tracking, batch data, and expiry data.

## 3. Non-Goals

The MVP will not include:

- Pharmacist login.
- Product search.
- Prescription or patient workflow.
- Dispensing decisions or automated clinical recommendations.
- Batch number, serial number, or expiry tracking.
- Inventory management.
- Pharmacy management system integration.
- Individual pharmacist scan history.
- Offline-first full product database synchronization.
- Medical claim verification against official regulatory systems.
- 2D/Data Matrix barcode support, unless field testing shows it is needed.
- Multilingual pharmacist UI.
- Multiple admin roles or reviewer/editor separation.

## 4. Target Users

### Pharmacist

Pharmacists use the public scanner when they encounter an unfamiliar medicine, medical product, or device. They need a fast answer and should not have to log in, search, browse menus, or manage app state.

### Central Admin

Central admins maintain the trusted product database. They create product records, attach supporting files, review content, and publish records for pharmacist use.

## 5. Core User Flows

### 5.1 Pharmacist Product Lookup

1. Pharmacist opens the web app.
2. The scanner screen opens.
3. Pharmacist allows camera access.
4. Pharmacist scans a barcode.
5. App sends the barcode to the backend.
6. If the product exists and is published, the app displays product details.
7. If the product is not found, the app shows a simple not-found message.
8. Pharmacist can scan another product.

### 5.2 Pharmacist Attachment Access

1. Pharmacist views a product details page.
2. Attachments are shown as buttons, such as "Open leaflet", "View image", or "Watch video".
3. The attachment is downloaded or opened only when the pharmacist taps the button.
4. The app records an anonymous attachment-open metric.

### 5.3 Admin Product Creation

1. Admin logs in.
2. Admin opens the product management area.
3. Admin creates a product record.
4. Admin enters one or more barcodes.
5. Admin enters structured product details.
6. Admin uploads optional attachments.
7. Admin saves as draft or publishes.
8. Published products become available to the pharmacist scanner.

## 6. Recommended Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- PWA support through `vite-plugin-pwa`
- Barcode scanning through `@zxing/browser`

Rationale: This stack is fast to build, lightweight in the browser, easy to deploy, and suitable for a small PWA. It avoids the extra complexity of server-side rendering, which is not necessary for the MVP.

The MVP should optimize for common 1D barcode formats used on target products, such as EAN-13, EAN-8, UPC-A, UPC-E, and Code 128. The scanner implementation should not prevent adding 2D/Data Matrix support later, but 2D parsing is not part of the first release.

### Backend and Data

- Supabase Postgres
- Supabase Auth for admins only
- Supabase Storage for PDFs, images, and videos
- Supabase Row Level Security policies

Rationale: Supabase provides a hosted database, authentication, file storage, access control, and APIs without requiring a custom backend for the MVP.

### Hosting

- Vercel for the web app
- Supabase hosted project for backend services

Rationale: This combination allows quick deployment, preview builds, and minimal infrastructure maintenance.

## 7. Application Structure

Suggested routes:

- `/` pharmacist scanner
- `/product/:barcode` product details after scan
- `/not-found/:barcode` product not found result
- `/admin/login` admin login
- `/admin/products` product list
- `/admin/products/new` create product
- `/admin/products/:id` edit product
- `/admin/metrics` simple usage metrics

The pharmacist routes must remain public. Admin routes must require authentication.

## 8. Pharmacist Interface

The pharmacist interface should have only the essentials:

- Camera scanner view.
- Torch button if supported by the device.
- Clear scan status.
- Product details page.
- Scan another product button.
- Attachment buttons.
- Product not found page.

There should be no pharmacist account, no settings screen, no search field, and no product browsing in the MVP.

## 9. Product Details Content

A product record should support:

- Trade name
- Generic name or active ingredient
- Strength
- Dosage form
- Manufacturer
- Country of origin, if useful
- Pack description
- Therapeutic class
- Indications summary
- Counseling notes
- Important warnings
- Contraindications
- Storage instructions
- Application or administration instructions
- Extra notes
- Last reviewed date
- Published status

The exact fields can be adjusted during implementation, but the product page should remain compact and readable on a phone.

## 10. Attachments

Supported attachment types:

- PDF
- Image
- Video
- External video URL, if direct video hosting is not desired
- YouTube link

Attachment behavior:

- Attachments are not loaded with the product details response.
- Product details return only attachment metadata.
- Files are downloaded or opened only when tapped.
- Each attachment should show a label, type, and approximate size when available.
- Large uploaded video files should be avoided in the first version unless hosting and compression are planned carefully.
- Videos may be either uploaded files or YouTube links.

## 11. Data Model

### 11.1 products

Stores the central product reference record.

Fields:

- `id`
- `trade_name`
- `generic_name`
- `strength`
- `dosage_form`
- `manufacturer`
- `country_of_origin`
- `pack_description`
- `therapeutic_class`
- `indications`
- `counseling_notes`
- `warnings`
- `contraindications`
- `storage_instructions`
- `application_instructions`
- `extra_notes`
- `is_published`
- `last_reviewed_at`
- `created_at`
- `updated_at`

### 11.2 product_barcodes

Allows one product to have multiple barcodes.

Fields:

- `id`
- `product_id`
- `barcode`
- `barcode_type`
- `created_at`

Constraints:

- `barcode` should be unique.
- `product_id` references `products.id`.

### 11.3 attachments

Stores attachment metadata. Actual files are stored in Supabase Storage.

Fields:

- `id`
- `product_id`
- `label`
- `type`
- `storage_path`
- `external_url`
- `size_bytes`
- `mime_type`
- `sort_order`
- `created_at`
- `updated_at`

Rules:

- Either `storage_path` or `external_url` should be present.
- `type` should be one of `pdf`, `image`, `video`, or `link`.
- YouTube videos should be stored as external links.

### 11.4 usage_metrics

Stores anonymous product usage events.

Fields:

- `id`
- `event_type`
- `barcode`
- `product_id`
- `attachment_id`
- `created_at`

Suggested event types:

- `scan_found`
- `scan_not_found`
- `attachment_opened`

No user identity, device identity, patient data, or pharmacy identity is required for the MVP.

### 11.5 admin_users

Admin users can be managed through Supabase Auth. A separate profile table may be added if role metadata is needed.

Fields:

- `id`
- `auth_user_id`
- `display_name`
- `role`
- `created_at`

## 12. API Design

The MVP can use Supabase client APIs directly from the frontend with Row Level Security. If more control is needed, a thin API layer can be added later.

### Public Product Lookup

Input:

- `barcode`

Behavior:

- Find matching barcode in `product_barcodes`.
- Join to `products`.
- Return product only if `is_published = true`.
- Return attachment metadata, not files.
- Record `scan_found` or `scan_not_found`.

Response shape:

```json
{
  "product": {
    "id": "uuid",
    "tradeName": "Example Medicine",
    "genericName": "Example ingredient",
    "strength": "500 mg",
    "dosageForm": "Tablet",
    "manufacturer": "Example Pharma",
    "details": [
      {
        "label": "Storage",
        "value": "Store below 25 C."
      }
    ],
    "attachments": [
      {
        "id": "uuid",
        "label": "Patient leaflet",
        "type": "pdf",
        "sizeBytes": 240000
      }
    ]
  }
}
```

### Attachment Open

Input:

- `attachment_id`

Behavior:

- Verify the attachment belongs to a published product.
- Generate or return a public/signed URL.
- Record `attachment_opened`.

## 13. Slow Internet Strategy

The pharmacist app should be optimized for low bandwidth:

- Small initial JavaScript bundle.
- Lazy-load admin code separately from pharmacist code.
- Cache the app shell through PWA service worker.
- Do not preload PDFs, images, or videos.
- Compress images before upload.
- Prefer short compressed videos or external hosted videos.
- Keep product details text-only on initial load.
- Show clear loading and retry states.
- Cache the most recently viewed product details locally.

The first version should avoid downloading a full product database to every device.

## 14. Security and Permissions

### Public Access

Public users can:

- Scan a barcode.
- View published product details.
- Open attachments linked to published products.
- Generate anonymous metrics.

Public users cannot:

- Create, edit, or delete product data.
- View draft products.
- Access admin routes.
- List all products.

### Admin Access

Admins can:

- Create products.
- Edit products.
- Add and remove barcodes.
- Upload and remove attachments.
- Publish and unpublish records.
- View usage metrics.

Recommended Supabase policies:

- Public read access only for published product lookup.
- Public attachment access only for attachments linked to published products.
- Authenticated admin write access.
- Storage write access restricted to admins.
- Draft products hidden from public users.

## 15. Content Quality and Safety

The app should make clear that product data is centrally maintained and intended as pharmacist support material.

Recommended safeguards:

- Published/draft state.
- Last reviewed date.
- Required admin login for editing.
- Avoid showing unreviewed content in pharmacist view.
- Keep attachment labels clear and specific.

Because the app provides medication reference information, content accuracy is the main operational risk. The project should define who is responsible for medical review before launch.

For the MVP, the central admin is responsible for reviewing product content before publishing. The app should treat published admin content as reviewed content.

## 16. Metrics

The MVP should collect only simple anonymous metrics:

- Total scans.
- Found scans.
- Not-found scans.
- Most scanned products.
- Most common missing barcodes.
- Attachment opens.

Metrics should not identify pharmacists, patients, or pharmacies in the first version.

## 17. MVP Scope

### Pharmacist Area

- Camera barcode scanner.
- Product lookup by scanned barcode.
- Product details screen.
- Product not found screen.
- Attachment buttons.
- Scan another product.
- Basic PWA install support.

### Admin Area

- Admin login.
- Product list.
- Create product.
- Edit product.
- Add/remove barcode.
- Upload attachment.
- Publish/unpublish product.
- Basic metrics page.

### Backend

- Supabase schema.
- Storage bucket for attachments.
- Row Level Security policies.
- Seed data for testing.

## 18. Future Enhancements

Possible future additions:

- Product search for admins.
- Pharmacist-side manual barcode entry.
- Arabic, Kurdish, and English language support.
- 2D/Data Matrix barcode support.
- Reviewer approval workflow.
- Import products from spreadsheet.
- Duplicate barcode detection tools.
- Image compression pipeline.
- Better video hosting workflow.
- Offline cache for selected products.
- Admin audit log.
- Country-specific regulatory source links.
- Native wrapper if camera support is not good enough on target devices.

## 19. Open Questions

Resolved MVP decisions:

- Barcode support: 1D barcodes only for the first release.
- Pharmacist interface language: English only.
- Medical/content review: central admin reviews content before publishing.
- Attachment storage: allow both Supabase Storage uploads and external media links.
- Video handling: allow both uploaded video files and YouTube links.
- Admin roles: one admin role only.

Deferred decisions:

- Whether 2D/Data Matrix barcode support is needed after field testing.
- Whether Arabic or Kurdish UI/content support is needed after MVP validation.
- Whether separate editor and publisher roles are needed after the admin workflow matures.

## 20. Recommended Build Order

1. Create Vite React TypeScript app.
2. Add Supabase project configuration.
3. Create database schema and storage bucket.
4. Build pharmacist scanner screen.
5. Build product lookup and details screen.
6. Build not-found result.
7. Build admin login.
8. Build admin product form.
9. Add attachments.
10. Add usage metrics.
11. Add PWA caching.
12. Deploy to Vercel.
13. Test on real phones using local Iraqi medicine packages.
