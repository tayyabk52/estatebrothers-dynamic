begin;
do $$ begin if (select count(*) from public.real_estate_listings where status='published' and listing_type_slug='plot') <> 15 then raise exception 'Expected 15 published plot listings'; end if; end $$;
with source(slug,title,summary,source_listing_id,property_type) as (values
('5-marla-pre-launch-residential-plot','5 Marla Pre-Launch Residential Plot','Pre-launch payment plan for a 5 Marla residential plot. Prices include the cost of land only; development charges are separate.','plot-etihad-5-marla','Land'),
('10-marla-pre-launch-residential-plot','10 Marla Pre-Launch Residential Plot','Pre-launch payment plan for a 10 Marla residential plot. Prices include the cost of land only; development charges are separate.','plot-etihad-10-marla','Land'),
('20-marla-pre-launch-residential-plot','20 Marla Pre-Launch Residential Plot','Pre-launch payment plan for a 20 Marla residential plot. Prices include the cost of land only; development charges are separate.','plot-etihad-20-marla','Land'),
('40-marla-pre-launch-residential-plot','40 Marla Pre-Launch Residential Plot','Pre-launch payment plan for a 40 Marla residential plot. Prices include the cost of land only; development charges are separate.','plot-etihad-40-marla','Land'),
('4-marla-commercial-plot-the-east-block','4 Marla Commercial Plot - The East Block','3-year commercial plot payment plan in Al Ghani Garden Phase 7 (The East Block). Premium category plot features carry an additional 10% charge.','plot-al-ghani-commercial-4-marla','Commercial'),
('3-marla-on-ground-possession-plot','3 Marla On Ground Possession Plot','4-year installment payment plan for an on-ground possession 3 Marla residential plot in Safari Garden Housing Scheme.','plot-safari-3-marla','Land'),
('5-marla-on-ground-possession-plot','5 Marla On Ground Possession Plot','4-year installment payment plan for an on-ground possession 5 Marla residential plot in Safari Garden Housing Scheme.','plot-safari-5-marla','Land'),
('8-marla-on-ground-possession-plot','8 Marla On Ground Possession Plot','4-year installment payment plan for an on-ground possession 8 Marla residential plot in Safari Garden Housing Scheme.','plot-safari-8-marla','Land'),
('10-marla-on-ground-possession-plot','10 Marla On Ground Possession Plot','4-year installment payment plan for an on-ground possession 10 Marla residential plot in Safari Garden Housing Scheme.','plot-safari-10-marla','Land'),
('4-marla-commercial-plot-3-years-payment-plan','4 Marla Commercial Plot - 3 Years Payment Plan','Commercial plot opportunity spanning 4 Marla under a structured 3-year plan by Rafi Group in Lahore Ka Naya Markaz.','plot-green-palms-commercial-4-marla','Commercial'),
('5-marla-residential-plot-3-years-payment-plan','5 Marla Residential Plot - 3 Years Payment Plan','5 Marla residential land investment structured over 33 monthly payments with complete policy parameters from Rafi Group.','plot-green-palms-5-marla','Land'),
('10-marla-residential-plot-3-years-payment-plan','10 Marla Residential Plot - 3 Years Payment Plan','10 Marla premium residential property investment file featuring milestone options over 3 years.','plot-green-palms-10-marla','Land'),
('01-kanal-residential-plot-3-years-payment-plan','01 Kanal Residential Plot - 3 Years Payment Plan','Executive choice 1 Kanal residential land division with comprehensive financial layout spanning a 3-year term.','plot-green-palms-1-kanal','Land'),
('3-marla-on-ground-plot-the-east-block','3 Marla On Ground Plot - The East Block','On-ground 3 Marla plot in Al Ghani Garden Phase 7 with a 36-month installment plan. Offers key community infrastructure and explicit registry verification.','plot-al-ghani-ground-3-marla','Land'),
('5-marla-on-ground-plot-the-east-block','5 Marla On Ground Plot - The East Block','On-ground 5 Marla residential plot in a TMA-approved sector of Al Ghani Garden Phase 7. Complete structural breakdown over 36 monthly cycles.','plot-al-ghani-ground-5-marla','Land')
)
update public.real_estate_listings l
set title=source.title,
    summary=source.summary,
    neighborhood=coalesce(l.neighborhood,l.phase),
    attributes=l.attributes || jsonb_build_object('source_listing_id',source.source_listing_id,'property_type',source.property_type)
from source where l.slug=source.slug;
commit;
