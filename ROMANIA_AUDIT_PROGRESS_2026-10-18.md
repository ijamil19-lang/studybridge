# Romania country-by-country catalogue audit — progress report

**Checked:** 18 October 2026. **Site:** https://www.uniroutefinder.com/ **Project:** UniRouteFinder.  
**Status:** Official-source manual batches 1 and 2 completed; full Romania catalogue discovery is **not complete**.

## Confirmed live Supabase counts after this work

| Measure | Before batches | Current |
| --- | ---: | ---: |
| Romanian universities recorded | 18 | 18 |
| Romanian universities with zero active programmes | 16 | 13 |
| Active Romanian programme records | 46 | 62 |
| Bachelor programme records | 18 | 31 |
| Master programme records | 19 | 22 |
| Programme international-eligibility status unconfirmed (`NULL`) | 46 | 54 |
| Static Romania course profiles in country directory | 28 | 44 |
| Static programme profiles site-wide | 364 | 380 |
| Unique sitemap URLs site-wide | 388 | 394 |
| Existing `discover_programmes` Romania tasks still pending | 16 | 16 |

Counts are **catalogue snapshots**, not national course totals or live-open admissions counts. A degree can be accurately documented without confirming the applicant's personal eligibility, the next admissions window, or visa status. `status=active` does not mean applications are currently open.

## Completed manual source-checked batches

### Batch 1 — Babeș-Bolyai University (BBU), Cluj-Napoca
**Four published Bachelor records, IDs 1192–1195.**
- Artificial Intelligence (English taught) — https://www.cs.ubbcluj.ro/education/academic-programmes/undergraduate-programmes/artificial-intelligence/
- Computer Science (English taught) — https://www.cs.ubbcluj.ro/education/academic-programmes/undergraduate-programmes/computer-science-programme-profile/
- Information Engineering (English taught) — https://www.cs.ubbcluj.ro/education/academic-programmes/undergraduate-programmes/information-engineering/
- Mathematics for Computer Science (English taught) — https://www.cs.ubbcluj.ro/education/academic-programmes/undergraduate-programmes/mathematics-computer-science-programme-profile/

Their official 2026–27 university study information supports the qualification, language and curriculum. Eligibility is `NULL` for three records; Mathematics for Computer Science is identified in the university's international Bachelor offer, without guaranteeing individual eligibility.

### Batch 2 — Technical University of Cluj-Napoca (UTCN)
**Seven published records, IDs 1201–1207:**
- Bachelor: Applied Electronics (1201), Automation and Applied Informatics (1202), Computer Science (1203), Telecommunications Technologies and Systems (1204).
- Master: Artificial Intelligence and Vision (1205), Cybersecurity Engineering (1206), Data Science (1207).

Primary official confirmation: [UTCN non-EU international admissions programme list](https://admitereonline.utcluj.ro/international-students/international-students-noneu/). Programme-level context: [Computer Science 2026–27 curriculum](https://cs.utcluj.ro/studii-de-licen%C8%9B%C4%83-27/2026-2027.html) and [Faculty of Automation study plans](https://ac.utcluj.ro/planuri-de-invatamant.html).

**Admissions caveat:** UTCN's source states that its 2026 non-EU application sessions ran March–July and July–September 2026; both periods are in the past as of this check. This is **not** evidence of a currently open intake. All listed programmes require fresh application-window and nationality-specific checking.

### Batch 2 — Alexandru Ioan Cuza University of Iași (UAIC)
**Five published Bachelor records, IDs 1196–1200:**
- American Studies (1196), Business Administration (1197), Computer Science (1198), Geography of Tourism (1199), Physics (1200).

Official confirmations:
- [UAIC's English- and French-taught degrees](https://www.uaic.ro/en/studies/degrees-on-offer-in-english-and-french/).
- [UAIC Computer Science faculty Bachelor's list](https://www.uaic.ro/en/studies/faculties/faculty-computer-science/).
- [UAIC 2026 Business Administration admissions](https://www.feaa.uaic.ro/undergraduate-admission2/?lang=en).
- [UAIC Geography and Geology faculty](https://www.uaic.ro/en/studies/faculties/faculty-geography-geology/).

For these five UAIC records, `international_students=NULL` until programme- and applicant-specific evidence is checked. Degree availability must not be confused with Erasmus single-course listings.

## Publication and indexing quality gate
- All 12 second-batch records are stored as active catalogue entries in Supabase and have static course pages linked from [Romania's directory](https://www.uniroutefinder.com/courses-in-romania.html).
- Only 2 of the new 12 (Business Administration 1197 and Computer Science UTCN 1203) have sufficiently focused source pages for provisional inclusion in `sitemap.xml`.
- The other 10 are **public, linked and marked `noindex,follow`** pending stronger course-specific sources. Their pages explicitly explain that the linked official site is a faculty- or university-level directory. Don't put them into sitemap before finding specific source documentation.
- Combined static site now has 380 programme profiles and 394 sitemap URLs. Only Google decides actual indexation; these figures do not measure Google-indexed pages.
- GitHub release: [PR #23](https://github.com/ijamil19-lang/studybridge/pull/23). Previous BBU release: [PR #22](https://github.com/ijamil19-lang/studybridge/pull/22).

## Outstanding Romanian research queue
- **16 existing `discover_programmes` tasks are still pending.** The three universities checked manually have pending tasks that should remain available for deeper source-specific audits and additional degrees; their tasks have not been marked completed.
- **13 recorded Romanian universities still have zero active programme records.**
- Suggested next priority: Transilvania University of Brașov, University of Craiova, then other programme-empty Romanian universities. Do not fabricate records from general faculty webpages. Verify degree versus individual module, teaching language, official programme URL, international eligibility, and admission round before publishing.
- Never run global `process_pending` blindly for a country-specific batch; it selects pending research tasks from multiple countries and can consume OpenAI credits. The `research-agent` Edge Function currently requires its own authenticated `withSupabase` secret; direct invocation was not available through the connected Supabase tools used in this audit. **No paid AI agent executions occurred in this batch.**
