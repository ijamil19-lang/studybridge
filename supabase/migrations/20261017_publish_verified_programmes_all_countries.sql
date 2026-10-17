-- StudyBridge multi-country verified programme publisher
-- Applied in Supabase on 2026-10-17; included for reproducible deployment.
-- Calls must be performed with service_role, never from the public client.
CREATE OR REPLACE FUNCTION public.publish_verified_programme(p_result_id bigint)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  r public.research_results%ROWTYPE;
  u public.universities%ROWTYPE;
  v_url text;
  v_host text;
  v_domain text;
  v_home text;
  v_degree text;
  v_level text;
  v_existing_id bigint;
  v_existing_link bigint;
  v_new_id bigint;
  v_international boolean := NULL;
  v_raw_international text;
  v_base_name text;
  v_verified_domain boolean := false;
  v_official_url text;
  v_suffix_pattern text := '[[:space:]]*[-–—][[:space:]]*(master of science|master of arts|bachelor of science|bachelor of arts|master|bachelor|msc|bsc|phd)[[:space:]]*$';
BEGIN
  SELECT * INTO r FROM public.research_results WHERE id = p_result_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'Skipped: research result not found'; END IF;
  IF r.entity_type IS DISTINCT FROM 'programme'
     OR r.verification_status IS DISTINCT FROM 'verified'
     OR r.official_source IS DISTINCT FROM TRUE
     OR r.verified_at IS NULL
     OR coalesce(r.confidence_score,0) < 0.90
     OR r.country_id IS NULL
     OR r.university_id IS NULL
     OR nullif(btrim(r.name),'') IS NULL
  THEN RETURN 'Skipped: not a high-confidence official-source verified programme'; END IF;

  SELECT * INTO u FROM public.universities WHERE id=r.university_id;
  IF NOT FOUND OR u.country_id IS DISTINCT FROM r.country_id
     OR u.is_active IS DISTINCT FROM TRUE
     OR u.official_source_verified IS DISTINCT FROM TRUE
  THEN RETURN 'Skipped: university is not verified or country does not match'; END IF;

  v_url := nullif(btrim(r.extracted_data->>'programme_url'), '');
  IF v_url IS NULL OR length(v_url)>2048
     OR v_url !~* '^https://[a-z0-9][a-z0-9.-]+(/[^[:space:]]*)?$'
     OR v_url ~ '[\[\]()<>]'
     OR coalesce(r.source_url,'') NOT LIKE 'https://%'
  THEN RETURN 'Skipped: missing or malformed official programme URL'; END IF;

  v_host := lower(split_part(split_part(substring(v_url from 9), '/', 1), ':', 1));
  v_host := regexp_replace(v_host,'^www\.','','i');
  FOREACH v_official_url IN ARRAY ARRAY[u.website_url,u.admissions_url,u.international_url]
  LOOP
    IF v_official_url IS NOT NULL AND v_official_url ~* '^https://[a-z0-9]' THEN
      v_domain := lower(split_part(split_part(substring(v_official_url from 9), '/', 1), ':', 1));
      v_domain := regexp_replace(v_domain,'^www\.','','i');
      IF v_host=v_domain OR right(v_host,length(v_domain)+1)='.'||v_domain THEN
        v_verified_domain := true;
      END IF;
    END IF;
  END LOOP;
  IF NOT v_verified_domain THEN
    RETURN 'Skipped: programme URL does not use a recorded official university domain';
  END IF;

  v_level := lower(btrim(coalesce(r.extracted_data->>'degree_level','')));
  v_degree := CASE
    WHEN v_level ~ '(phd|doctoral|doctor of philosophy)' THEN 'PhD'
    WHEN v_level ~ 'postdoc' THEN 'Postdoc'
    WHEN v_level ~ '(certificate|pgcert)' THEN 'Certificate'
    WHEN v_level ~ 'foundation' THEN 'Foundation'
    WHEN v_level ~ '(diploma|pgdip)' THEN 'Other'
    WHEN v_level ~ '(bachelor|undergraduate|(^|[^a-z])bsc([^a-z]|$)|(^|[^a-z])ba([^a-z]|$)|level 6)' THEN 'Bachelor'
    WHEN v_level ~ '(master|postgraduate|(^|[^a-z])msc([^a-z]|$)|(^|[^a-z])ma([^a-z]|$)|mba)' THEN 'Master'
    ELSE NULL END;
  IF v_degree IS NULL THEN RETURN 'Skipped: degree level needs review'; END IF;

  -- Lack of individual international eligibility evidence must never default to TRUE.
  v_raw_international := lower(btrim(coalesce(r.extracted_data->>'international_students','')));
  IF jsonb_typeof(r.extracted_data->'international_students') = 'boolean'
     OR v_raw_international IN ('true','false','yes','no') THEN
    IF v_raw_international IN ('true','yes') THEN v_international := TRUE;
    ELSIF v_raw_international IN ('false','no') THEN v_international := FALSE;
    END IF;
  END IF;

  -- Per-university lock prevents simultaneous verifiers from inserting duplicates.
  PERFORM pg_catalog.pg_advisory_xact_lock(877112,pg_catalog.hashtext(r.university_id::text));
  v_base_name := lower(btrim(regexp_replace(r.name,v_suffix_pattern,'','i')));
  SELECT p.id,p.research_result_id INTO v_existing_id,v_existing_link
  FROM public.programmes p
  WHERE p.university_id=r.university_id AND p.degree_level=v_degree
    AND (lower(btrim(p.name))=lower(btrim(r.name))
      OR lower(btrim(regexp_replace(p.name,v_suffix_pattern,'','i')))=v_base_name)
  ORDER BY p.id LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    IF v_existing_link=r.id THEN
      RETURN 'Already published: '||v_existing_id;
    ELSIF v_existing_link IS NULL THEN
      -- Link an existing catalogue entry to official verification. Preserve
      -- stored fee and eligibility fields; refresh only the verified URL.
      UPDATE public.programmes
        SET research_result_id=r.id,
            programme_url=v_url,
            last_verified=coalesce(r.verified_at,now()),
            updated_at=now()
      WHERE id=v_existing_id AND research_result_id IS NULL;
      RETURN 'Updated existing programme ID: '||v_existing_id;
    END IF;
    RETURN 'Already listed under research result '||v_existing_link||': '||v_existing_id;
  END IF;

  INSERT INTO public.programmes (
    id,research_result_id,university_id,name,degree_level,subject,field,
    description,duration,study_mode,language,programme_url,application_url,
    tuition_fee,tuition_currency,international_students,status,last_verified
  ) VALUES (
    nextval('public.programmes_id_seq'),r.id,r.university_id,r.name,v_degree,
    nullif(btrim(r.extracted_data->>'subject'),''),
    nullif(btrim(r.extracted_data->>'field'),''),
    nullif(btrim(r.extracted_data->>'description'),''),
    nullif(btrim(r.extracted_data->>'duration'),''),
    nullif(btrim(r.extracted_data->>'study_mode'),''),
    nullif(btrim(r.extracted_data->>'language'),''),
    v_url,nullif(btrim(r.extracted_data->>'application_url'),''),
    NULL,NULL,v_international,'active',coalesce(r.verified_at,now())
  )
  ON CONFLICT (research_result_id)
  WHERE research_result_id IS NOT NULL
  DO NOTHING
  RETURNING id INTO v_new_id;

  IF v_new_id IS NULL THEN RETURN 'Already published (concurrent request)'; END IF;
  RETURN 'Published programme ID: '||v_new_id;
END;
$function$
;
REVOKE ALL ON FUNCTION public.publish_verified_programme(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_verified_programme(bigint) TO service_role;
