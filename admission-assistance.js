"use strict";
(() => {
 const form=document.getElementById('admission-enquiry-form');
 if(!form)return;
 const status=document.getElementById('admission-form-status');
 const submit=document.getElementById('admission-submit');
 const endpoint='https://fkhjpunzfugjcyxqulzm.supabase.co/functions/v1/admission-enquiry';
 const publicKey='sb_publishable_-fa_jUcsGTzjUFatez1adg_aN9rip7c';
 const params=new URLSearchParams(location.search);
 const programmeId=params.get('programme_id');
 if(programmeId&&/^[1-9]\d{0,14}$/.test(programmeId)){
  const hidden=document.createElement('input');hidden.type='hidden';hidden.name='programme_id';hidden.value=programmeId;form.append(hidden);
 }
 const source=document.createElement('input');source.type='hidden';source.name='source_url';source.value=location.href;form.append(source);
 const setStatus=(message,kind)=>{status.textContent=message;status.className='admission-form-status '+(kind||'');};
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  setStatus('');
  if(!form.reportValidity())return;
  const countries=[...form.querySelectorAll('input[name="preferred_countries"]:checked')].map(x=>x.value);
  if(countries.length>5){setStatus('Please select no more than five preferred countries.','error');return;}
  const data=Object.fromEntries(new FormData(form).entries());
  data.preferred_countries=countries;
  data.scholarship_required=data.scholarship_required==='yes'||data.scholarship_required==='maybe';
  data.consent_to_contact=form.elements.consent_to_contact.checked;
  if(!data.annual_budget)data.annual_budget=null;
  submit.disabled=true;submit.textContent='Submitting…';form.setAttribute('aria-busy','true');
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':publicKey},body:JSON.stringify(data)});
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(result.error||'We could not submit your enquiry. Please try again.');
   form.reset();
   if(programmeId){const hidden=form.querySelector('input[name="programme_id"]');if(hidden)hidden.value=programmeId;}
   source.value=location.href;
   if(result.notification_sent){setStatus('Thank you. Your admission enquiry has been received and our team has been notified. We will contact you using the details provided.','success');}\n   else{setStatus('Your enquiry has been saved, but email alerts are not configured yet. We are completing the notification setup.','error');}
   form.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(error){
   setStatus(error.message||'Something went wrong. Please try again later.','error');
  }finally{
   submit.disabled=false;submit.textContent='Submit my enquiry →';form.removeAttribute('aria-busy');
  }
 });
})();
