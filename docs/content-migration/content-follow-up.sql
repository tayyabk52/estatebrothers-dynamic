-- Follow-up content-only corrections, executed 2026-09-05.
begin;
insert into public.seo_url_rules (source_pattern,rule_kind,canonical_path,reason,active)
values ('/dha-lahore-plots','canonical','/dha-lahore-plots-for-sale','Preserve original static DHA landing URL using the existing clean-route canonical redirect handler.',true);
update public.team_members set meta_title=name || ' | Estate Brothers'
where id in ('40000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000006','40000000-0000-0000-0000-000000000008','40000000-0000-0000-0000-000000000009');
update public.page_blocks set icon_name=null,attributes=attributes-'duration'-'durationIso'
where id in ('b81cd39e-9e8a-43d5-b234-341cffe12069','6316192c-5216-433e-af08-8835bc7a1401','bc22a2e4-331b-49be-9389-cc1c2a3db26f','f50e761d-cc67-417d-9c78-3f39a7992515','363c427f-0b09-4c2e-b1f7-50bb04cf2901','6c478046-f5c8-4e5d-b54a-8f2a0bd1719a');
commit;
