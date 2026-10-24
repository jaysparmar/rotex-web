# What Was Done — Summary for Review

Plain-language list of everything completed. No technical terms — just what changed and why.

## 1. SEO (Google search appearance)
- Every individual product, industry, sub-industry, category, and resource (blog/case study/news/CSR) page can now have its own custom search-engine title, description, keywords, and social-share image — set from the admin panel.
- The SEO admin page was redesigned: easier to browse, search, and see at a glance which pages are configured and which aren't.
- Fixed a bug where some SEO edit links gave a "page not found" error.

## 2. Error & "Under Maintenance" pages
- Designed proper branded "Page Not Found" and "Something Went Wrong" pages for the website, matching the Rotex look — instead of the plain default browser error page.
- Added a "Maintenance Mode" switch in the admin panel: turn it on and the whole public website shows a clean "we'll be back shortly" page while you keep working behind the scenes in admin.

## 3. Enquiries (Admin Panel)
- Added a date range filter so you can view enquiries from a specific period.
- Added an "Export to CSV" button — download enquiries from one or several categories as a spreadsheet file, named after the category.
- Fixed a small display bug on the product filter dropdown.

## 4. Website Forms — Contact, Industry Enquiry, Request a Quote, Become a Supplier, Become a Channel Partner
- All 5 forms now share one consistent system behind the scenes, which means:
  - You can turn individual fields (Company Name, Country, City, Industry, Product Type, Quantity, File Upload, Enquiry Type) **on or off per form**, from the admin panel — no coding needed.
  - "Product Type" now uses one single, consistent dropdown list across all forms.
  - Added a new "Enquiry Type" dropdown (e.g. General Enquiry, Request a Quote, Careers, etc.) — configurable per form.
  - "Industry Served" is now a proper multi-select dropdown, grouped by main industry and sub-industry — and you choose exactly which industries are allowed to appear, per form.
  - Added a "Quantity" field that's now actually saved and visible in the admin panel (previously it was being silently lost).

## 5. About Page — Resources Section
- You can now turn each resource category (Blogs, Case Studies, News) on/off individually, in any combination.
- The picker for choosing which articles to feature was simplified into one clean searchable list with on/off switches.

## 6. Drag-and-Drop Reordering (Admin Panel)
- Replaced old up/down arrow buttons with proper **drag-and-drop** across the admin panel — click and drag to reorder instead of clicking arrows one at a time. Covers:
  - Home Page → Industries section
  - Home Page → Products section
  - Gallery image picker
  - Image list fields (used in several page editors)
  - Footer column links (Industries & Categories pickers)
  - Header Mega Menu industries picker

## 7. Admin Panel Cleanup
- Removed old, no-longer-working settings from the Contact, Supplier, and Channel Partner page editors (old Enquiry Type / Product Type / Business Type / Country / City dropdown-option fields, and an old Industries picker) — these stopped doing anything once the new Form Fields system (see #4) took over, and were confusing to leave in place. Each editor now points to where the setting actually lives.

## 8. Small Fixes
- Fixed a broken-looking placeholder icon that appeared when a product/category image was missing — now shows a clean placeholder instead.
- Fixed a few console warnings/errors that could cause odd behavior on forms and dropdowns.
- The job application form now always shows an "Other" option, so candidates can still apply even if there are no open positions listed.
- Fixed a few local development environment issues that were blocking work (no impact on the live site).

## 9. Industry Pages
- Fixed a duplicate hero banner showing twice on some industry pages (once at the top, once again further down) — now shows once.
- Industries with no sub-sections (e.g. no "Upstream / Midstream / Downstream" tabs) no longer show an empty tab bar or an unrelated stats section — those only appear when there's actually sub-content to show.

## 10. Resources (Blogs / Case Studies / News / CSR)
- Added a Gallery to each resource — pick multiple images from the Media Library (same picker used on the About page gallery) and they show as a swipeable photo gallery on the article's page.

## 11. Products — Product Family
- "Product Family" (shown when adding/editing a product) used to be a fixed list of 5 options that only a developer could change. It's now tied to your Categories list — whatever you add/rename/remove under Categories automatically shows up here too, no code change needed.
- Fixed the admin Categories search bar and company filter dropdown squeezing onto two lines on smaller screens — now stay on one row.
- Fixed the product filter "Category" dropdown showing empty when no Company was selected — now lists categories from all companies.

## Not Done Yet
Nothing currently flagged — all previously noted cleanup items above are done.
