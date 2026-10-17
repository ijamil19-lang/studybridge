"use strict";
(() => {
  const $=id=>document.getElementById(id);
  const form=$("ask-form");
  if(!form)return;
  const submit=$("ask-submit"),followForm=$("ask-followup-form"),followSubmit=$("ask-followup-submit");
  const status=$("ask-status"),results=$("ask-results"),answer=$("ask-answer"),disclaimer=$("ask-disclaimer");
  const chat=$("ask-chat"),messages=$("ask-messages"),followInput=$("ask-followup");
  const API="https://fkhjpunzfugjcyxqulzm.supabase.co/functions/v1/ask-ai";
  const PUBLIC_KEY="sb_publishable_-fa_jUcsGTzjUFatez1adg_aN9rip7c";
  let original=null,history=[],priorIds=[],working=false;
  const node=(tag,cls,value)=>{
    const elem=document.createElement(tag);if(cls)elem.className=cls;
    if(value!==undefined)elem.textContent=String(value);
    return elem;
  };
  const showStatus=(message,error=false)=>{
    status.textContent=message;status.className=error?"ask-error":"";
  };
  const params=new URLSearchParams(location.search);
  for(const id of ["country","degree"]){
    const value=params.get(id);
    if(value&&[...$(id).options].some(opt=>opt.value===value))$(id).value=value;
  }
  const safeLink=value=>{
    try{const url=new URL(value);return url.protocol==="https:"?url.href:null}catch{return null}
  };
  const eligibility=value=>{
    if(value==="listed")return ["Listed as accepting international students","listed"];
    if(value==="restricted")return ["Restrictions recorded — check official criteria","restricted"];
    return ["International eligibility not yet confirmed","unconfirmed"];
  };
  function addMessage(role,text){
    const bubble=node("div","ask-message ask-message-"+role);
    bubble.append(node("span","ask-message-role",role==="user"?"You":"StudyBridge AI"));
    bubble.append(node("span","",text));
    messages.append(bubble);
    messages.scrollTop=messages.scrollHeight;
  }
  function clearConversation(clearResults=true){
    original=null;history=[];priorIds=[];chat.hidden=true;messages.replaceChildren();followInput.value="";
    answer.hidden=true;disclaimer.hidden=true;
    if(clearResults){
      results.replaceChildren(node("div","ask-empty","Tell us what you want to study to get new suggestions."));
      showStatus("Complete the form to see suggestions.");
    }
  }
  function draw(data){
    results.replaceChildren();
    answer.hidden=true;
    disclaimer.hidden=false;
    const matches=Array.isArray(data.matches)?data.matches:[];
    priorIds=matches.map(p=>Number(p.id)).filter(id=>Number.isSafeInteger(id)&&id>0);
    if(!matches.length){
      results.append(node("div","ask-empty","No close matches were found in the published catalogue. Ask a follow-up or try a different subject, country or degree level."));
      showStatus("No close matches from "+(Number(data.considered)||0)+" published courses.");
      return;
    }
    showStatus(matches.length+" suggested "+(matches.length===1?"programme":"programmes")+" from "+(Number(data.considered)||0)+" published courses.");
    for(const programme of matches){
      const card=node("article","ask-card"),top=node("div","ask-card-top");
      top.append(node("span","ask-degree",programme.degree||"Programme"));
      const [label,kind]=eligibility(programme.international_status);
      top.append(node("span","ask-eligibility ask-"+kind,label));
      card.append(top);
      card.append(node("h3","",programme.name||"Untitled programme"));
      card.append(node("p","ask-university",programme.university||"University not recorded"));
      if(programme.subject)card.append(node("p","ask-subject","Subject: "+programme.subject));
      if(programme.reason)card.append(node("p","ask-reason",programme.reason));
      const actions=node("div","ask-actions");
      if(Number.isSafeInteger(Number(programme.id))&&Number(programme.id)>0){
        const detail=node("a","ask-detail","View StudyBridge details →");
        detail.href="programme.html?id="+encodeURIComponent(programme.id);
        actions.append(detail);
      }
      const url=safeLink(programme.official_url);
      if(url){
        const official=node("a","ask-official","Official university course ↗");
        official.href=url;official.target="_blank";official.rel="noopener noreferrer";actions.append(official);
      }
      card.append(actions);results.append(card);
    }
  }
  const initialPayload=()=>({
    country:$("country").value,degree:$("degree").value,
    qualification:$("qualification").value.trim(),nationality:$("nationality").value.trim(),
    notes:$("notes").value.trim()
  });
  function busy(value){
    working=value;submit.disabled=value;followSubmit.disabled=value;
    submit.textContent=value?"Finding courses…":"✨ Find suitable courses";
    followSubmit.textContent=value?"Thinking…":"Send →";
  }
  async function request(payload,followup=false){
    if(working)return;
    busy(true);
    if(!followup){
      results.replaceChildren(node("div","ask-loading","Reviewing published courses in your selected country…"));
    }
    showStatus(followup?"Considering your follow-up…":"Searching and ranking suitable courses…");
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),38000);
    try{
      const response=await fetch(API,{
        method:"POST",headers:{"Content-Type":"application/json","apikey":PUBLIC_KEY},
        body:JSON.stringify(payload),signal:controller.signal
      });
      const data=await response.json().catch(()=>({error:"The AI service did not return a valid response."}));
      if(!response.ok)throw new Error(data.error||"Ask AI is temporarily unavailable.");
      if(!followup){clearConversation(false);original={...payload,base_question:payload.question};}
      const reply=data.answer||"Please review these courses and check official entry criteria.";
      chat.hidden=false;
      addMessage("user",payload.question);
      addMessage("assistant",reply);
      history.push({role:"user",content:payload.question},{role:"assistant",content:reply});
      history=history.slice(-8);
      draw(data);
      followInput.value="";
      if(followup)chat.scrollIntoView({behavior:"smooth",block:"start"});
    }catch(error){
      const msg=error?.name==="AbortError"?"AI search timed out. Please try again.":(error?.message||"Something went wrong.");
      showStatus(msg,true);
      if(!followup){
        results.replaceChildren(node("div","ask-empty","Unable to show suggestions right now. You can still browse the published catalogue."));
        const link=node("a","ask-detail","Browse programmes →");
        link.href="search.html?country="+encodeURIComponent(payload.country)+"&degree="+encodeURIComponent(payload.degree);
        results.append(link);
      }
    }finally{clearTimeout(timer);busy(false);}
  }
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if(!form.reportValidity()||working)return;
    const question=$("question").value.trim();
    if(question.length<8){showStatus("Describe the course you want in more detail.",true);return;}
    clearConversation(false);
    void request({...initialPayload(),question});
  });
  followForm.addEventListener("submit",event=>{
    event.preventDefault();
    if(!original||working||!followForm.reportValidity())return;
    const question=followInput.value.trim();
    if(question.length<8){showStatus("Please add a little more detail.",true);return;}
    const payload={
      ...original,question,
      base_question:original.base_question,
      history:history.slice(-8),
      previous_ids:priorIds.slice(0,5)
    };
    void request(payload,true);
  });
  $("ask-new-search").addEventListener("click",()=>{
    if(working)return;clearConversation();
    $("question").focus();
  });
  for(const id of ["country","degree"]){
    $(id).addEventListener("change",()=>{
      if(!working&&original)clearConversation();
    });
  }
})();
