"use strict";
const SUPABASE_URL='https://fkhjpunzfugjcyxqulzm.supabase.co';
const SUPABASE_KEY='sb_publishable_-fa_jUcsGTzjUFatez1adg_aN9rip7c';
const $=id=>document.getElementById(id);
const countryNames={SE:'Sweden',RO:'Romania',FI:'Finland',GB:'United Kingdom',UK:'United Kingdom',HU:'Hungary',CA:'Canada',US:'United States',LT:'Lithuania',IT:'Italy',ES:'Spain'};
const subjectGroups={computer:['computer','informatics','software','data science','artificial intelligence','information technology'],business:['business','management','marketing'],engineering:['engineering','technology','mechanical','electrical'],medicine:['medicine','medical','health','nursing','biomedicine'],accounting:['accounting','finance','financial'],economics:['economics','economic'],law:['law','legal'],education:['education','pedagogy','teaching'],architecture:['architecture','built environment'],arts:['art','design','music','film','dance','acting' ,'textile','ceramic','glass','photograph','illustrat','costume','animat','fashion','paint','draw','printmaking','craft','sculpt','interior','immersive media','creative media'],science:['biology','chemistry','physics','mathematics','environmental science'],social:['sociology','political science','criminology','social science']};
const text=(o,keys)=>String(keys.map(k=>o?.[k]).find(v=>v!==undefined&&v!==null&&String(v).trim())||'');
const country=c=>countryNames[c]||c||'Unknown country';
const cleanURL=value=>{try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
async function fetchTable(table,query='select=*&limit=1000',options={}){const response=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`,{headers:{apikey:SUPABASE_KEY},...options});if(!response.ok)throw new Error(`Database request failed (${response.status})`);return response.json()}
function addCard(root,{badge,title,lines,link,linkText}){const c=el('article','listing'),main=el('div');if(badge)main.append(el('span','pill',badge));main.append(el('h3','',title||'Untitled listing'));for(const line of lines){if(!line)continue;if(typeof line==='string'){main.append(el('p','',line));continue}if(line.text)main.append(el('p',line.className||'',line.text))}c.append(main);const url=cleanURL(link);if(url){const a=el('a','visit',linkText||'Official website ↗');a.href=url;if(new URL(url).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}c.append(a)}root.append(c)}
let rows=[],page=1;const perPage=12;let render=()=>{};
function paginate(filtered,draw){const root=$('results');root.replaceChildren();$('status').textContent=`${filtered.length} ${filtered.length===1?'result':'results'} found`;if(!filtered.length){root.append(el('div','empty','No matching listings found. Try different filters.'));$('pagination').replaceChildren();return}const pages=Math.ceil(filtered.length/perPage);page=Math.min(page,pages);filtered.slice((page-1)*perPage,page*perPage).forEach(draw);const p=$('pagination');p.replaceChildren();if(pages<2)return;const prev=el('button','','← Previous'),next=el('button','','Next →');prev.disabled=page===1;next.disabled=page===pages;prev.onclick=()=>{page--;render();window.scrollTo({top:220,behavior:'smooth'})};next.onclick=()=>{page++;render();window.scrollTo({top:220,behavior:'smooth'})};p.append(prev,el('span','',`Page ${page} of ${pages}`),next)}
function debounce(fn){let timer;return()=>{clearTimeout(timer);timer=setTimeout(()=>{page=1;fn()},220)}}
function bindInputs(ids){for(const id of ids)$(id).addEventListener(id==='q'?'input':'change',debounce(render))}
function readParams(){const p=new URLSearchParams(location.search);for(const id of ['q','country','degree','subject','international'])if($(id)&&p.has(id))$(id).value=p.get(id)}
// Page the public catalogue so records beyond the first 1,000 remain searchable.
async function fetchAllProgrammes(){
 const size=500,all=[];
 for(let offset=0;offset<50000;offset+=size){
  const query='select=id,name,degree_level,subject,field,programme_url,tuition_fee,tuition_currency,international_students,universities(name,country_code)&status=eq.active&order=name.asc,id.asc&limit='+size+'&offset='+offset;
  const batch=await fetchTable('programmes',query);
  if(!Array.isArray(batch))throw new Error('Unexpected programmes response');
  all.push(...batch);
  if(batch.length<size)return all;
 }
 throw new Error('Programme catalogue exceeded the current safety limit');
}
function internationalEligibility(value){
 if(value===true)return {
  kind:'listed',
  label:'Listed as accepting international applicants',
  listText:'International students: listed as accepting applications (check university eligibility)',
  explanation:'This programme is recorded as accepting international applicants. Your eligibility may depend on nationality, qualifications, English-language evidence, intake and visa requirements. Confirm with the university.'
 };
 if(value===false)return {
  kind:'restricted',
  label:'International applicant restrictions recorded',
  listText:'International students: restrictions reported (check university)',
  explanation:'This programme is not currently recorded as generally accepting international applicants. Exceptions and requirements may apply; verify directly with the university.'
 };
 return {
  kind:'unconfirmed',
  label:'International student eligibility not yet confirmed',
  listText:'International students: eligibility not yet confirmed',
  explanation:'There is not enough confirmed information to state whether this programme accepts international applications. Ask the university about your nationality, entry qualifications and visa requirements.'
 };
}
function courseDetails(r){
 const info=[
  {text:r.universities?.name||'University not recorded',className:'course-university'},
  {text:r.subject||r.field||'Subject not recorded',className:'course-subject'}
 ];
 const fee=Number(r.tuition_fee);
 if(r.tuition_fee!==null&&r.tuition_fee!==undefined&&Number.isFinite(fee)&&fee>0){
  const currency=String(r.tuition_currency||'').trim();
  info.push({text:'Listed tuition: '+(currency?currency+' ':'')+fee.toLocaleString('en-GB',{maximumFractionDigits:2})+' (confirm applicant fee category)',className:'course-tuition course-tuition-known'});
 }else{
  info.push({text:'Tuition fees: not yet confirmed — check official university website',className:'course-tuition course-tuition-unknown'});
 }
 const eligibility=internationalEligibility(r.international_students);
 info.push({text:eligibility.listText,className:'course-international course-international-'+eligibility.kind});
 return info;
}

/* Programme cards are intentionally distinct from generic university/opportunity cards. */
function addProgrammeCard(root,r){
 const card=el('article','listing programme-card');
 const body=el('div','programme-card-body');
 const tags=el('div','programme-card-tags');
 tags.append(el('span','pill programme-country',country(r.universities?.country_code)));
 tags.append(el('span','pill programme-level',r.degree_level||'Programme'));
 body.append(tags);
 body.append(el('h3','programme-card-title',r.name||'Untitled programme'));
 body.append(el('p','programme-card-university',r.universities?.name||'University not recorded'));
 const subject=r.subject||r.field;
 if(subject)body.append(el('p','programme-card-subject',subject));
 const facts=el('div','programme-card-facts');
 const tuition=el('div','programme-card-fact tuition-fact');
 const fee=Number(r.tuition_fee);
 const recorded=r.tuition_fee!==null&&r.tuition_fee!==undefined&&Number.isFinite(fee)&&fee>0;
 tuition.classList.add(recorded?'tuition-recorded':'tuition-unconfirmed');
 tuition.append(el('span','fact-label','Tuition fee'));
 if(recorded){
  const currency=String(r.tuition_currency||'').trim();
  tuition.append(el('strong','fact-value',(currency?currency+' ':'')+fee.toLocaleString('en-GB',{maximumFractionDigits:2})));
  tuition.append(el('span','fact-help','Listed amount · confirm fee category and year'));
 }else{
  tuition.append(el('strong','fact-value','Not yet confirmed'));
  tuition.append(el('span','fact-help','Check the official university website'));
 }
 const eligibility=internationalEligibility(r.international_students);
 const intl=el('div','programme-card-fact eligibility-fact');
 intl.classList.add('eligibility-'+eligibility.kind);
 intl.append(el('span','fact-label','International applicants'));
 const status=eligibility.kind==='listed'?'Listed as accepting applications':
  eligibility.kind==='restricted'?'Restrictions recorded':'Status not yet confirmed';
 intl.append(el('strong','fact-value',status));
 intl.append(el('span','fact-help',eligibility.kind==='listed'?'Individual eligibility must be checked':
  eligibility.kind==='restricted'?'Check for exceptions with the university':'Confirm your nationality and course requirements'));
 facts.append(tuition,intl);
 body.append(facts);
 card.append(body);
 const footer=el('div','programme-card-footer');
 footer.append(el('p','programme-card-caution','Always confirm fees, entry requirements and deadlines with the university.'));
 const a=el('a','visit','View programme details →');
 a.href='programme.html?id='+encodeURIComponent(r.id);
 footer.append(a);card.append(footer);root.append(card);
}
function renderProgrammeFilterChips(){
 const wrap=$('active-filters');
 if(!wrap)return;
 wrap.replaceChildren();
 const chosen=[
  {id:'q',name:'Keyword'},
  {id:'country',name:'Country'},
  {id:'degree',name:'Degree'},
  {id:'subject',name:'Subject'},
  {id:'international',name:'International'}
 ].filter(x=>x.id==='q'?$('q').value.trim():$(x.id).value!=='all');
 wrap.hidden=chosen.length===0;
 if(!chosen.length)return;
 wrap.append(el('span','filter-chip-caption','Active filters:'));
 for(const item of chosen){
  const input=$(item.id);
  const value=item.id==='q'?input.value.trim():input.selectedOptions?.[0]?.textContent||input.value;
  const btn=el('button','filter-chip',item.name+': '+value+' ×');
  btn.type='button';
  btn.setAttribute('aria-label','Remove '+item.name+' filter');
  btn.onclick=()=>{
   input.value=item.id==='q'?'':'all';
   page=1;render();
  };
  wrap.append(btn);
 }
 const clear=el('button','filter-chip-clear','Clear all');
 clear.type='button';
 clear.onclick=()=>{$('reset').click()};
 wrap.append(clear);
}

function setupSearch(){readParams();render=()=>{const q=$('q').value.trim().toLowerCase(),ct=$('country').value,d=$('degree').value,s=$('subject').value,international=$('international').value;const filtered=rows.filter(r=>{const u=r.universities||{};if(ct!=='all'&&u.country_code!==ct)return false;if(d!=='all'&&r.degree_level!==d)return false;if(international==='listed'&&r.international_students!==true)return false;if(international==='restricted'&&r.international_students!==false)return false;if(international==='unconfirmed'&&r.international_students!=null)return false;const words=[r.name,r.subject,r.field,u.name].filter(Boolean).join(' ').toLowerCase();if(!words.includes(q))return false;if(s==='all')return true;const relevant=[r.name,r.subject,r.field].filter(Boolean).join(' ').toLowerCase();const match=k=>new RegExp('(^|[^a-z])'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z]|$)','i').test(relevant);const keywords=subjectGroups[s]||[];return s==='other'?!Object.values(subjectGroups).flat().some(match):keywords.some(match)});if($('sort').value==='university')filtered.sort((a,b)=>(a.universities?.name||'').localeCompare(b.universities?.name||''));renderProgrammeFilterChips();paginate(filtered,r=>addProgrammeCard($('results'),r))};bindInputs(['q','country','degree','subject','international','sort']);$('reset').onclick=()=>{$('q').value='';$('country').value='all';$('degree').value='all';$('subject').value='all';$('international').value='all';page=1;render()};fetchAllProgrammes().then(data=>{rows=data;render()}).catch(e=>{$('status').textContent=e.message;$('results').append(el('div','empty','Unable to load programmes. Check database permissions and try refreshing.'))})}
function setupUniversities(){readParams();render=()=>{const q=$('q').value.trim().toLowerCase(),ct=$('country').value;const filtered=rows.filter(r=>(ct==='all'||r.country_code===ct)&&[r.name,r.city,country(r.country_code)].join(' ').toLowerCase().includes(q));paginate(filtered,r=>addCard($('results'),{badge:country(r.country_code),title:r.name,lines:[r.city,r.description?.slice(0,190)],link:r.website_url||r.admissions_url}))};bindInputs(['q','country']);$('reset').onclick=()=>{$('q').value='';$('country').value='all';page=1;render()};fetchTable('universities','select=*&order=name.asc&limit=1000').then(data=>{rows=data;render()}).catch(e=>{$('status').textContent=e.message;$('results').append(el('div','empty','Unable to load universities. Check database permissions and try refreshing.'))})}
const config={scholarships:{name:'Scholarships',table:'scholarships',title:['name','title','scholarship_name'],badge:['type','funding_type','degree_level'],details:[['provider','organization','university_name'],['deadline','application_deadline','closing_date'],['description','eligibility']],links:['scholarship_url','official_url','website_url','application_url','url']},admissions:{name:'Admissions & deadlines',table:'admissions',title:['programme_name','name','title','intake'],badge:['intake','academic_year','status'],details:[['university_name','university','institution'],['application_deadline','deadline','closing_date'],['degree_level','requirements','description']],links:['admissions_url','application_url','official_url','source_url','url']},phd:{name:'PhD research positions',table:'phd_positions',title:['title','position_title','name','research_area'],badge:['research_area','field','status'],details:[['university_name','university','department'],['deadline','application_deadline','closing_date'],['description','funding']],links:['position_url','application_url','official_url','source_url','url']}};
function setupOpportunities(){const kind=new URLSearchParams(location.search).get('type')||document.body.dataset.opportunityType;const c=config[kind]||config.scholarships;$('heading').textContent=c.name;$('subheading').textContent=c.name;document.title=`${c.name} | StudyBridge`;render=()=>{const q=$('q').value.trim().toLowerCase();const filtered=rows.filter(r=>Object.values(r).filter(v=>typeof v==='string'||typeof v==='number').join(' ').toLowerCase().includes(q));paginate(filtered,r=>addCard($('results'),{badge:text(r,c.badge)||c.name,title:text(r,c.title)||'Opportunity',lines:c.details.map(keys=>text(r,keys)).filter(Boolean).map(v=>v.slice(0,190)),link:text(r,c.links)}))};bindInputs(['q']);$('reset').onclick=()=>{$('q').value='';page=1;render()};fetchTable(c.table).then(data=>{rows=data;render()}).catch(e=>{$('status').textContent=e.message;$('results').append(el('div','empty','Unable to load these listings. They may not be publicly accessible yet.'))})}

function showProgrammeStatus(message){
 $('programme-status').textContent=message;
 $('programme-detail').setAttribute('aria-busy','false');
}
function setOfficialLink(id,url){
 const a=$(id),clean=cleanURL(url);
 if(clean){a.href=clean;a.hidden=false}else{a.hidden=true;a.removeAttribute('href')}
}
function formatProgrammeText(value,fallback){
 const raw=String(value??'').trim();
 if(!raw)return fallback;
 // Remove source citation markup accidentally persisted as field text.
 return raw.replace(/\s*\(\[[^\]]+\]\(https?:\/\/[^)]+\)\)/g,'').trim()||fallback;
}
function detailFact(root,label,value){
 const dt=el('dt','',label),dd=el('dd','',value);
 root.append(dt,dd);
}

/* Supplementary course-specific admissions and country-level scholarship leads.
   These sections never assert that funding or an application window is currently available. */
async function fetchProgrammeExtra(table,query){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),12000);
 try{return await fetchTable(table,query,{signal:controller.signal})}
 finally{clearTimeout(timer)}
}
function reportedDate(value){
 const v=String(value||'');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return 'Not recorded';
 const d=new Date(v+'T00:00:00Z');
 return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
}
function reviewedDate(value){
 if(!value)return 'Not recorded';
 const d=new Date(value);
 return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
}
function recordLine(parent,description){
 if(description)parent.append(el('p','programme-record-detail',description));
}
function recordLink(parent,url,label){
 const safe=cleanURL(url);
 if(!safe)return;
 const link=el('a','programme-record-link',label);
 link.href=safe;
 link.target='_blank';
 link.rel='noopener noreferrer';
 parent.append(link);
}
async function loadProgrammeAdmissions(programmeId){
 const root=$('programme-admission-records');
 if(!root)return;
 try{
  const query='select=id,intake,academic_year,application_open,application_deadline,international_deadline,application_url,status,last_verified&programme_id=eq.'+encodeURIComponent(programmeId)+'&order=application_deadline.desc.nullslast&limit=30';
  const records=await fetchProgrammeExtra('admissions',query);
  root.replaceChildren();
  if(!Array.isArray(records)||records.length===0){
   root.append(el('p','programme-record-empty','No programme-specific admission dates are recorded yet. Check the official university application page for the next intake.'));
   return;
  }
  const today=new Date().toISOString().slice(0,10);
  const current=records.filter(a=>a.status!=='closed'&&(!a.application_deadline||a.application_deadline>=today));
  const old=records.filter(a=>!current.includes(a));
  const show=[...current.slice(0,3),...old.slice(0,Math.max(0,3-current.length))];
  for(const item of show){
   const card=el('article','programme-record');
   card.append(el('h3','',item.intake||item.academic_year||'Reported application session'));
   const deadline=String(item.application_deadline||'');
   let status='Application status not confirmed; check the university.';
   if(deadline&&deadline<today)status='Historical deadline (already passed) — not currently open.';
   else if(item.status==='closed')status='Recorded as closed; check for a new cycle.';
   else if(deadline)status='Future date in the database; opening status must be confirmed.';
   recordLine(card,status);
   recordLine(card,'Application deadline: '+reportedDate(item.application_deadline));
   if(item.international_deadline)recordLine(card,'International deadline: '+reportedDate(item.international_deadline));
   if(item.application_open)recordLine(card,'Reported opening date: '+reportedDate(item.application_open));
   if(item.academic_year)recordLine(card,'Academic year: '+item.academic_year);
   recordLine(card,'Last checked: '+reviewedDate(item.last_verified));
   recordLink(card,item.application_url,'Open university admissions information ↗');
   root.append(card);
  }
  if(records.length>show.length)root.append(el('p','programme-smallprint','Showing '+show.length+' of '+records.length+' recorded application sessions. Check the university for other dates.'));
 }catch(error){
  root.replaceChildren(el('p','programme-record-empty','Admission records could not be loaded. Please use the official university application link.'));
 }
}
async function loadProgrammeScholarships(code,level){
 const root=$('programme-scholarship-records');
 if(!root)return;
 if(!/^[A-Z]{2}$/.test(String(code||''))){
  root.replaceChildren(el('p','programme-record-empty','Scholarship opportunities cannot be matched without a confirmed study destination.'));
  return;
 }
 try{
  const countries=await fetchProgrammeExtra('countries','select=id&code=eq.'+encodeURIComponent(code)+'&limit=1');
  if(!Array.isArray(countries)||!countries.length)throw Error('No linked country');
  const query='select=id,name,provider,degree_level,funding_type,deadline,status,last_verified,official_url&country_id=eq.'+countries[0].id+'&order=deadline.asc.nullslast&limit=100';
  const results=await fetchProgrammeExtra('scholarships',query);
  const today=new Date().toISOString().slice(0,10);
  // Exact reported degree category, rather than guessing that "Other" means all degrees.
  const matches=(Array.isArray(results)?results:[]).filter(s=>
   s.degree_level===level&&s.status!=='closed'&&(!s.deadline||s.deadline>=today)&&cleanURL(s.official_url)
  ).slice(0,4);
  root.replaceChildren();
  if(!matches.length){
   root.append(el('p','programme-record-empty','No non-expired scholarship leads are currently listed for this destination and degree category. This does not mean that no funding exists.'));
   return;
  }
  for(const item of matches){
   const card=el('article','programme-record');
   card.append(el('h3','',item.name||'Scholarship opportunity'));
   if(item.provider)recordLine(card,'Provider: '+item.provider);
   if(item.funding_type)recordLine(card,'Reported funding: '+item.funding_type);
   recordLine(card,'Recorded deadline: '+reportedDate(item.deadline));
   recordLine(card,'Last checked: '+reviewedDate(item.last_verified));
   recordLine(card,'University/course and applicant eligibility are not verified for this programme.');
   recordLink(card,item.official_url,'Check official scholarship criteria ↗');
   root.append(card);
  }
 }catch(error){
  root.replaceChildren(el('p','programme-record-empty','Scholarship listings could not be loaded. Please browse the full scholarship list.'));
 }
}

async function setupProgrammeDetail(){
 const id=new URLSearchParams(location.search).get('id');
 if(!id||!/^[1-9]\d{0,14}$/.test(id)){
  $('programme-title').textContent='Programme not found';
  showProgrammeStatus('Invalid course link. Return to programme search and choose a course.');
  return;
 }
 try{
  const query='select=id,name,degree_level,subject,field,description,duration,study_mode,language,tuition_fee,tuition_currency,international_students,programme_url,application_url,last_verified,universities(name,city,country_code,website_url,admissions_url)&status=eq.active&id=eq.'+encodeURIComponent(id)+'&limit=1';
  // Avoid leaving course pages in a loading state if the data service stalls.
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  let items;
  try{items=await fetchTable('programmes',query,{signal:controller.signal})}
  finally{clearTimeout(timeout)}
  const r=items?.[0];
  if(!r){
   $('programme-title').textContent='Programme not found';
   showProgrammeStatus('This programme is unavailable or no longer publicly listed.');
   return;
  }
  const u=r.universities||{};
  $('programme-title').textContent=r.name||'Study programme';
  $('programme-label').textContent=(r.degree_level||'Programme')+' · '+country(u.country_code);
  $('programme-university').textContent=[u.name,u.city].filter(Boolean).join(' · ');
  document.title=(r.name||'Programme details')+' | StudyBridge';
  $('programme-description').textContent=formatProgrammeText(r.description,'Visit the official university course page for a detailed course description.');
  const facts=$('programme-facts');
  detailFact(facts,'Qualification',r.degree_level||'Check university website');
  detailFact(facts,'Subject',r.subject||r.field||'Check university website');
  detailFact(facts,'Duration',formatProgrammeText(r.duration,'Check official university website'));
  detailFact(facts,'Study mode',formatProgrammeText(r.study_mode,'Check official university website'));
  detailFact(facts,'Teaching language',r.language||'Check official university website');
  const fee=Number(r.tuition_fee);
  const feeValue=r.tuition_fee!==null&&r.tuition_fee!==undefined&&Number.isFinite(fee)&&fee>0
   ?(String(r.tuition_currency||'').trim()+' '+fee.toLocaleString('en-GB',{maximumFractionDigits:2})).trim()+' (confirm fee category and year)'
   :'Check official university website; no confirmed fee is listed';
  detailFact(facts,'Tuition fees',feeValue);
  const eligibility=internationalEligibility(r.international_students);
  const eligibilityLabel=$('programme-international-status');
  eligibilityLabel.textContent=eligibility.label;
  eligibilityLabel.className='eligibility-status eligibility-'+eligibility.kind;
  $('programme-international').textContent=eligibility.explanation;
  const reviewed=r.last_verified?new Date(r.last_verified):null;
  if(reviewed&&!Number.isNaN(reviewed.getTime())){
   $('programme-verified').textContent='StudyBridge record last checked: '+reviewed.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})+'. Details may have changed.';
  }
  setOfficialLink('programme-official',r.programme_url);
  setOfficialLink('programme-apply',r.application_url||u.admissions_url);
  setOfficialLink('programme-university-site',u.website_url);
  $('programme-content').hidden=false;
  $('programme-sidebar').hidden=false;
  $('programme-status').textContent='';
  $('programme-detail').setAttribute('aria-busy','false');
  // Secondary panels can fail independently without hiding the main programme details.
  void loadProgrammeAdmissions(r.id);
  void loadProgrammeScholarships(u.country_code,r.degree_level);
 }catch(error){
  $('programme-title').textContent='Unable to load programme';
  showProgrammeStatus('Programme information could not be loaded. Refresh the page, or use programme search to open another course.');
 }
}

const menu=$('menu');if(menu)menu.onclick=()=>{const n=$('nav');const open=n.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))};
if($('results')){if(location.pathname.endsWith('search.html'))setupSearch();else if(location.pathname.endsWith('universities.html'))setupUniversities();else setupOpportunities()}

if($('programme-detail'))setupProgrammeDetail();
