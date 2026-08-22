-- Estate Brothers demo content seed.
-- This loads the former static demo content into the dynamic Supabase schema.

begin;

insert into public.media_assets
  (id, source_type, media_type, external_url, public_url, title, alt_text, thumbnail_url, provider, status)
values
  ('10000000-0000-0000-0000-000000000001', 'external', 'image', '/images/properties/hero-estatebrothers.webp', '/images/properties/hero-estatebrothers.webp', 'Estate Brothers hero image', 'Estate Brothers property hero image', '/images/properties/hero-estatebrothers.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000002', 'external', 'image', '/images/team/ceo-tajamal-hussain.jpg', '/images/team/ceo-tajamal-hussain.jpg', 'Tajamal Hussain', 'Tajamal Hussain at the Estate Brothers office', '/images/team/ceo-tajamal-hussain.jpg', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000003', 'external', 'image', '/images/properties/khayaban-e-amir-bungalow.webp', '/images/properties/khayaban-e-amir-bungalow.webp', 'Khayaban-e-Amir Bungalow', 'Modern DHA Lahore bungalow', '/images/properties/khayaban-e-amir-bungalow.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000004', 'external', 'image', '/images/properties/margalla-vista-residence.webp', '/images/properties/margalla-vista-residence.webp', 'Margalla Vista Residence', 'Premium residence exterior', '/images/properties/margalla-vista-residence.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000005', 'external', 'image', '/images/properties/rawal-view-farmhouse.webp', '/images/properties/rawal-view-farmhouse.webp', 'Rawal View Farmhouse', 'Luxury farmhouse exterior', '/images/properties/rawal-view-farmhouse.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000006', 'external', 'image', '/images/properties/khayaban-e-shaheen-penthouse.webp', '/images/properties/khayaban-e-shaheen-penthouse.webp', 'Khayaban-e-Shaheen Penthouse', 'Sea-facing penthouse view', '/images/properties/khayaban-e-shaheen-penthouse.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000007', 'external', 'image', '/images/partners/partner-01.webp', '/images/partners/partner-01.webp', 'Partner 01', 'Estate Brothers partner logo 01', '/images/partners/partner-01.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000008', 'external', 'image', '/images/partners/partner-02.webp', '/images/partners/partner-02.webp', 'Partner 02', 'Estate Brothers partner logo 02', '/images/partners/partner-02.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000009', 'external', 'image', '/images/partners/partner-03.webp', '/images/partners/partner-03.webp', 'Partner 03', 'Estate Brothers partner logo 03', '/images/partners/partner-03.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000010', 'external', 'image', '/images/partners/partner-04.webp', '/images/partners/partner-04.webp', 'Partner 04', 'Estate Brothers partner logo 04', '/images/partners/partner-04.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000011', 'external', 'image', '/images/partners/partner-05.webp', '/images/partners/partner-05.webp', 'Partner 05', 'Estate Brothers partner logo 05', '/images/partners/partner-05.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000012', 'external', 'image', '/images/partners/partner-06.webp', '/images/partners/partner-06.webp', 'Partner 06', 'Estate Brothers partner logo 06', '/images/partners/partner-06.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000013', 'external', 'image', '/images/partners/partner-07.webp', '/images/partners/partner-07.webp', 'Partner 07', 'Estate Brothers partner logo 07', '/images/partners/partner-07.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000014', 'external', 'image', '/images/partners/partner-08.webp', '/images/partners/partner-08.webp', 'Partner 08', 'Estate Brothers partner logo 08', '/images/partners/partner-08.webp', 'local', 'published'),
  ('10000000-0000-0000-0000-000000000015', 'external', 'image', '/images/partners/partner-09.webp', '/images/partners/partner-09.webp', 'Partner 09', 'Estate Brothers partner logo 09', '/images/partners/partner-09.webp', 'local', 'published')
on conflict (id) do update set
  external_url = excluded.external_url,
  public_url = excluded.public_url,
  title = excluded.title,
  alt_text = excluded.alt_text,
  thumbnail_url = excluded.thumbnail_url,
  status = excluded.status;

insert into public.site_settings (
  singleton_key, business_name, legal_name, tagline, business_description,
  phone, whatsapp, email, address_line_1, city, region, postal_code, country_code,
  latitude, longitude, map_url, price_range, service_areas, knows_about,
  social_links, logo_url, default_og_image, default_meta_title, default_meta_description
) values (
  true,
  'Estate Brothers',
  'Estate Brothers',
  'Real estate, built on trust.',
  'Estate Brothers is a Lahore real estate agency helping clients buy, sell, and invest in residential and commercial property across DHA and wider Pakistan.',
  '+92 325 2222330',
  '+92 323 8488195',
  'estatebrothers786@gmail.com',
  'Top Floor 44-A Main DHA Office Phase 6',
  'Lahore',
  'Punjab',
  '54000',
  'PK',
  31.4697,
  74.4013,
  'https://www.google.com/maps/search/?api=1&query=44-A%20Main%20DHA%20Office%20Phase%206%20Lahore',
  'PKR',
  array['Lahore', 'DHA Lahore', 'Islamabad', 'Karachi', 'Pakistan'],
  array['DHA Lahore', 'Real estate investment', 'Property valuation'],
  '{"facebook":"https://www.facebook.com/estatebrothers1","instagram":"https://www.instagram.com/estatebrothers1"}'::jsonb,
  '/images/brand/headerlogo.svg',
  '/og-default.jpg',
  'Estate Brothers',
  'Buy, sell, and invest in property across Lahore with Estate Brothers - trusted real estate advisors in DHA Phase 6.'
)
on conflict (singleton_key) do update set
  business_name = excluded.business_name,
  legal_name = excluded.legal_name,
  tagline = excluded.tagline,
  business_description = excluded.business_description,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  address_line_1 = excluded.address_line_1,
  city = excluded.city,
  region = excluded.region,
  postal_code = excluded.postal_code,
  country_code = excluded.country_code,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  map_url = excluded.map_url,
  price_range = excluded.price_range,
  service_areas = excluded.service_areas,
  knows_about = excluded.knows_about,
  social_links = excluded.social_links,
  logo_url = excluded.logo_url,
  default_og_image = excluded.default_og_image,
  default_meta_title = excluded.default_meta_title,
  default_meta_description = excluded.default_meta_description;

insert into public.pages
  (id, page_key, route_path, title, heading, intro, body, hero_media_id, og_image, meta_title, meta_description, keywords, status, published_at, noindex, sort_order)
values
  ('20000000-0000-0000-0000-000000000001', 'home', '/', 'Estate Brothers', 'Estate Brothers real estate, built on trust.', 'Buy, sell, and invest with a professional property team in Lahore. From DHA listings to secure investment opportunities, Estate Brothers keeps every decision clear, practical, and client-focused.', 'Dynamic homepage content seeded from the original demo website.', '10000000-0000-0000-0000-000000000001', '/og-default.jpg', 'Estate Brothers', 'Buy, sell, and invest in property across Lahore with Estate Brothers - trusted real estate advisors in DHA Phase 6.', array['real estate Lahore','DHA Phase 6 property','buy property Lahore','estate brothers'], 'published', now() - interval '1 day', false, 10),
  ('20000000-0000-0000-0000-000000000002', 'about', '/about', 'About Estate Brothers', 'A reliable real estate team built around trust, market knowledge, and results.', 'For over a decade, Estate Brothers has supported clients with property services, investment guidance, and transparent real estate decisions from its DHA Phase 6 Lahore office and wider branch network.', 'About page content seeded from the original demo website.', '10000000-0000-0000-0000-000000000002', '/og-default.jpg', 'About | Estate Brothers', 'Learn about Estate Brothers - 10+ years of trusted real estate services in DHA Lahore. Meet our team, offices, and values.', array['real estate agent Lahore','Tajamal Hussain','DHA Phase 6 real estate'], 'published', now() - interval '1 day', false, 20),
  ('20000000-0000-0000-0000-000000000003', 'contact', '/contact', 'Contact Estate Brothers', 'Begin a private conversation.', 'Speak with our team for property services, investment guidance, buying, selling, or valuation support.', 'Contact page content seeded from the original demo website.', null, '/og-default.jpg', 'Contact | Estate Brothers', 'Contact Estate Brothers for property buying, selling, or investment inquiries in Lahore.', array['contact real estate agent Lahore','property inquiry Lahore'], 'published', now() - interval '1 day', false, 30)
on conflict (route_path) do update set
  title = excluded.title,
  heading = excluded.heading,
  intro = excluded.intro,
  body = excluded.body,
  hero_media_id = excluded.hero_media_id,
  og_image = excluded.og_image,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  keywords = excluded.keywords,
  status = excluded.status,
  published_at = excluded.published_at,
  noindex = excluded.noindex,
  sort_order = excluded.sort_order;

insert into public.page_sections
  (id, page_id, section_key, eyebrow, heading, subheading, body, media_id, sort_order, status)
values
  ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'featured-listings', 'Currently representing', 'Published inventory, ready for review.', 'Listings published in Supabase appear here and can be edited from the dashboard.', 'Original featured property area converted into database-managed homepage content.', null, 10, 'published'),
  ('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'leadership', 'Leadership', 'Built on trust, expertise, and results. Led by Tajamal Hussain.', 'With over a decade of hands-on experience in real estate, Tajamal Hussain has built a strong reputation for integrity, market knowledge, and client-focused service.', 'From a single vision to a growing real estate network, Estate Brothers now operates from 44-A Main DHA Office Phase 6 Lahore with 4 branches and 30+ professional team members.', '10000000-0000-0000-0000-000000000002', 20, 'published'),
  ('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'services', 'Core services', 'Focused support for every property decision.', 'From property services to investment guidance, the team keeps the process clear, documented, and aligned with each client goal.', 'Service pillars from the original About page.', null, 10, 'published'),
  ('21000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'operating-model', 'Operating model', 'Built for careful work, fast communication, and long-term client confidence.', null, 'Every mandate is checked for location, documentation, market fit, and client suitability. Teams coordinate across branches so buyers, sellers, and investors get consistent guidance.', null, 20, 'published'),
  ('21000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'hero-stats', 'Homepage stats', 'Homepage hero statistics', null, null, null, 5, 'published'),
  ('21000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'partners', 'Trusted network', 'Our Partners', 'A growing network of trusted property, development, and investment partners supporting confident real estate decisions.', null, null, 15, 'published'),
  ('21000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'testimonials', 'Client voices', 'What clients say about Estate Brothers', null, null, null, 35, 'published'),
  ('21000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', 'testimonial-stats', 'Performance stats', 'Client outcome statistics', null, null, null, 40, 'published')
on conflict (page_id, section_key) do update set
  eyebrow = excluded.eyebrow,
  heading = excluded.heading,
  subheading = excluded.subheading,
  body = excluded.body,
  media_id = excluded.media_id,
  sort_order = excluded.sort_order,
  status = excluded.status;

delete from public.page_blocks where section_id in (
  '21000000-0000-0000-0000-000000000001',
  '21000000-0000-0000-0000-000000000002',
  '21000000-0000-0000-0000-000000000003',
  '21000000-0000-0000-0000-000000000004',
  '21000000-0000-0000-0000-000000000005',
  '21000000-0000-0000-0000-000000000006',
  '21000000-0000-0000-0000-000000000007',
  '21000000-0000-0000-0000-000000000008'
);

insert into public.page_blocks
  (section_id, block_key, title, body, media_id, link_label, link_url, link_kind, sort_order, status)
values
  ('21000000-0000-0000-0000-000000000003', 'property-services', 'Property Services', 'Buying, selling, leasing, and advisory support for residential and commercial clients.', null, null, null, null, 10, 'published'),
  ('21000000-0000-0000-0000-000000000003', 'investment-services', 'Investment Services', 'Market-led guidance for clients looking for secure, practical, and long-term opportunities.', null, null, null, null, 20, 'published'),
  ('21000000-0000-0000-0000-000000000003', 'client-representation', 'Client Representation', 'Clear communication, verified options, and focused support from inquiry to closing.', null, null, null, null, 30, 'published'),
  ('21000000-0000-0000-0000-000000000004', 'checked-mandates', 'Checked mandates', 'Every mandate is checked for location, documentation, market fit, and client suitability.', null, null, null, null, 10, 'published'),
  ('21000000-0000-0000-0000-000000000004', 'branch-coordination', 'Branch coordination', 'Teams coordinate across branches so buyers, sellers, and investors get consistent guidance.', null, null, null, null, 20, 'published'),
  ('21000000-0000-0000-0000-000000000005', 'active-mandates', '180', 'Active mandates', null, null, null, null, 10, 'published'),
  ('21000000-0000-0000-0000-000000000005', 'market-experience', '10', 'Real estate experience', null, null, null, null, 20, 'published'),
  ('21000000-0000-0000-0000-000000000005', 'team-members', '30', 'Professional team members', null, null, null, null, 30, 'published'),
  ('21000000-0000-0000-0000-000000000005', 'client-support', '24/7', 'Always open for clients', null, null, null, null, 40, 'published'),
  ('21000000-0000-0000-0000-000000000006', 'partner-01', 'Partner 01', 'Estate Brothers partner logo 01', '10000000-0000-0000-0000-000000000007', null, null, null, 10, 'published'),
  ('21000000-0000-0000-0000-000000000006', 'partner-02', 'Partner 02', 'Estate Brothers partner logo 02', '10000000-0000-0000-0000-000000000008', null, null, null, 20, 'published'),
  ('21000000-0000-0000-0000-000000000006', 'partner-03', 'Partner 03', 'Estate Brothers partner logo 03', '10000000-0000-0000-0000-000000000009', null, null, null, 30, 'published'),
  ('21000000-0000-0000-0000-000000000006', 'partner-04', 'Partner 04', 'Estate Brothers partner logo 04', '10000000-0000-0000-0000-000000000010', null, null, null, 40, 'published'),
  ('21000000-0000-0000-0000-000000000006', 'partner-05', 'Partner 05', 'Estate Brothers partner logo 05', '10000000-0000-0000-0000-000000000011', null, null, null, 50, 'published'),
  ('21000000-0000-0000-0000-000000000006', 'partner-06', 'Partner 06', 'Estate Brothers partner logo 06', '10000000-0000-0000-0000-000000000012', null, null, null, 60, 'published'),
  ('21000000-0000-0000-0000-000000000006', 'partner-07', 'Partner 07', 'Estate Brothers partner logo 07', '10000000-0000-0000-0000-000000000013', null, null, null, 70, 'published'),
  ('21000000-0000-0000-0000-000000000006', 'partner-08', 'Partner 08', 'Estate Brothers partner logo 08', '10000000-0000-0000-0000-000000000014', null, null, null, 80, 'published'),
  ('21000000-0000-0000-0000-000000000006', 'partner-09', 'Partner 09', 'Estate Brothers partner logo 09', '10000000-0000-0000-0000-000000000015', null, null, null, 90, 'published'),
  ('21000000-0000-0000-0000-000000000007', 'faraz-sana-sheikh', 'Faraz & Sana Sheikh', 'Estate Brothers made the entire process feel secure, transparent, and properly guided. Their team understood both the property and the investment decision behind it.', null, 'Lahore - 2024', null, null, 10, 'published'),
  ('21000000-0000-0000-0000-000000000007', 'dr-mahnoor-qureshi', 'Dr. Mahnoor Qureshi', 'The advice was clear from day one. They helped us compare opportunities, avoid pressure, and move only when the numbers and location made sense.', null, 'Investment client - 2023', null, null, 20, 'published'),
  ('21000000-0000-0000-0000-000000000007', 'omar-shahid', 'Omar Shahid', 'Their market knowledge, documentation support, and follow-through gave us confidence through every stage of the transaction.', null, 'Property services client', null, null, 30, 'published'),
  ('21000000-0000-0000-0000-000000000008', 'hands-on-market-experience', '10', 'Hands-on market experience', null, null, null, null, 10, 'published'),
  ('21000000-0000-0000-0000-000000000008', 'median-days', '38', 'Median days, listing to offer', null, null, null, null, 20, 'published'),
  ('21000000-0000-0000-0000-000000000008', 'closed-within-ask', '96', 'Closed within 4% of ask', null, null, null, null, 30, 'published'),
  ('21000000-0000-0000-0000-000000000008', 'branches', '4', 'Serving clients across Pakistan', null, null, null, null, 40, 'published');

update public.page_blocks set icon_name = '+'
where section_id = '21000000-0000-0000-0000-000000000005' and block_key = 'active-mandates';
update public.page_blocks set icon_name = '+ yrs'
where section_id = '21000000-0000-0000-0000-000000000005' and block_key = 'market-experience';
update public.page_blocks set icon_name = '+'
where section_id = '21000000-0000-0000-0000-000000000005' and block_key = 'team-members';
update public.page_blocks set icon_name = '+ yrs'
where section_id = '21000000-0000-0000-0000-000000000008' and block_key = 'hands-on-market-experience';
update public.page_blocks set icon_name = 'd'
where section_id = '21000000-0000-0000-0000-000000000008' and block_key = 'median-days';
update public.page_blocks set icon_name = '%'
where section_id = '21000000-0000-0000-0000-000000000008' and block_key = 'closed-within-ask';
update public.page_blocks set icon_name = ' branches'
where section_id = '21000000-0000-0000-0000-000000000008' and block_key = 'branches';

insert into public.office_locations
  (id, slug, name, status_label, detail, address_line_1, city, region, country_code, phone, image_media_id, sort_order, status)
values
  ('30000000-0000-0000-0000-000000000001', 'dha-phase-6-main', 'Main DHA Office', 'Primary office', 'Top-floor client advisory office for property services, investment guidance, and private meetings.', '44-A, Estate Brothers DHA Phase 6', 'Lahore', 'Punjab', 'PK', '+92 325 2222330', '10000000-0000-0000-0000-000000000002', 10, 'published'),
  ('30000000-0000-0000-0000-000000000002', 'dha-phase-8-branch', 'DHA Phase 8 Branch', 'Branch office', 'Branch presence supporting client coordination, site visits, documentation, and area-specific advisory.', '8-A, Estate Brothers DHA Phase 8', 'Lahore', 'Punjab', 'PK', '+92 325 2222330', '10000000-0000-0000-0000-000000000001', 20, 'published')
on conflict (slug) do update set
  name = excluded.name,
  status_label = excluded.status_label,
  detail = excluded.detail,
  address_line_1 = excluded.address_line_1,
  city = excluded.city,
  region = excluded.region,
  phone = excluded.phone,
  image_media_id = excluded.image_media_id,
  sort_order = excluded.sort_order,
  status = excluded.status;

insert into public.team_members
  (id, slug, name, job_title, phone, whatsapp, email, image_url, image_media_id, status, public_profile, sort_order, meta_title, meta_description)
values
  ('40000000-0000-0000-0000-000000000001', 'tajamal-hussain', 'Tajamal Hussain', 'Chief Executive Officer', '+92 323 84 88 195', '+92 323 84 88 195', 'estatebrothers786@gmail.com', '/images/team/ceo-tajamal-hussain.jpg', '10000000-0000-0000-0000-000000000002', 'published', true, 10, 'Tajamal Hussain | Estate Brothers', 'Chief Executive Officer at Estate Brothers.'),
  ('40000000-0000-0000-0000-000000000002', 'abdul-rehman', 'Abdul Rehman', 'Branch Manager', '+92 325 22 22 334', '+92 325 22 22 334', 'estatebrothers786@gmail.com', null, null, 'published', true, 20, 'Abdul Rehman | Estate Brothers', 'Branch Manager at Estate Brothers.'),
  ('40000000-0000-0000-0000-000000000003', 'faizan-hamid', 'Faizan Hamid', 'Director Sales', '+92 325 22 22 331', '+92 325 22 22 331', 'estatebrothers786@gmail.com', null, null, 'published', true, 30, 'Faizan Hamid | Estate Brothers', 'Director Sales at Estate Brothers.'),
  ('40000000-0000-0000-0000-000000000004', 'ahmad-raza', 'Ahmad Raza', 'Managing Director', '+92 325 22 22 330', '+92 325 22 22 330', 'estatebrothers786@gmail.com', null, null, 'published', true, 40, 'Ahmad Raza | Estate Brothers', 'Managing Director at Estate Brothers.'),
  ('40000000-0000-0000-0000-000000000005', 'usman-butt', 'Usman Butt', 'Sales Executive', '+92 307 40 73 731', '+92 307 40 73 731', 'estatebrothers786@gmail.com', null, null, 'published', true, 50, 'Usman Butt | Estate Brothers', 'Sales Executive at Estate Brothers.'),
  ('40000000-0000-0000-0000-000000000006', 'abdul-hanan', 'Abdul Hanan', 'Sales Executive', '+92 305 43 30 071', '+92 305 43 30 071', 'estatebrothers786@gmail.com', null, null, 'published', true, 60, 'Abdul Hanan | Estate Brothers', 'Sales Executive at Estate Brothers.'),
  ('40000000-0000-0000-0000-000000000007', 'abdul-waheed', 'Abdul Waheed', 'Sales Executive', '+92 321 84 81 114', '+92 321 84 81 114', 'estatebrothers786@gmail.com', null, null, 'published', true, 70, 'Abdul Waheed | Estate Brothers', 'Sales Executive at Estate Brothers.'),
  ('40000000-0000-0000-0000-000000000008', 'ch-kamran', 'Ch Kamran', 'Sales Executive', '+92 301 42 38 881', '+92 301 42 38 881', 'estatebrothers786@gmail.com', null, null, 'published', true, 80, 'Ch Kamran | Estate Brothers', 'Sales Executive at Estate Brothers.'),
  ('40000000-0000-0000-0000-000000000009', 'sheraz-ahmed', 'Sheraz Ahmed', 'Sales Executive', '+92 325 22 22 332', '+92 325 22 22 332', 'estatebrothers786@gmail.com', null, null, 'published', true, 90, 'Sheraz Ahmed | Estate Brothers', 'Sales Executive at Estate Brothers.')
on conflict (slug) do update set
  name = excluded.name,
  job_title = excluded.job_title,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  image_url = excluded.image_url,
  image_media_id = excluded.image_media_id,
  status = excluded.status,
  public_profile = excluded.public_profile,
  sort_order = excluded.sort_order,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description;

insert into public.content_authors
  (id, slug, name, title, email, image_url)
values
  ('50000000-0000-0000-0000-000000000001', 'estate-brothers', 'Estate Brothers', 'Editorial Team', 'estatebrothers786@gmail.com', '/images/brand/headerlogo.svg'),
  ('50000000-0000-0000-0000-000000000002', 'sales-desk', 'Sales Desk', 'Sales Desk', 'estatebrothers786@gmail.com', null),
  ('50000000-0000-0000-0000-000000000003', 'marketing-team', 'Marketing Team', 'Marketing Team', 'estatebrothers786@gmail.com', null),
  ('50000000-0000-0000-0000-000000000004', 'investment-services', 'Investment Services', 'Investment Services', 'estatebrothers786@gmail.com', null)
on conflict (slug) do update set
  name = excluded.name,
  title = excluded.title,
  email = excluded.email,
  image_url = excluded.image_url;

insert into public.real_estate_listings (
  id, listing_type_slug, slug, canonical_path, title, summary, description, listing_status, availability,
  price_label, price_numeric, price_currency, city, phase, project, block, neighborhood, address_line,
  region, postal_code, country_code, size_label, area_value, area_unit, bedrooms, bathrooms, garage_capacity,
  contact_person_id, thumbnail_url, og_image, features, attributes, meta_title, meta_description, keywords,
  status, published_at, noindex, sort_order
) values
  ('60000000-0000-0000-0000-000000000001', 'plot', 'dha-phase-6-1-kanal-possession-plot', '/buy-sell/plot/dha-phase-6-1-kanal-possession-plot', 'DHA Phase 6 1 Kanal Possession Plot', 'Prime possession plot near main access with clear approach.', 'Prime possession plot near main access with clear approach.', 'Possession', 'available', 'PKR 5.85 Cr', 58500000, 'PKR', 'Lahore', 'DHA Phase 6', 'Main Boulevard', 'C Block', null, null, 'Punjab', '54000', 'PK', '1 Kanal', null, null, null, null, null, (select id from public.team_members where slug = 'abdul-rehman'), null, '/og-default.jpg', '{}'::jsonb, '{}'::jsonb, 'DHA Phase 6 1 Kanal Possession Plot | Estate Brothers', '1 Kanal possession plot for sale in DHA Phase 6 Lahore.', array['DHA Phase 6 plot','1 Kanal plot Lahore'], 'published', '2026-05-15T00:00:00+00', false, 10),
  ('60000000-0000-0000-0000-000000000002', 'plot', 'dha-phase-8-10-marla-commercial-file', '/buy-sell/plot/dha-phase-8-10-marla-commercial-file', 'DHA Phase 8 10 Marla Commercial File', 'Commercial opportunity suitable for investors comparing DHA Phase 8 options.', 'Commercial opportunity suitable for investors comparing DHA Phase 8 options.', 'File', 'available', 'On Call', null, 'PKR', 'Lahore', 'DHA Phase 8', 'Commercial Broadway', 'Broadway', null, null, 'Punjab', '54000', 'PK', '10 Marla', null, null, null, null, null, (select id from public.team_members where slug = 'faizan-hamid'), null, '/og-default.jpg', '{}'::jsonb, '{}'::jsonb, 'DHA Phase 8 10 Marla Commercial File | Estate Brothers', '10 Marla commercial file opportunity in DHA Phase 8 Lahore.', array['DHA Phase 8 commercial','10 Marla commercial file'], 'published', '2026-05-14T00:00:00+00', false, 20),
  ('60000000-0000-0000-0000-000000000003', 'plot', 'dha-phase-9-town-5-marla-residential-plot', '/buy-sell/plot/dha-phase-9-town-5-marla-residential-plot', 'DHA Phase 9 Town 5 Marla Residential Plot', 'Compact residential plot for end-user construction or long-term holding.', 'Compact residential plot for end-user construction or long-term holding.', 'Available', 'available', 'PKR 1.45 Cr', 14500000, 'PKR', 'Lahore', 'DHA Phase 9 Town', 'Residential Sector', 'D Block', null, null, 'Punjab', '54000', 'PK', '5 Marla', null, null, null, null, null, (select id from public.team_members where slug = 'ahmad-raza'), null, '/og-default.jpg', '{}'::jsonb, '{}'::jsonb, 'DHA Phase 9 Town 5 Marla Residential Plot | Estate Brothers', '5 Marla residential plot for sale in DHA Phase 9 Town Lahore.', array['DHA Phase 9 Town plot','5 Marla plot Lahore'], 'published', '2026-05-13T00:00:00+00', false, 30),
  ('60000000-0000-0000-0000-000000000004', 'plot', 'dha-phase-7-2-kanal-corner-plot', '/buy-sell/plot/dha-phase-7-2-kanal-corner-plot', 'DHA Phase 7 2 Kanal Corner Plot', 'Large corner residential plot for premium construction planning.', 'Large corner residential plot for premium construction planning.', 'Available', 'available', 'PKR 11.25 Cr', 112500000, 'PKR', 'Lahore', 'DHA Phase 7', 'Corner Residential', 'Y Block', null, null, 'Punjab', '54000', 'PK', '2 Kanal', null, null, null, null, null, (select id from public.team_members where slug = 'tajamal-hussain'), null, '/og-default.jpg', '{}'::jsonb, '{}'::jsonb, 'DHA Phase 7 2 Kanal Corner Plot | Estate Brothers', '2 Kanal corner residential plot for sale in DHA Phase 7 Lahore.', array['DHA Phase 7 plot','2 Kanal plot Lahore'], 'published', '2026-05-12T00:00:00+00', false, 40),
  ('60000000-0000-0000-0000-000000000005', 'house', 'superb-5-marla-modern-house-dha-lahore', '/buy-sell/house/superb-5-marla-modern-house-dha-lahore', 'Superb 5 Marla Modern House in DHA Lahore', 'Superb 5 Marla modern house in DHA Lahore.', 'Superb 5 Marla modern house in DHA Lahore with drawing room, dining room, family lounge, modern kitchen, car porch, rooftop garden, and imported fittings.', 'For Sale', 'available', 'On Call', null, 'PKR', 'Lahore', 'DHA Phase 9 Town', null, null, 'Phase 9 Town', 'DHA Lahore Phase 9 Town', 'Punjab', '54000', 'PK', '5 Marla', null, null, 3, 5, 1, (select id from public.team_members where slug = 'faizan-hamid'), '/images/properties/khayaban-e-amir-bungalow.webp', '/images/properties/khayaban-e-amir-bungalow.webp', '{"interior":["Drawing room","Dining room","Family lounge with skylight","Ultra-modern kitchen","Built-in appliances","Jacuzzi","Shower cabins","Imported sanitary fittings"],"exterior":["Contemporary glass facade","Car porch","Lush green lawn","Rooftop garden","BBQ area","Sitting area"],"tags":["Super Hot"]}'::jsonb, '{}'::jsonb, 'Superb 5 Marla Modern House in DHA Lahore | Estate Brothers', 'Superb 5 Marla modern house for sale in DHA Lahore.', array['5 Marla house DHA Lahore','modern house Lahore'], 'published', '2026-05-15T00:00:00+00', false, 50),
  ('60000000-0000-0000-0000-000000000006', 'house', '1-kanal-possession-ready-house-dha-phase-6-lahore', '/buy-sell/house/1-kanal-possession-ready-house-dha-phase-6-lahore', '1 Kanal Possession Ready House in DHA Phase 6', '1 Kanal possession ready house in DHA Phase 6 Lahore.', '1 Kanal possession ready house in DHA Phase 6 Lahore with double kitchen, basement, imported fittings, car porch, terrace, and servant quarter.', 'For Sale', 'available', 'PKR 12.8 Cr', 128000000, 'PKR', 'Lahore', 'DHA Phase 6', null, null, 'Phase 6', 'DHA Phase 6, Lahore', 'Punjab', '54000', 'PK', '1 Kanal', null, null, 5, 6, 2, (select id from public.team_members where slug = 'abdul-rehman'), '/images/properties/margalla-vista-residence.webp', '/images/properties/margalla-vista-residence.webp', '{"interior":["Drawing room","Dining room","Double kitchen","Basement","Imported fittings"],"exterior":["Car porch","Terrace","Servant quarter","Near main road"],"tags":["Possession Ready"]}'::jsonb, '{}'::jsonb, '1 Kanal Possession Ready House in DHA Phase 6 | Estate Brothers', '1 Kanal possession ready house for sale in DHA Phase 6 Lahore.', array['1 Kanal house DHA Phase 6','house for sale Lahore'], 'published', '2026-05-13T00:00:00+00', false, 60),
  ('60000000-0000-0000-0000-000000000007', 'house', '2-kanal-luxury-bungalow-dha-phase-7-lahore', '/buy-sell/house/2-kanal-luxury-bungalow-dha-phase-7-lahore', '2 Kanal Luxury Bungalow in DHA Phase 7', '2 Kanal luxury bungalow in DHA Phase 7 Lahore.', '2 Kanal luxury bungalow in DHA Phase 7 Lahore with formal lounge, family lounge, designer kitchen, home office, basement, wide frontage, lawn, and servant quarter.', 'For Sale', 'available', 'PKR 24 Cr', 240000000, 'PKR', 'Lahore', 'DHA Phase 7', null, null, 'Phase 7', 'DHA Phase 7, Lahore', 'Punjab', '54000', 'PK', '2 Kanal', null, null, 6, 7, 3, (select id from public.team_members where slug = 'tajamal-hussain'), '/images/properties/rawal-view-farmhouse.webp', '/images/properties/rawal-view-farmhouse.webp', '{"interior":["Formal lounge","Family lounge","Designer kitchen","Home office","Basement"],"exterior":["Wide frontage","Lawn","Car porch","Terrace","Servant quarter"],"tags":["Premium"]}'::jsonb, '{}'::jsonb, '2 Kanal Luxury Bungalow in DHA Phase 7 | Estate Brothers', '2 Kanal luxury bungalow for sale in DHA Phase 7 Lahore.', array['2 Kanal bungalow DHA Phase 7','luxury house Lahore'], 'published', '2026-05-12T00:00:00+00', false, 70)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  listing_status = excluded.listing_status,
  price_label = excluded.price_label,
  price_numeric = excluded.price_numeric,
  city = excluded.city,
  phase = excluded.phase,
  project = excluded.project,
  block = excluded.block,
  neighborhood = excluded.neighborhood,
  address_line = excluded.address_line,
  size_label = excluded.size_label,
  bedrooms = excluded.bedrooms,
  bathrooms = excluded.bathrooms,
  garage_capacity = excluded.garage_capacity,
  contact_person_id = excluded.contact_person_id,
  thumbnail_url = excluded.thumbnail_url,
  og_image = excluded.og_image,
  features = excluded.features,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  keywords = excluded.keywords,
  status = excluded.status,
  published_at = excluded.published_at,
  noindex = excluded.noindex,
  sort_order = excluded.sort_order;

delete from public.listing_media where listing_id in (
  select id from public.real_estate_listings where slug in (
    'superb-5-marla-modern-house-dha-lahore',
    '1-kanal-possession-ready-house-dha-phase-6-lahore',
    '2-kanal-luxury-bungalow-dha-phase-7-lahore'
  )
);

insert into public.listing_media (listing_id, media_id, sort_order, is_primary, is_gallery_item, is_og_candidate)
values
  ((select id from public.real_estate_listings where slug = 'superb-5-marla-modern-house-dha-lahore'), '10000000-0000-0000-0000-000000000003', 10, true, true, true),
  ((select id from public.real_estate_listings where slug = 'superb-5-marla-modern-house-dha-lahore'), '10000000-0000-0000-0000-000000000004', 20, false, true, false),
  ((select id from public.real_estate_listings where slug = 'superb-5-marla-modern-house-dha-lahore'), '10000000-0000-0000-0000-000000000005', 30, false, true, false),
  ((select id from public.real_estate_listings where slug = '1-kanal-possession-ready-house-dha-phase-6-lahore'), '10000000-0000-0000-0000-000000000004', 10, true, true, true),
  ((select id from public.real_estate_listings where slug = '1-kanal-possession-ready-house-dha-phase-6-lahore'), '10000000-0000-0000-0000-000000000006', 20, false, true, false),
  ((select id from public.real_estate_listings where slug = '2-kanal-luxury-bungalow-dha-phase-7-lahore'), '10000000-0000-0000-0000-000000000005', 10, true, true, true),
  ((select id from public.real_estate_listings where slug = '2-kanal-luxury-bungalow-dha-phase-7-lahore'), '10000000-0000-0000-0000-000000000003', 20, false, true, false);

insert into public.updates (
  id, slug, canonical_path, title, headline, summary, body, article_schema_type, article_section,
  update_type, source, author_id, featured, tags, thumbnail_url, thumbnail_alt, og_image,
  has_detail_page, meta_title, meta_description, keywords, status, published_at, modified_at, noindex
) values
  ('70000000-0000-0000-0000-000000000001', 'estate-brothers-team-expansion-dha-lahore', '/updates/estate-brothers-team-expansion-dha-lahore', 'Estate Brothers expands service coverage across DHA Lahore', 'Estate Brothers expands service coverage across DHA Lahore', 'Our Lahore team is extending client support for buying, selling, and investment advisory across active DHA phases.', 'The update keeps clients informed about branch availability, contact routing, and the team members currently handling sale and investment inquiries.', 'NewsArticle', 'Company', 'announcement', 'website', (select id from public.content_authors where slug = 'estate-brothers'), true, array['DHA Lahore','Branch update','Client support'], '/images/team/ceo-tajamal-hussain.jpg', 'Estate Brothers leadership update', '/images/team/ceo-tajamal-hussain.jpg', true, 'Estate Brothers expands service coverage across DHA Lahore', 'Estate Brothers extends client support for buying, selling, and investment advisory across DHA Lahore.', array['DHA Lahore updates','Estate Brothers news'], 'published', '2026-05-10T00:00:00+00', '2026-05-15T00:00:00+00', false),
  ('70000000-0000-0000-0000-000000000002', 'featured-house-inventory-updated', '/updates/featured-house-inventory-updated', 'House inventory refreshed for current buyer inquiries', 'House inventory refreshed for current buyer inquiries', 'Selected listings have been structured for clean comparison by size, phase, status, and contact person.', 'The current inventory includes a selection of DHA Lahore properties across multiple phases - plots, houses, and commercial files - structured for easy comparison by size, phase, status, and contact person. Reach out to the sales desk for current availability and pricing.', 'Article', 'Market', 'market', 'website', (select id from public.content_authors where slug = 'sales-desk'), false, array['Houses','Inventory','Buy/Sell'], '/images/properties/khayaban-e-amir-bungalow.webp', 'Modern house listing update', '/images/properties/khayaban-e-amir-bungalow.webp', true, 'House inventory refreshed for current buyer inquiries', 'Selected Estate Brothers listings are structured for comparison by size, phase, status, and contact person.', array['house inventory Lahore','DHA Lahore houses'], 'published', '2026-05-08T00:00:00+00', '2026-05-14T00:00:00+00', false),
  ('70000000-0000-0000-0000-000000000003', 'facebook-post-mou-partner-update', '/updates/facebook-post-mou-partner-update', 'Partner and MOU activity posted for client confidence', 'Partner and MOU activity posted for client confidence', 'Selected social posts, MOU images, and partner announcements are collected here in one official updates feed.', 'Partnership and MOU activity is shared with short captions, media, and original source links so clients can review public credibility updates from one place.', 'Article', 'Partners', 'facebook', 'facebook', (select id from public.content_authors where slug = 'marketing-team'), false, array['MOU','Partners','Facebook'], '/images/partners/partner-01.webp', 'Estate Brothers partner update thumbnail', '/images/partners/partner-01.webp', true, 'Partner and MOU activity posted for client confidence', 'Estate Brothers partner and MOU activity collected in an official updates feed.', array['Estate Brothers MOU','real estate partners Lahore'], 'published', '2026-05-05T00:00:00+00', '2026-05-05T00:00:00+00', false),
  ('70000000-0000-0000-0000-000000000004', 'investment-consultation-weekly-note', '/updates/investment-consultation-weekly-note', 'Weekly consultation note for secure property decisions', 'Weekly consultation note for secure property decisions', 'A short update for clients reviewing plots, possession-ready homes, and long-term investment opportunities.', 'This weekly note highlights active client interest around plots, possession-ready homes, and long-term investment opportunities, helping buyers compare options before contacting the advisory team.', 'Article', 'Market', 'market', 'website', (select id from public.content_authors where slug = 'investment-services'), false, array['Investment','Consultation','Market note'], '/images/properties/margalla-vista-residence.webp', 'Premium residence market update', '/images/properties/margalla-vista-residence.webp', true, 'Weekly consultation note for secure property decisions', 'A weekly Estate Brothers consultation note for clients reviewing secure property decisions.', array['property investment Lahore','real estate consultation'], 'published', '2026-04-28T00:00:00+00', '2026-04-30T00:00:00+00', false)
on conflict (slug) do update set
  canonical_path = excluded.canonical_path,
  title = excluded.title,
  headline = excluded.headline,
  summary = excluded.summary,
  body = excluded.body,
  article_schema_type = excluded.article_schema_type,
  article_section = excluded.article_section,
  update_type = excluded.update_type,
  source = excluded.source,
  author_id = excluded.author_id,
  featured = excluded.featured,
  tags = excluded.tags,
  thumbnail_url = excluded.thumbnail_url,
  thumbnail_alt = excluded.thumbnail_alt,
  og_image = excluded.og_image,
  has_detail_page = excluded.has_detail_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  keywords = excluded.keywords,
  status = excluded.status,
  published_at = excluded.published_at,
  modified_at = excluded.modified_at,
  noindex = excluded.noindex;

delete from public.update_links where update_id in (select id from public.updates where slug in (
  'estate-brothers-team-expansion-dha-lahore',
  'featured-house-inventory-updated',
  'facebook-post-mou-partner-update',
  'investment-consultation-weekly-note'
));

insert into public.update_links (update_id, label, url, kind, sort_order)
values
  ((select id from public.updates where slug = 'estate-brothers-team-expansion-dha-lahore'), 'Contact the team', '/contact', 'internal', 10),
  ((select id from public.updates where slug = 'featured-house-inventory-updated'), 'View listings', '/buy-sell', 'internal', 10),
  ((select id from public.updates where slug = 'facebook-post-mou-partner-update'), 'Facebook post', 'https://www.facebook.com/', 'external', 10),
  ((select id from public.updates where slug = 'investment-consultation-weekly-note'), 'Book consultation', '/contact', 'internal', 10);

delete from public.update_media where update_id in (select id from public.updates where slug in (
  'estate-brothers-team-expansion-dha-lahore',
  'featured-house-inventory-updated',
  'facebook-post-mou-partner-update',
  'investment-consultation-weekly-note'
));

insert into public.update_media (update_id, media_id, sort_order, is_featured, is_inline, is_og_candidate)
values
  ((select id from public.updates where slug = 'estate-brothers-team-expansion-dha-lahore'), '10000000-0000-0000-0000-000000000002', 10, true, false, true),
  ((select id from public.updates where slug = 'featured-house-inventory-updated'), '10000000-0000-0000-0000-000000000003', 10, true, false, true),
  ((select id from public.updates where slug = 'facebook-post-mou-partner-update'), '10000000-0000-0000-0000-000000000007', 10, true, false, true),
  ((select id from public.updates where slug = 'investment-consultation-weekly-note'), '10000000-0000-0000-0000-000000000004', 10, true, false, true);

insert into public.faqs (id, question, answer, sort_order, status)
values
  ('80000000-0000-0000-0000-000000000001', 'How do I contact Estate Brothers?', 'You can contact Estate Brothers by phone or WhatsApp, or by email at estatebrothers786@gmail.com.', 10, 'published'),
  ('80000000-0000-0000-0000-000000000002', 'Where is your office located?', 'Estate Brothers is located at 44-A Main DHA Office Phase 6, Lahore.', 20, 'published'),
  ('80000000-0000-0000-0000-000000000003', 'Do you handle both buying and selling?', 'Yes. Estate Brothers supports property buying, selling, and investment inquiries for residential and commercial clients.', 30, 'published'),
  ('80000000-0000-0000-0000-000000000004', 'What areas do you serve?', 'Estate Brothers serves Lahore with a focus on DHA phases, and supports clients across wider Pakistan property markets.', 40, 'published')
on conflict (id) do update set
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order,
  status = excluded.status;

commit;
