"use strict";
const SUPABASE_URL='https://fkhjpunzfugjcyxqulzm.supabase.co';
const SUPABASE_KEY='sb_publishable_-fa_jUcsGTzjUFatez1adg_aN9rip7c';
const $=id=>document.getElementById(id);
function elem(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function safeUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null;}}
function feeInfo(r){if(r.fee_status==='within_budget_verified')return 'Annual international tuition: verified within your GBP budget.';if(r.fee_status==='above_budget_verified')return 'Annual international tuition: above your budget.';if(r.tuition_fee!==null&&r.tuition_fee!==undefined)return 'Listed fee: '+Number(r.tuition_fee).toLocaleString('en-GB')+' '+(r.tuition_currency||'')+' — international annual fee/budget comparison NOT verified.';return 'International tuition: not confirmed.';}
function draw(r,root){const card=elem('article','match-result');card.append(elem('span','match-pill','Possible subject match · '+(r.destination||'Country unconfirmed')));card.append(elem('h3','',r.programme_name||'Programme'));card.append(elem('p','',r.university_name||'University'));card.append(elem('p','',feeInfo(r)));const detail=elem('p','match-warning',r.qualification_status==='verified_eligible'?'Qualification accepted according to a recorded official source; additional requirements may apply.':r.qualification_status==='conditional'?'Qualification may be accepted under specific conditions; check the source.':'Your qualification eligibility: not verified for this programme.');card.append(detail);if(r.match_explanation&&r.qualification_status==='conditional')card.append(elem('p','match-note',r.match_explanation));card.append(elem('p','match-note','International applicants: '+(r.international_students===true?'General pathway recorded; check your individual eligibility.':'Not confirmed for this programme.')+' No guaranteed admission or confirmed open intake.'));const url=safeUrl(r.programme_url);if(url){const a=elem('a','','Check official programme information ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}else card.append(elem('p','match-note','Individual programme link not yet verified.'));root.append(card);}

const qualificationOptions={
 Pakistan:['FSc / Higher Secondary','FA / Higher Secondary','ICS / Higher Secondary','A Levels','International Baccalaureate','Matric / SSC'],
 India:['CBSE Class 12','ISC Class 12','State Board Class 12','NIOS Senior Secondary','A Levels','International Baccalaureate'],
 Nigeria:['WAEC / WASSCE','NECO SSCE','NABTEB','A Levels','International Baccalaureate'],
 Bangladesh:['HSC / Higher Secondary','Alim','A Levels','International Baccalaureate'],
 'United Kingdom':['A Levels','BTEC Level 3','T Levels','Scottish Highers','Scottish Advanced Highers','International Baccalaureate'],
 'United States':['High School Diploma','GED','Associate Degree','International Baccalaureate'],
 Canada:['Provincial High School Diploma','CEGEP Diploma','International Baccalaureate'],
 Ghana:['WASSCE','SSSCE','A Levels','International Baccalaureate'],
 Kenya:['KCSE','A Levels','International Baccalaureate'],
 Nepal:['NEB Grade 12','A Levels','International Baccalaureate'],
 'Sri Lanka':['GCE Advanced Level','International Baccalaureate'],
 'United Arab Emirates':['UAE Grade 12 / Thanawiya Amma','A Levels','CBSE Class 12','International Baccalaureate'],
 'Saudi Arabia':['General Secondary Education Certificate','International Baccalaureate','A Levels'],
 China:['Senior High School Graduation Diploma','Gaokao','International Baccalaureate','A Levels']
};
const commonQualifications=['National secondary school qualification','A Levels','International Baccalaureate','Bachelor’s Degree','Master’s Degree'];
function refreshQualifications(){
 const list=$('match-qualification'),current=list.value;
 const values=[...new Set([...(qualificationOptions[$('match-country').value]||[]),...commonQualifications])];
 list.replaceChildren();
 for(const value of values){const option=elem('option','',value);option.value=value;list.append(option);}
 const other=elem('option','','Other — enter manually');other.value='__other__';list.append(other);
 list.value=values.includes(current)?current:values[0];
 syncCustomQualification();
}
function syncCustomQualification(){const custom=$('match-qualification').value==='__other__';$('match-custom-label').hidden=!custom;$('match-custom').required=custom;}
$('match-country').addEventListener('change',refreshQualifications);
$('match-qualification').addEventListener('change',syncCustomQualification);
refreshQualifications();

async function search(){const status=$('match-status'),root=$('match-results');root.replaceChildren();status.textContent='Searching the live catalogue…';const body={p_subject:$('match-subject').value,p_degree:$('match-degree').value,p_country:$('match-country').value,p_qualification:$('match-qualification').value==='__other__'?$('match-custom').value.trim():$('match-qualification').value,p_budget_gbp:Number($('match-budget').value),p_limit:30};try{const res=await fetch(SUPABASE_URL+'/rest/v1/rpc/smart_match_programmes',{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!res.ok)throw new Error('Request failed: '+res.status);const results=await res.json();if(!Array.isArray(results))throw new Error('Unexpected response');status.textContent=results.length+' possible subject matches · none are guaranteed admissions.';if(!results.length){root.append(elem('p','match-warning','No matching catalogue entries. Try another subject or degree.'));return;}results.forEach(x=>draw(x,root));}catch(e){status.textContent='Unable to load matches right now.';root.append(elem('p','match-warning','Please try again later or use the programme search page.'));console.error(e);}}
$('match-form').addEventListener('submit',e=>{e.preventDefault();search();});search();