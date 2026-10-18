# Spain programme coverage audit — batch 1 (18 October 2026)

**Objective:** Reduce universities with no programmes while prioritising official full-degree sources and truthful language / international-eligibility claims.

## Initial live database
- 25 recorded Spanish universities, 30 active programme records; **7 recorded Spanish universities with no active programmes**.
- 25 existing `discover_programmes` tasks are pending; reuse these for detailed course discovery rather than enqueueing duplicates.
- Seven zero-programme institutions before this batch: Universidad de Cádiz, Universidad de Huelva, Universidad de León, Universidad de Murcia, Universidad de Vigo, Universidad Miguel Hernández de Elche, Universidad Pontificia de Salamanca.
- National course availability is much wider than 30 records; don't imply comprehensive Spain-wide coverage.

## New source-checked records

| Record | University | Programme | Teaching language and study conditions | Official programme evidence |
| --- | --- | --- | --- | --- |
| 1256 | Universidad de Cádiz | Erasmus Mundus Joint Master's in Quality in Analytical Laboratories (EMQAL) | English, 120 ECTS, 2 years. Joint Master's with admission requirements for international degree holders | https://oficinadeposgrado.uca.es/informacion-basica-masteres-oficiales/master-interuniversitario-erasmus-mundus-en-calidad-en-los-laboratorios-analiticos-0267/ |
| 1257 | Universidad de Cádiz | Official Bilingual Master's in International Relations and Migrations | Bilingual English and Spanish, about **77% English and 23% Spanish** according to official programme details, 60 ECTS; 2026–27 programme page and teaching schedule | https://derecho.uca.es/docencia/masteres-y-posgrados/master-oficial-bilingue-en-relaciones-internacionales-y-migraciones/ and https://oficinadeposgrado.uca.es/informacion-basica-masteres-oficiales/master-relaciones-internacionales-international-relations-0364/ |
| 1258 | Universidad de Huelva | Erasmus Mundus Master's in Urban Climate and Sustainability (MUrCS) | English, on-campus; may require consortium mobility. Official degree page and September 2026 university approval of modification to the programme verification report | https://www.uhu.es/estudia-en-la-uhu/oferta-academica/masteres-oficiales/murcs-master-erasmus-mundus-en-clima-y-sostenibilidad-urbanos and https://www.uhu.es/secretaria-general/acuerdos/acuerdos-sesion-ordinaria-consejo-de-gobierno-28-de-septiembre-de-2026 |
| 1259 | Universidad de Vigo | Official Master's in Advanced English Studies and its Applications | 2026–27 university faculty study-guide confirms the Master's and individual modules taught in English; **do not assume every component of the full qualification is solely in English** | https://secretaria.uvigo.gal/docnet-nuevo/guia_docent/?centre=301&consulta=assignatures&ensenyament=V01M121V01&idioma=eng&idioma_assig=eng |

The English-language or joint programme nature is not a blanket guarantee of open admission, tuition funding, visa approval or individual eligibility. `international_students` remains `NULL` on 1257 and 1259, where applicant-specific rules were not verified.

## Publishing rules
- Live programme database expected after insertion: **34 active Spanish programmes**, across three more previously empty universities.
- Recorded Spanish universities with 0 active programmes expected: **4**, subject to live count verification.
- Static Spanish course directory: 30 → **34 profiles**.
- Site-wide static programme files: 428 → **432**.
- Indexable new pages: 1256 (EMQAL), 1257 (bilingual International Relations and Migrations), 1258 (MUrCS) with specific official degree pages.
- Page 1259 uses a **faculty-wide degree/module catalogue**, not the dedicated course admissions page, and remains `noindex,follow` and excluded from the sitemap until the official programme link and applicant category can be checked. All four entries remain accessible to students.
- Sitemap: 404 → **407** URLs, not an assertion of Google indexing.
- No duplicate `discover_programmes` queue entries have been added; existing 25 Spanish tasks remain pending. No paid AI research execution occurred.

## Next actions in Spain
1. Investigate the remaining 4 empty universities: Universidad de León, Universidad de Murcia, Universidad Miguel Hernández de Elche and Universidad Pontificia de Salamanca.
2. Continue institution-by-institution depth research for all 25 universities. Compare actual named degrees and faculties against 34 records; import only official full-degree programme URLs and truthful languages.
3. Check EU versus non-EU applicant criteria, Spanish language minimums, academic recognition/homologation, tuition, available intake and scholarship conditions before claiming eligibility.
4. Improve general-source/noindex pages as dedicated official sources become available and audit official URL duplication.
5. Existing research queue tasks should not be arbitrarily marked completed; the manual audit does not exhaust each university's course catalogue.

## Romania audit milestone from this session
Romania now has **110 active programme records at 18 recorded universities**, and **zero of those 18 universities has no active programmes**. Its complete national catalogue, personal international eligibility and applicant admission windows still require deeper source checks. Evidence and all university counts are documented in [Romania Batch 6 report](ROMANIA_AUDIT_BATCH_6_2026-10-18.md).
