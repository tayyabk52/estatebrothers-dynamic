-- Production media hardening for admin-managed public assets.
-- Keeps existing bucket purposes intact while preventing unrestricted uploads.

update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml'
  ]
where id = 'site-assets';

update storage.buckets
set
  file_size_limit = 15728640,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ]
where id in ('listing-media', 'update-media');
