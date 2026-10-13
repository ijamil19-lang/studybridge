STUDYBRIDGE — GITHUB PAGES WEBSITE

Files:
  index.html  — main website and sections
  styles.css  — responsive design
  app.js      — public Supabase read-only data requests and search filters
  privacy.html — draft privacy policy (review before publishing)

PUBLISH:
1. Open your GitHub repository: https://github.com/ijamil19-lang/studybridge
2. Upload these FOUR files into the repository root (not inside a folder).
3. Replace index.html if prompted, and commit the changes.
4. Wait for GitHub Pages to publish, then open:
   https://ijamil19-lang.github.io/studybridge/
5. Hard-refresh (Ctrl+Shift+R).

DATA:
Uses the same Supabase project URL and browser publishable key from your supplied existing index.html.
It reads: universities, programmes, scholarships, admissions, phd_positions.
Your Supabase public SELECT RLS policies must remain correctly configured.
Only database-backed records are shown. No listings are fabricated.

CHECK BEFORE PUBLICATION:
- Test university and programme searches, including filters.
- Check scholarships, admissions, and PhD listings. Field names vary; the code attempts common names, but may need mapping to your actual schema.
- Review and personalize privacy.html. No contact address was provided, so none was invented.
- Check all official links and missing records.
- This is a static information/search website; it does not process student applications, payments or logins.
- Do not replace the publishable key with a service-role or secret key.
