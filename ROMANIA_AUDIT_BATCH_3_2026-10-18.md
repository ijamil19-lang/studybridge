# Romania catalogue audit — Batch 3 (18 October 2026)

## Published scope

Two previously empty universities have now been populated in the live UniRouteFinder programme database.

- **Transilvania University of Brașov** (university ID 17): eight English-taught degrees, five Bachelor and three Master, published programme IDs 1214–1221.
- **University of Craiova** (university ID 6): six English-taught degrees, two Bachelor and four Master, published programme IDs 1208–1213.
- Combined: **14 new course records**, source reviewed 18 October 2026.
- Romanian recorded university programmes before this batch: 62; after: **76**.
- Romanian universities with no programmes before: 13; after: **11**.
- Romania static programme directory before: 44; after: **58**.
- Entire website static programme directory before: 380; after: **394**.
- Sitemap remains at **394 URLs** because every new profile is `noindex,follow` pending specific course/admissions source pages. These 14 new URLs are not in the sitemap. Static course availability and Google indexing are separate metrics.

## Official sources reviewed

### Transilvania University of Brașov

Bachelor degrees: [Official English-language Bachelor's programme descriptions](https://www.unitbv.ro/en/prospective-students/academic-programmes/academic-programmes-in-foreign-languages/bachelor-s-degree.html) and Master degrees: [Official English-language Master's programme descriptions](https://www.unitbv.ro/en/prospective-students/academic-programmes/academic-programmes-in-foreign-languages/master-programmes.html).

| New programme | Degree | ID |
|---|---|---:|
| Automotive Engineering (English-taught) | Bachelor | 1214 |
| Business Administration (English-taught) | Bachelor | 1215 |
| Digital Media (English-taught) | Bachelor | 1216 |
| Electrical Engineering and Computers (English-taught) | Bachelor | 1217 |
| Industrial Design (English-taught) | Bachelor | 1218 |
| Cyber Security (English-taught) | Master | 1219 |
| Internet Technologies (English-taught) | Master | 1220 |
| Virtual Engineering in Automotive Design (English-taught) | Master | 1221 |

Brașov explicitly advises prospective international students to contact the university to establish whether the requested programme is open to them. Accordingly, `international_students=NULL` for all eight entries; this does not mean they are ineligible. The published [non-EU admission information](https://www.unitbv.ro/en/prospective-students/admission/admission-information-for-non-eu-citizens.html) describes a May–July 2026 application period, already elapsed as of this audit.

### University of Craiova

Primary official records: [2026 university foreign-language programme list](https://www.ucv.ro/pdf/admitere/2026/cpv/Study_Programms_Taught_in_Foreign_Languages.pdf), [2026–27 non-EU Bachelor's places](https://www.ucv.ro/pdf/admitere/2026/cpv/Locuri_disponibile_LICENTA_A.pdf), and [2026–27 non-EU admissions](https://www.ucv.ro/en/admitere/foreign_students/Non_EU_Citizens.php).

| New programme | Degree | ID |
|---|---|---:|
| Computer Science (English-taught) | Bachelor | 1208 |
| Economics and International Affairs (English-taught) | Bachelor | 1209 |
| Applied Artificial Intelligence in Mechatronics and Robotics (English-taught) | Master | 1210 |
| Artificial Intelligence and Applied Computing (English-taught) | Master | 1211 |
| Autonomous and Intelligent Systems (English-taught) | Master | 1212 |
| International Economics and Business Administration (English-taught) | Master | 1213 |

The non-EU Bachelor's course-place list explicitly names seven non-EU places for English Computer Science and ten for English Economics and International Affairs in academic year 2026–27. This is **historical admissions evidence**, not a statement of current vacancies; `international_students=true` for those two records. Eligibility remains `NULL` for the four Master's programmes, pending an individual admission check.

Craiova's non-EU application windows for the referenced 2026 cycle ended 21 May and 20 July 2026, respectively. Do not describe these old places as open now.

## Publication and quality rules

These official references currently group several programmes on shared catalogue webpages or PDF lists. Their programme existence, category and teaching language are supported, but **programme-specific enrollment details and exact official course URLs still need checking**. Accordingly, all fourteen new HTML pages are browseable through the Romania directory, explicitly labelled as source-listing records, and set to `noindex,follow`. They do not appear in the sitemap. Do not assert that this release increased the number of URLs available for Google indexation.

The original `discover_programmes` tasks for Brașov and Craiova have **not** been marked completed. The existing Romania queue is preserved for deeper official programme research. No OpenAI paid AI research tasks were run.

## Next Romania priorities

Romania still has 11 already-recorded universities with zero active programmes. Continue with a small, source-based batch such as University of Craiova's remaining faculty courses (only when course-specific evidence is available), and universities including Ovidius University of Constanța, University of Medicine and Pharmacy of Craiova, and Gheorghe Asachi Technical University of Iași. Verify the course type (degree vs Erasmus module), study language, international eligibility, and actual admissions status. Keep `NULL` for unknown international eligibility; avoid creating duplicate research tasks.

Earlier batches and sources: [Romania Audit Progress Report](ROMANIA_AUDIT_PROGRESS_2026-10-18.md).
