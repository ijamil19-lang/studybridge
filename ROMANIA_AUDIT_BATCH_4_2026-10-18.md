# Romania programme audit — Batch 4: Iași and Constanța
**Checked:** 18 October 2026. **Programme records:** 1222–1229. **Status:** database records inserted, new programme HTML and country directory prepared for publishing.

## University coverage and degree count
- **Gheorghe Asachi Technical University of Iași (ID 10):** four newly catalogued programmes, three Bachelor and one Master.
- **Ovidius University of Constanța (ID 22):** four newly catalogued programmes, three Bachelor and one Master.
- These two recorded universities previously had zero active programme records.
- Romanian programme records: **76 to 84**. Romanian universities with no active programmes: **11 to 9** (pending final database confirmation).
- Static Romania profiles: **58 to 66**; site-wide static profiles: **394 to 402**.
- Sitemap: **394 to 400 unique URLs**. Sitemaps are discovery targets and **not** verified indexed page counts.

## Official programme records and sources

### Gheorghe Asachi Technical University of Iași
- **1222 — Civil Engineering (English-taught), Bachelor, four years/240 ECTS.** Dedicated official degree page: https://study.tuiasi.ro/study-programs/civil-engineering/
- **1223 — Industrial Design (English-taught), Bachelor, four years/240 ECTS.** Dedicated official degree page: https://study.tuiasi.ro/study-programs/industrial-design/
- **1224 — Telecommunication Technologies and Systems (English-taught), Bachelor, four years/240 ECTS.** Dedicated official degree page: https://study.tuiasi.ro/study-programs/telecommunication-technologies-and-systems/
- **1225 — Structural Engineering (English-taught), Master, two years/120 ECTS.** Dedicated government Study in Romania degree profile: https://studyinromania.gov.ro/program/6181

All four have course-specific sources and were selected for sitemap inclusion. Their `international_students` values remain `NULL` until the individual nationality, intake, eligibility and university admissions criteria are confirmed. TUIASI's university international page https://international.tuiasi.ro/international-students/come-for-a-degree/ describes programme research and admission routes, but does not establish that applications are currently open.

### Ovidius University of Constanța
- **1226 — American Studies (English-taught), Bachelor.** International student degree directory: https://admission.univ-ovidius.ro/v2/choose-your-program/programs-taught-in-english/ — shared programme list, `noindex,follow`, excluded from sitemap pending a dedicated official source.
- **1227 — Business Administration (English-taught), Bachelor, three years/180 ECTS.** Faculty educational offer: https://stec-en.univ-ovidius.ro/admission/educational-offer-2/ — specific Business Administration English programme with duration and level. Selected for sitemap.
- **1228 — Computer Science (English-taught), Bachelor.** Official faculty 2026 international Bachelor admissions page https://fmi.univ-ovidius.ro/en/admitere/studii-licenta/ — shows international admission records for English Computer Science. Selected for sitemap.
- **1229 — Entrepreneurship and Business Administration (English-taught), Master.** Faculty programme list https://stec.univ-ovidius.ro/oferta-educationala/ — shared listing; `noindex,follow`, excluded from sitemap pending dedicated official programme source.

Ovidius's official international-student degree directory identifies all four programme options, and faculty/2026 admission sources confirm the two indexed Bachelor degree profiles. Values `international_students=true` record their appearance in a published international-student programme offer, **not** current intake, scholarship or individually confirmed eligibility. The university's international admissions site https://admission.univ-ovidius.ro/v2/how-to-apply/bachelors-degree/ explains applicant-specific procedures, foreign qualifications and English language evidence.

## Quality and indexing checks
- Dedicated source evidence: pages **1222, 1223, 1224, 1225, 1227, 1228** use `index,follow` and are included in `/sitemap.xml`.
- General directory evidence: pages **1226, 1229** use `noindex,follow` and remain available to site visitors and through the course directory, but are **not** in the sitemap.
- Do not conflate database `status=active` with applications being open. University study programme entries and 2026 admission results are historical sources where appropriate.
- Full institution-level discovery remains incomplete. The existing Romanian `discover_programmes` task backlog has **not** been executed or marked completed. No paid AI research was run in this manual batch.
- Next prioritisation: continue other Romanian zero-programme universities, verify individual international eligibility (many entries still unknown), and replace general directory links with specific, current course pages before indexing those profiles.
