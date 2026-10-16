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
function addCard(root,{badge,title,lines,link,linkText}){const c=el('article','listing'),main=el('div');if(badge)main.append(el('span','pill',badge));main.append(el('h3','',title||'Untitled listing'));for(const line of lines){if(line)main.append(el('p','',line))}c.append(main);const url=cleanURL(link);if(url){const a=el('a','visit',linkText||'Official website ↗');a.href=url;if(new URL(url).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}c.append(a)}root.append(c)}
let rows=[],page=1;const perPage=12;let render=()=>{};
function paginate(filtered,draw){const root=$('results');root.replaceChildren();$('status').textContent=`${filtered.length} ${filtered.length===1?'result':'results'} found`;if(!filtered.length){root.append(el('div','empty','No matching listings found. Try different filters.'));$('pagination').replaceChildren();return}const pages=Math.ceil(filtered.length/perPage);page=Math.min(page,pages);filtered.slice((page-1)*perPage,page*perPage).forEach(draw);const p=$('pagination');p.replaceChildren();if(pages<2)return;const prev=el('button','','← Previous'),next=el('button','','Next →');prev.disabled=page===1;next.disabled=page===pages;prev.onclick=()=>{page--;render();window.scrollTo({top:220,behavior:'smooth'})};next.onclick=()=>{page++;render();window.scrollTo({top:220,behavior:'smooth'})};p.append(prev,el('span','',`Page ${page} of ${pages}`),next)}
function debounce(fn){let timer;return()=>{clearTimeout(timer);timer=setTimeout(()=>{page=1;fn()},220)}}
function bindInputs(ids){for(const id of ids)$(id).addEventListener(id==='q'?'input':'change',debounce(render))}
function readParams(){const p=new URLSearchParams(location.search);for(const id of ['q','country','degree','subject'])if($(id)&&p.has(id))$(id).value=p.get(id)}
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
function courseDetails(r){
 const info=[r.universities?.name,r.subject||r.field];
 const fee=Number(r.tuition_fee);
 if(r.tuition_fee!==null&&r.tuition_fee!==undefined&&Number.isFinite(fee)&&fee>0){
  const currency=String(r.tuition_currency||'').trim();
  info.push('Listed tuition: '+(currency?currency+' ':'')+fee.toLocaleString('en-GB',{maximumFractionDigits:2})+' (confirm applicant fee category)');
 }else{
  info.push('Tuition fees: check official university website');
 }
 if(r.international_students===true){
  info.push('International applicants: check programme entry requirements');
 }else if(r.international_students===false){
  info.push('International applicants: confirm restrictions with university');
 }else{
  info.push('International eligibility: not yet confirmed');
 }
 return info;
}
function setupSearch(){readParams();render=()=>{const q=$('q').value.trim().toLowerCase(),ct=$('country').value,d=$('degree').value,s=$('subject').value;const filtered=rows.filter(r=>{const u=r.universities||{};if(ct!=='all'&&u.country_code!==ct)return false;if(d!=='all'&&r.degree_level!==d)return false;const words=[r.name,r.subject,r.field,u.name].filter(Boolean).join(' ').toLowerCase();if(!words.includes(q))return false;if(s==='all')return true;const relevant=[r.name,r.subject,r.field].filter(Boolean).join(' ').toLowerCase();const match=k=>new RegExp('(^|[^a-z])'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z]|$)','i').test(relevant);const keywords=subjectGroups[s]||[];return s==='other'?!Object.values(subjectGroups).flat().some(match):keywords.some(match)});if($('sort').value==='university')filtered.sort((a,b)=>(a.universities?.name||'').localeCompare(b.universities?.name||''));paginate(filtered,r=>addCard($('results'),{badge:`${country(r.universities?.country_code)} · ${r.degree_level||'Programme'}`,title:r.name,lines:courseDetails(r),link:'programme.html?id='+encodeURIComponent(r.id),linkText:'View programme details →'}))};bindInputs(['q','country','degree','subject','sort']);$('reset').onclick=()=>{$('q').value='';$('country').value='all';$('degree').value='all';$('subject').value='all';page=1;render()};fetchAllProgrammes().then(data=>{rows=data;render()}).catch(e=>{$('status').textContent=e.message;$('results').append(el('div','empty','Unable to load programmes. Check database permissions and try refreshing.'))})}
function setupUniversities(){readParams();render=()=>{const q=$('q').value.trim().toLowerCase(),ct=$('country').value;const filtered=rows.filter(r=>(ct==='all'||r.country_code===ct)&&[r.name,r.city,country(r.country_code)].join(' ').toLowerCase().includes(q));paginate(filtered,r=>addCard($('results'),{badge:country(r.country_code),title:r.name,lines:[r.city,r.description?.slice(0,190)],link:r.website_url||r.admissions_url}))};bindInputs(['q','country']);$('reset').onclick=()=>{$('q').value='';$('country').value='all';page=1;render()};fetchTable('universities','select=*&order=name.asc&limit=1000').then(data=>{rows=data;render()}).catch(e=>{$('status').textContent=e.message;$('results').append(el('div','empty','Unable to load universities. Check database permissions and try refreshing.'))})}
const config={scholarships:{name:'Scholarships',table:'scholarships',title:['name','title','scholarship_name'],badge:['type','funding_type','degree_level'],details:[['provider','organization','university_name'],['deadline','application_deadline','closing_date'],['description','eligibility']],links:['scholarship_url','official_url','website_url','application_url','url']},admissions:{name:'Admissions & deadlines',table:'admissions',title:['programme_name','name','title','intake'],badge:['intake','academic_year','status'],details:[['university_name','university','institution'],['application_deadline','deadline','closing_date'],['degree_level','requirements','description']],links:['admissions_url','application_url','official_url','source_url','url']},phd:{name:'PhD research positions',table:'phd_positions',title:['title','position_title','name','research_area'],badge:['research_area','field','status'],details:[['university_name','university','department'],['deadline','application_deadline','closing_date'],['description','funding']],links:['position_url','application_url','official_url','source_url','url']}};
function setupOpportunities(){const kind=new URLSearchParams(location.search).get('type');const c=config[kind]||config.scholarships;$('heading').textContent=c.name;$('subheading').textContent=c.name;document.title=`${c.name} | StudyBridge`;render=()=>{const q=$('q').value.trim().toLowerCase();const filtered=rows.filter(r=>Object.values(r).filter(v=>typeof v==='string'||typeof v==='number').join(' ').toLowerCase().includes(q));paginate(filtered,r=>addCard($('results'),{badge:text(r,c.badge)||c.name,title:text(r,c.title)||'Opportunity',lines:c.details.map(keys=>text(r,keys)).filter(Boolean).map(v=>v.slice(0,190)),link:text(r,c.links)}))};bindInputs(['q']);$('reset').onclick=()=>{$('q').value='';page=1;render()};fetchTable(c.table).then(data=>{rows=data;render()}).catch(e=>{$('status').textContent=e.message;$('results').append(el('div','empty','Unable to load these listings. They may not be publicly accessible yet.'))})}

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
  $('programme-international').textContent=r.international_students===true
   ?'International applications may be considered. Confirm eligibility and visa requirements with the university.'
   :r.international_students===false
    ?'International student eligibility may be restricted. Confirm directly with the university.'
    :'International student eligibility has not been confirmed for this programme.';
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
 }catch(error){
  $('programme-title').textContent='Unable to load programme';
  showProgrammeStatus('Programme information could not be loaded. Refresh the page, or use programme search to open another course.');
 }
}

const menu=$('menu');if(menu)menu.onclick=()=>{const n=$('nav');const open=n.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))};
if($('results')){if(location.pathname.endsWith('search.html'))setupSearch();else if(location.pathname.endsWith('universities.html'))setupUniversities();else setupOpportunities()}

if($('programme-detail'))setupProgrammeDetail();
