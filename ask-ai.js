"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const form = $("ask-form");
  if (!form) return;
  const submit = $("ask-submit"), status = $("ask-status");
  const results = $("ask-results"), answer = $("ask-answer"), disclaimer = $("ask-disclaimer");
  const API = "https://fkhjpunzfugjcyxqulzm.supabase.co/functions/v1/ask-ai";
  const PUBLIC_KEY = "sb_publishable_-fa_jUcsGTzjUFatez1adg_aN9rip7c";
  const node = (tag, className, value) => {
    const elem = document.createElement(tag);
    if(className) elem.className = className;
    if(value !== undefined) elem.textContent = String(value);
    return elem;
  };
  const showStatus=(msg, error=false)=> {
    status.textContent=msg;
    status.className=error?"ask-error":"";
  };
  const params = new URLSearchParams(location.search);
  const country = params.get("country");
  if (country && [...$("country").options].some(opt=>opt.value===country)) $("country").value=country;
  const degree = params.get("degree");
  if (degree && [...$("degree").options].some(opt=>opt.value===degree)) $("degree").value=degree;
  const safeLink = value => {
    try { const url = new URL(value); return url.protocol==="https:" ? url.href : null; }
    catch { return null; }
  };
  const eligibility = value => {
    if(value === "listed") return ["Listed as accepting international students", "listed"];
    if(value === "restricted") return ["Restrictions recorded — check official criteria", "restricted"];
    return ["International eligibility not yet confirmed", "unconfirmed"];
  };
  function draw(data) {
    results.replaceChildren();
    answer.hidden = false;
    answer.textContent = data.answer || "Review these programmes and confirm all application requirements with the university.";
    disclaimer.hidden = false;
    const matches=Array.isArray(data.matches)?data.matches:[];
    if (!matches.length) {
      results.append(node("div","ask-empty","No close matches found in the published catalogue for your selected country and degree level. Try a broader question, different level or browse programmes."));
      showStatus("No close matches from " + (Number(data.considered)||0) + " published courses.");
      return;
    }
    showStatus(matches.length+" suggested "+(matches.length===1?"programme":"programmes")+" from "+(Number(data.considered)||0)+" published courses.");
    for(const programme of matches) {
      const card=node("article","ask-card");
      const top=node("div","ask-card-top");
      top.append(node("span","ask-degree",programme.degree || "Programme"));
      const [eligibilityLabel,kind]=eligibility(programme.international_status);
      top.append(node("span","ask-eligibility ask-"+kind,eligibilityLabel));
      card.append(top);
      card.append(node("h3","",programme.name || "Untitled programme"));
      card.append(node("p","ask-university",programme.university || "University not recorded"));
      if(programme.subject) card.append(node("p","ask-subject","Subject: "+programme.subject));
      if(programme.reason) card.append(node("p","ask-reason",programme.reason));
      const actions=node("div","ask-actions");
      if(Number.isSafeInteger(Number(programme.id)) && Number(programme.id)>0){
        const details=node("a","ask-detail","View StudyBridge details →");
        details.href="programme.html?id="+encodeURIComponent(programme.id);
        actions.append(details);
      }
      const verified=safeLink(programme.official_url);
      if (verified) {
        const official=node("a","ask-official","Official university course ↗");
        official.href=verified; official.target="_blank"; official.rel="noopener noreferrer";
        actions.append(official);
      }
      card.append(actions);
      results.append(card);
    }
  }
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const payload={
      country:$("country").value,degree:$("degree").value,
      question:$("question").value.trim(),qualification:$("qualification").value.trim(),
      nationality:$("nationality").value.trim(),notes:$("notes").value.trim()
    };
    if(payload.question.length<8){showStatus("Describe the course you want in a little more detail.",true);return;}
    submit.disabled=true;submit.textContent="Finding courses…";
    answer.hidden=true;disclaimer.hidden=true;
    results.replaceChildren(node("div","ask-loading","Reviewing published courses in your selected country…"));
    showStatus("Searching and ranking suitable courses…");
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),38000);
    try{
      const response=await fetch(API,{method:"POST",
        headers:{"Content-Type":"application/json","apikey":PUBLIC_KEY},
        body:JSON.stringify(payload),signal:controller.signal});
      const data=await response.json().catch(()=>({error:"The AI service did not return a valid response."}));
      if(!response.ok)throw new Error(data.error || "Ask AI is temporarily unavailable.");
      draw(data);
    }catch(error){
      results.replaceChildren(node("div","ask-empty","Unable to show AI suggestions right now. You can still browse the published course catalogue."));
      const message=error?.name==="AbortError"?"AI search timed out. Please try again.":(error?.message||"Something went wrong.");
      showStatus(message,true);
      const link=node("a","ask-detail","Browse programmes →");
      link.href="search.html?country="+encodeURIComponent(payload.country)+"&degree="+encodeURIComponent(payload.degree);
      results.append(link);
    }finally{
      clearTimeout(timer);submit.disabled=false;submit.textContent="✨ Find suitable courses";
    }
  });
})();
