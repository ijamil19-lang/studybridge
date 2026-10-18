# UniRouteFinder — Country-by-country catalogue coverage audit
**Snapshot:** 18 October 2026 · **Data source:** live Supabase catalogue (project `fkhjpunzfugjcyxqulzm`) · **Status:** initial ten-country inventory completed; official programme-by-programme gap checking remains open.

## Purpose and limits
Identify countries and universities where UniRouteFinder is currently missing degree programmes relevant to international applicants. Coverage is measured against the *recorded* catalogue, not a census of every programme nationally. National portals below show that substantial further work is necessary. A university-level `official_source_verified=true` flag is **not** a guarantee that every programme, intake or applicant status has been reverified. `status=active` in the catalogue means a retained active listing, **not** applications are currently open.

## Live inventory

| Country | Active universities | Active programmes | Bachelor | Master | PhD | Recorded universities with zero active programmes | International eligibility unconfirmed | Pending programme-discovery tasks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Hungary (HU) | 17 | 35 | 22 | 12 | 0 | 2 | 1 | 17 |
| Romania (RO) | 18 | 46 | 18 | 19 | 8 | 16 | 46 | 16 |
| Spain (ES) | 25 | 30 | 18 | 12 | 0 | 7 | 7 | 25 |
| Finland (FI) | 28 | 46 | 42 | 4 | 0 | 0 | 1 | 28 |
| Italy (IT) | 6 | 15 | 5 | 10 | 0 | 1 | 4 | 3 |
| Lithuania (LT) | 2 | 11 | 9 | 2 | 0 | 0 | 2 | 2 |
| Canada (CA) | 3 | 13 | 13 | 0 | 0 | 0 | 0 | 3 |
| United States (US) | 2 | 12 | 12 | 0 | 0 | 0 | 0 | 2 |
| United Kingdom (GB) | 14 | 190 | 82 | 68 | 17 | 0 | 104 | 0 |
| Sweden (SE) | 40 | 780 | 138 | 505 | 94 | 0 | 0 | 0 |
| **Total** | **155** | **1,178** | **359** | **632** | **119** | **26** | **165** | **96** |

Degree columns intentionally omit Foundation, Certificate and Other, so their sum differs from all active programmes. These are database counts, not official national totals. Additional `status=active` records can still have outdated or closed admissions, incomplete descriptions, or unconfirmed international applicant rules.

## Country findings and official benchmark sources

