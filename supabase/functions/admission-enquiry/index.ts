import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set(["https://www.uniroutefinder.com", "https://uniroutefinder.com"]);
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.uniroutefinder.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const recentRequests = new Map<string, number[]>();
const json = (body: unknown, status = 200, origin?: string | null) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, ...(origin && allowedOrigins.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}), "Content-Type": "application/json" },
});
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]!));
const allowedDegrees = new Set(["Foundation","Bachelor","Master","PhD","Diploma","Certificate","Not sure — please advise"]);
const allowedCurrencies = new Set(["GBP","EUR","USD","PKR","INR","BDT","NGN","AED","Other"]);

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: { ...corsHeaders, ...(origin && allowedOrigins.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}) } });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origin not allowed." }, 403, origin);
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 18000) return json({ error: "Submission is too large." }, 413, origin);

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (recentRequests.get(forwarded) || []).filter(t => now - t < 15 * 60 * 1000);
  if (recent.length >= 5) return json({ error: "Too many attempts. Please try again later." }, 429, origin);
  recent.push(now); recentRequests.set(forwarded, recent);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Invalid form submission." }, 400, origin); }
  if (clean(body.website, 200)) return json({ success: true }, 200, origin);

  const full_name = clean(body.full_name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const country_of_residence = clean(body.country_of_residence, 100);
  const nationality = clean(body.nationality, 100);
  const highest_qualification = clean(body.highest_qualification, 100);
  const preferred_degree_level = clean(body.preferred_degree_level, 80);
  const preferred_subject = clean(body.preferred_subject, 160);
  const grades = clean(body.grades, 120);
  const english_test = clean(body.english_test, 80);
  const english_score = clean(body.english_score, 80);
  const preferred_intake = clean(body.preferred_intake, 100);
  const additional_information = clean(body.additional_information, 2000);
  const budget_currency = clean(body.budget_currency, 8) || "GBP";
  const countries = Array.isArray(body.preferred_countries) ? body.preferred_countries.slice(0, 5).map(x => clean(x, 60)).filter(Boolean) : [];
  const budget = body.annual_budget === null || body.annual_budget === "" || body.annual_budget === undefined ? null : Number(body.annual_budget);
  const programme_id = body.programme_id && /^[1-9]\d{0,14}$/.test(String(body.programme_id)) ? Number(body.programme_id) : null;
  const source_url = clean(body.source_url, 500);

  if (full_name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 5 ||
      !country_of_residence || !nationality || !highest_qualification || !preferred_subject ||
      !allowedDegrees.has(preferred_degree_level) || body.consent_to_contact !== true ||
      !allowedCurrencies.has(budget_currency) || (budget !== null && (!Number.isFinite(budget) || budget < 0 || budget > 500000))) {
    return json({ error: "Please complete all required fields and check your email, budget and consent." }, 400, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let secretKey = serviceRole;
  if (secretKeysRaw) {
    try { secretKey = JSON.parse(secretKeysRaw).default || secretKey; } catch { /* legacy service role fallback */ }
  }
  if (!supabaseUrl || !secretKey) return json({ error: "The enquiry service is not configured yet." }, 503, origin);

  const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const row = {
    full_name, email, phone, country_of_residence, nationality, highest_qualification,
    grades: grades || null, english_test: english_test || null, english_score: english_score || null,
    preferred_degree_level, preferred_subject, preferred_countries: countries,
    preferred_intake: preferred_intake || null, annual_budget: budget,
    budget_currency, scholarship_required: body.scholarship_required === true,
    additional_information: additional_information || null, programme_id,
    source_url: source_url || null, consent_to_contact: true,
  };
  const { data, error } = await supabase.from("admission_enquiries").insert(row).select("id").single();
  if (error || !data) {
    console.error("Admission enquiry insert failed:", error?.message);
    return json({ error: "We could not save your enquiry. Please try again later." }, 500, origin);
  }

  let notificationStatus = "pending";
  let notificationError: string | null = null;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const notifyEmail = Deno.env.get("ADMISSIONS_NOTIFICATION_EMAIL");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  if (resendKey && notifyEmail && fromEmail) {
    const details = [
      ["Enquiry ID", String(data.id)], ["Name", full_name], ["Email", email], ["Phone / WhatsApp", phone],
      ["Country of residence", country_of_residence], ["Nationality", nationality],
      ["Highest qualification", highest_qualification], ["Grades", grades || "Not provided"],
      ["English test", [english_test, english_score].filter(Boolean).join(" · ") || "Not provided"],
      ["Study level", preferred_degree_level], ["Subject", preferred_subject],
      ["Preferred countries", countries.join(", ") || "Not specified"],
      ["Intake", preferred_intake || "Not specified"],
      ["Annual budget", budget === null ? "Not specified" : budget_currency + " " + budget],
      ["Scholarship needed", body.scholarship_required === true ? "Yes / explore options" : "No"],
      ["Additional information", additional_information || "None"],
      ["Source page", source_url || "Not recorded"],
    ];
    const html = "<h2>New UniRouteFinder admission enquiry</h2><table cellpadding='7' cellspacing='0' border='1' style='border-collapse:collapse;border-color:#ddd'>" +
      details.map(([k,v]) => "<tr><th align='left'>" + escapeHtml(k) + "</th><td>" + escapeHtml(v) + "</td></tr>").join("") + "</table>";
    try {
      const mailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + resendKey, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromEmail, to: [notifyEmail], reply_to: email, subject: "New admission enquiry #" + data.id + " — " + full_name, html }),
      });
      if (!mailResponse.ok) throw new Error("Email provider returned HTTP " + mailResponse.status);
      notificationStatus = "sent";
    } catch (e) {
      notificationStatus = "failed";
      notificationError = e instanceof Error ? e.message.slice(0, 300) : "Email delivery failed";
      console.error("Admission enquiry notification failed:", notificationError);
    }
  }
  await supabase.from("admission_enquiries").update({
    email_notification_status: notificationStatus,
    email_notification_error: notificationError,
    updated_at: new Date().toISOString(),
  }).eq("id", data.id);

  return json({ success: true, enquiry_id: data.id, notification_sent: notificationStatus === "sent" }, 201, origin);
});