### 1. Hungary — HIGH priority; continue discovery
- After the 7 newly verified Computer Science and related Bachelor's entries, UniRouteFinder records 17 universities and 35 programmes. Two existing universities still have no programmes; most of the recorded universities have only 1–2.
- The official Tempus Public Foundation [Study in Hungary Study Finder](https://studyinhungary.hu/study-in-hungary/menu/find-a-study-programme) and [Degree Programmes guide](https://studyinhungary.hu/study-in-hungary/menu/studying-in-hungary/degree-programmes.html) describe a broad multilingual catalogue of 700+ programmes. **This is not a directly comparable count to English-taught, verified, international-eligible courses** and is not an instruction to import everything.
- Five new targeted discovery tasks were queued (IDs 1741–1745): ELTE, Óbuda University, Debrecen, Miskolc, Szeged. The 12 original pending Hungarian discovery tasks have been retained, not duplicated.
- Next: check official course pages, exact degree category, teaching language, individual nationality requirements and programme-specific admissions status. De-duplicate by institution + degree + course title + official URL.

### 2. Romania — CRITICAL programme-population gap
- 18 institutions are in the catalogue, but **16 have zero active programmes**. All 46 active courses belong to two existing institutions, and all 46 currently have `international_students=NULL` — meaning **eligibility unconfirmed**, not ineligible.
- Official [Study in Romania universities](https://www.studyinromania.gov.ro/universities) lists 51 institutions at the time of this audit; official [Study Programmes](https://www.studyinromania.gov.ro/what) includes degree, language and programme details.
- Sixteen previously created `discover_programmes` tasks are already pending for programme-empty institutions.
- Next: complete those tasks in small source-verified batches and review missing institution discovery. Start with Babeș-Bolyai University, Technical University of Cluj-Napoca, and Alexandru Ioan Cuza University. Record international eligibility as `NULL` until confirmed.

### 3. Spain — CRITICAL depth gap
- 25 institutions but just 30 active programmes; 7 already recorded universities have zero courses, and 17 others have only 1–2 each.
- [SEPIE: What to study in Spain](https://www.sepie.es/internacionalizacion/what-to-study-in-spain.html) describes degree search sources (including RUCT and QEDU). Its published 91-institution national figure relates to academic year 2023–24; **do not claim it is the exact October 2026 count**.
- 25 pending programme-discovery tasks already exist, including 7 for zero-course universities.
- Next: programme-by-programme discovery using university official pages; verify Spanish vs English vs bilingual delivery and nationality-specific restrictions. Do not present all Spanish courses as English-taught.

### 4. Finland — HIGH depth gap and 2027 intake
- 28 verified institutions but just 46 active programme records; 26 institutions have 1–2 active programmes.
- Official [Study in Finland admission guide](https://www.studyinfinland.fi/admissions/bachelors-and-masters-admissions) directs applicants to **Studyinfo.fi**. [October 2026 announcement](https://www.studyinfinland.fi/news-events/prepare-for-2027) says hundreds of English-taught 2027 Bachelor's and Master's programmes can be researched, with many January 2027 application rounds.
- 28 pending programme-discovery tasks already exist.
- Next: prioritise 2027 Bachelor's and Master's profiles with official Studyinfo/university links. Mark timing separately; do not infer an intake is open based only on course presence.

### 5. Italy — HIGH breadth and verification gap
- 6 recorded universities, 15 active programmes; one university has zero active programme records.
- [Universitaly](https://www.universitaly.it/en) provides official programme searching and international pre-enrolment guidance.
- 3 discovery tasks and **36 programme verification tasks** are already pending. Avoid duplicating these.
- Next: finish the pending verification workload in small batches; then expand universities/course coverage. Confirm Bachelor's vs Laurea Magistrale, language and actual application window.

### 6. Lithuania — HIGH breadth gap
- Only 2 universities and 11 active programmes, although the national [Study in Lithuania programme finder](https://studyin.lt/study-programmes/) lists programmes across many different universities and colleges.
- The 2 existing institutions already have pending discovery tasks; the country's university-discovery task was still processing when audited.
- Next: complete university discovery and add missing institutions, then verify individual degree records and latest eligibility/fee information.

### 7. Canada — HIGH breadth gap
- Only 3 universities and 13 Bachelor's programmes. Government [EduCanada universities](https://www.educanada.ca/study-plan-etudes/university-universite.aspx?lang=eng) says Canada has roughly 100 public universities and 16,000 university programmes (a broad national benchmark, not a count of international-eligible degrees).
- The [EduCanada programme finder](https://w05.educanada.ca/) warns that programme/tuition information has temporarily stopped being updated while the platform transitions; the results reflect July 2026. **Never use that data as proof of a programme's current price.**
- 3 pending programme-discovery tasks and 1 pending university-discovery task already exist.
- Next: expand the institution list from official sources; verify Canadian designated-learning-institution status and precise programme pages; confirm international admissions.

### 8. United States — HIGH breadth gap
- Just 2 universities and 12 Bachelor's programme records. This is clearly only a small selection, not comprehensive national coverage.
- Official [NCES College Navigator](https://nces.ed.gov/collegenavigator/) supports institution/major research. [DHS Study in the States School Search](https://studyinthestates.dhs.gov/school-search) shows schools approved to enrol relevant international student visa categories; the school-wide listing alone does not confirm any particular programme's visa suitability.
- 2 pending programme-discovery tasks and 1 pending university-discovery task already exist.
- Next: expand university discovery and use individual university course pages plus visa/in-person mode review.

### 9. United Kingdom — MODERATE/HIGH expansion + quality review
- 14 universities and 190 programmes in the live catalogue; 104 have unconfirmed international eligibility and 35 have short descriptions (fewer than 130 characters).
- [UCAS Search Courses](https://www.ucas.com/explore/search/courses) offers much broader UK undergraduate course discovery than this current 14-university sample.
- All 14 previously queued per-university discovery tasks are complete; **there are no current pending per-university discovery tasks**. Further expansion needs a new, deduplicated institution-discovery plan rather than rerunning tasks blindly.
- Next: prioritise verified international-study eligibility and a broader university list, while separating fee status and current intake from course existence.

### 10. Sweden — QUALITY before more quantity
- 40 institutions and 780 active programmes, including 505 Master's entries and 94 records marked PhD. This is the largest country catalogue in UniRouteFinder.
- 377 descriptions are shorter than 130 characters. All 780 have `international_students=true`, which is a **stored flag, not proof that every student/nationality is personally eligible**. Five programme profiles using one generic University West directory link were previously withheld from Google indexing; keep auditing indirect sources and duplicates.
- Official [University Admissions](https://www.universityadmissions.se/en/apply-to-masters/search-for-courses-and-programmes-masters/) is a Swedish university course database and the country's coordinated admissions channel.
- No additional programme discovery tasks are pending. Prioritise checking the current catalogue's links, one-course-vs-one-programme distinction, intake and international eligibility before expanding.

## Priority order for follow-up work
1. **Romania:** populate the 16 no-course universities, then verify international applicant status.
2. **Hungary:** run/check the 17 queued official university programme searches, starting with the 5 newly added universities and computer-related subjects.
3. **Spain:** process the 25 existing programme-discovery tasks, starting with the 7 zero-course institutions.
4. **Finland:** process the 28 existing tasks focusing on 2027 English-taught Bachelor's/Master's study opportunities.
5. **Italy:** verify the 36 pending programme candidates before more imports; process 3 remaining discoveries.
6. **Lithuania:** finish university discovery and the 2 university programme tasks.
7. **Canada and USA:** expand institution discovery beyond currently recorded 3 and 2 universities.
8. **UK:** expand the institution list and review unconfirmed international eligibility.
9. **Sweden:** undertake a quality/deduplication audit before adding volume.

## Reuse existing research queues instead of creating duplicates
Existing pending `discover_programmes` tasks: **96** (CA 3, ES 25, FI 28, HU 17, IT 3, LT 2, RO 16, US 2). 5 HU tasks (1741–1745) were newly added during this audit and included in that total; the other 91 were already pending. No AI agent runs were started as part of this audit; queued research jobs can incur API cost when executed.

## Import and verification checklist
For each university/programme: (1) verified official institution and URL, (2) actual named programme and qualification level, (3) degree vs short standalone course/module vs PhD position classification, (4) campus and teaching language, (5) international eligibility and nationality-specific rules (unknown remains `NULL`), (6) programme-specific official link, (7) fees and currency **only with fee-category and year evidence**, (8) intake status / deadline separate from catalogue-active, (9) last check date/source, (10) duplicate-key check by university + degree + normalized course name and official URL, (11) verification before public publication. Never infer an open application window or scholarship from a course listing.

## Audit caveats
- This is a **catalogue coverage audit** grounded in internal data and comparisons with authentic national sources, **not** a completed audit of every course offered in all ten countries. Exhaustive comparison requires the queued institution and programme research work.
- National source counts refer to differing populations and sometimes historical periods; percentages based on unmatched denominators would mislead.
- Static SEO profile counts (public HTML pages) differ from programme database totals; a missing static page does not necessarily mean the programme is absent from search.
- Don't add thousands of duplicate or thin HTML pages purely for search ranking. Fix actual catalogue completeness, source quality and searchable functionality first.
