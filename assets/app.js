
let DATA=null, marks=JSON.parse(localStorage.lunyuMarks||"[]");
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function nl(s){return esc(s).replace(/\n/g,"<br>")}
function labelFor(id){const e=DATA.entries.find(x=>x.id===id);if(!e)return id;const b=DATA.books.find(x=>x.key===e.book_key);return `${b.title}・第${e.number}${b.unit}`}
function renderTOC(){ $("#toc").innerHTML=DATA.books.map(b=>`<details><summary>${b.title}・${b.count}${b.unit}</summary>${DATA.entries.filter(e=>e.book_key===b.key).map(e=>`<a href="#${e.id}">${b.title}・第${e.number}${b.unit}</a>`).join("")}</details>`).join(""); }
function teachingBlock(e){
  if(!e.xiantian&&!e.story&&!e.practice)return `<section class="teaching-pending"><div class="label">教學延伸</div><p>本章的「先天解、故事引導、修辦應用」尚待編寫。</p></section>`;
  return `${e.xiantian?`<details class="block xiantian teaching" open><summary>先天解 <small>現代修辦延伸</small></summary><div class="teaching-body">${nl(e.xiantian)}</div></details>`:""}${e.story?`<details class="block story teaching" open><summary>故事引導${e.story_title?`：${esc(e.story_title)}`:""}</summary><div class="teaching-body">${nl(e.story)}</div></details>`:""}${e.practice?`<details class="block practice teaching" open><summary>修辦應用</summary><div class="teaching-body">${nl(e.practice)}</div></details>`:""}`;
}
function renderEntries(){
  $("#entries").innerHTML=DATA.books.map(b=>`<section class="card book-cover" id="${b.key}"><h1>${b.title}</h1><p>共 ${b.count}${b.unit}</p></section>`+DATA.entries.filter(e=>e.book_key===b.key).map(e=>`<article id="${e.id}" class="entry searchable" data-teaching="${e.teaching_status||"pending"}">
  <div class="entry-head"><h3>${b.unit==="節"?"第"+e.number+"節":"第"+e.number+"章"}</h3><button class="bookmark" data-id="${e.id}">☆ 書籤</button></div>
  <section class="block original"><div class="label">原文</div><p>${nl(e.original)}</p></section>
  ${teachingBlock(e)}
  <section class="block notes"><div class="label">${esc(e.notes_label)} <span class="status ${e.notes_status}">${e.verification_status==="collated"?"已校勘原註":(e.notes_status==="full"?"完整原註":"要義整理")}</span></div><p>${nl(e.notes)}</p></section>
  <section class="block modern"><div class="label">白話解釋</div><p>${nl(e.modern)}</p></section>
  <section class="note-area"><div class="label">我的筆記</div><textarea data-note="${e.id}" placeholder="筆記只儲存在目前裝置"></textarea></section>
  </article>`).join("")).join("");
}
function setView(v){$$(".block,.teaching-pending,.note-area").forEach(x=>x.classList.remove("hidden"));if(v==="original")$$(".notes,.modern,.teaching,.teaching-pending,.note-area").forEach(x=>x.classList.add("hidden"));if(v==="notes")$$(".modern,.teaching,.teaching-pending,.note-area").forEach(x=>x.classList.add("hidden"));if(v==="modern")$$(".notes,.teaching,.teaching-pending,.note-area").forEach(x=>x.classList.add("hidden"));if(v==="teaching")$$(".notes,.note-area").forEach(x=>x.classList.add("hidden"))}
function bind(){
  $$(".bookmark").forEach(b=>b.onclick=()=>{marks=marks.includes(b.dataset.id)?marks.filter(x=>x!==b.dataset.id):[...marks,b.dataset.id];localStorage.lunyuMarks=JSON.stringify(marks);refresh()});
  $$("[data-note]").forEach(t=>{let k="lunyuNote:"+t.dataset.note;t.value=localStorage[k]||"";t.oninput=()=>{localStorage[k]=t.value;dashboard()}});
  $$("[data-view]").forEach(b=>b.onclick=()=>setView(b.dataset.view));
}
function refresh(){$$(".bookmark").forEach(b=>b.textContent=marks.includes(b.dataset.id)?"★ 已收藏":"☆ 書籤");$("#bookmarkCount").textContent=marks.length;$("#bookmarkList").innerHTML=marks.length?marks.map(id=>`<a href="#${id}">${labelFor(id)}</a>`).join("<br>"):"尚未收藏章節。"}
function dashboard(){
  $("#fullCount").textContent=DATA.entries.filter(e=>e.notes_status==="full").length;
  $("#summaryCount").textContent=DATA.entries.filter(e=>e.notes_status==="summary").length;
  $("#teachingCount").textContent=DATA.entries.filter(e=>e.teaching_status==="sample_complete").length;
  let n=0;for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i)||"";if(k.startsWith("lunyuNote:")&&(localStorage.getItem(k)||"").trim())n++}$("#noteCount").textContent=n;
}
async function init(){
  DATA=window.LUNYU_DATA||await fetch("./data/lunyu.json").then(r=>r.json());
  renderTOC();renderEntries();bind();refresh();dashboard();
  let fs=+(localStorage.lunyuFs||19);document.documentElement.style.setProperty("--fs",fs+"px");
  if(localStorage.lunyuTheme==="dark")document.documentElement.dataset.theme="dark";
  $("#search").oninput=()=>{let q=$("#search").value.trim().toLowerCase();$$(".searchable").forEach(x=>x.style.display=!q||x.innerText.toLowerCase().includes(q)?"block":"none")};
  $("#theme").onclick=()=>{let d=document.documentElement.dataset.theme==="dark";document.documentElement.dataset.theme=d?"":"dark";localStorage.lunyuTheme=d?"light":"dark"};
  $("#minus").onclick=()=>{fs=Math.max(15,fs-1);localStorage.lunyuFs=fs;document.documentElement.style.setProperty("--fs",fs+"px")};
  $("#plus").onclick=()=>{fs=Math.min(30,fs+1);localStorage.lunyuFs=fs;document.documentElement.style.setProperty("--fs",fs+"px")};
  $("#focusBtn").onclick=()=>document.body.classList.toggle("focus-mode");
  $("#projectorBtn").onclick=()=>document.body.classList.toggle("projector-mode");
  $("#expandBtn").onclick=()=>$$("article details").forEach(x=>x.open=true);
  $("#collapseBtn").onclick=()=>$$("article details").forEach(x=>x.open=false);
  $("#printBtn").onclick=()=>print();
  $("#topBtn").onclick=()=>scrollTo({top:0,behavior:"smooth"});
  addEventListener("scroll",()=>{let d=document.documentElement;$("#bar").style.width=(100*d.scrollTop/Math.max(1,d.scrollHeight-d.clientHeight))+"%"});
  if("serviceWorker"in navigator&&!window.LUNYU_DATA)navigator.serviceWorker.register("./sw.js");
}
init().then(()=>{bindTopbar();bindProjector169();});


function currentEntry(){
  const entries=[...document.querySelectorAll(".entry")];
  if(!entries.length)return null;
  let best=entries[0],bestDist=Infinity;
  for(const e of entries){
    const d=Math.abs(e.getBoundingClientRect().top-90);
    if(d<bestDist){best=e;bestDist=d}
  }
  return best;
}
function goRelative(step){
  const entries=[...document.querySelectorAll(".entry")];
  const cur=currentEntry();
  const i=Math.max(0,entries.indexOf(cur));
  const target=entries[Math.min(entries.length-1,Math.max(0,i+step))];
  if(target)target.scrollIntoView({behavior:"smooth",block:"start"});
}
function syncTopBookmark(){
  const cur=currentEntry();
  const btn=document.querySelector("#bookmarkBtn");
  if(!cur||!btn)return;
  btn.textContent=marks.includes(cur.id)?"★":"☆";
}
function bindTopbar(){
  const byId=id=>document.getElementById(id);
  byId("prevChapter")?.addEventListener("click",()=>goRelative(-1));
  byId("nextChapter")?.addEventListener("click",()=>goRelative(1));
  byId("tocBtn")?.addEventListener("click",()=>document.body.classList.toggle("toc-open"));
  byId("searchBtn")?.addEventListener("click",()=>{document.body.classList.toggle("search-open");setTimeout(()=>document.getElementById("search")?.focus(),50)});
  byId("bookmarkBtn")?.addEventListener("click",()=>{
    const cur=currentEntry(); if(!cur)return;
    marks=marks.includes(cur.id)?marks.filter(x=>x!==cur.id):[...marks,cur.id];
    localStorage.lunyuMarks=JSON.stringify(marks);refresh();syncTopBookmark();
  });
  byId("minusTop")?.addEventListener("click",()=>document.getElementById("minus")?.click());
  byId("plusTop")?.addEventListener("click",()=>document.getElementById("plus")?.click());
  byId("themeTop")?.addEventListener("click",()=>document.getElementById("theme")?.click());
  byId("expandTop")?.addEventListener("click",()=>document.getElementById("expandBtn")?.click());
  byId("collapseTop")?.addEventListener("click",()=>document.getElementById("collapseBtn")?.click());
  byId("topTop")?.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
  document.querySelectorAll(".fixed-actionbar [data-view]").forEach(b=>b.addEventListener("click",()=>{
    setView(b.dataset.view);
    document.querySelectorAll(".fixed-actionbar [data-view]").forEach(x=>x.classList.toggle("current-active",x===b));
  }));
  addEventListener("scroll",syncTopBookmark,{passive:true});
  document.addEventListener("click",e=>{
    if(document.body.classList.contains("toc-open") && !e.target.closest("aside") && !e.target.closest("#tocBtn"))document.body.classList.remove("toc-open");
  });
  syncTopBookmark();
}


function setProjectorCurrent(el){
  document.querySelectorAll(".entry").forEach(x=>x.classList.remove("projector-current"));
  if(el)el.classList.add("projector-current");
}
function enterProjector169(){
  const cur=currentEntry()||document.querySelector(".entry");
  setProjectorCurrent(cur);
  document.body.classList.add("projector-169","projector-clean");
  const btn=document.getElementById("projector169");
  if(btn)btn.classList.add("current-active");
}
function exitProjector169(){
  document.body.classList.remove("projector-169","projector-clean");
  document.querySelectorAll(".entry").forEach(x=>x.classList.remove("projector-current"));
  const btn=document.getElementById("projector169");
  if(btn)btn.classList.remove("current-active");
}
function toggleProjector169(){
  if(document.body.classList.contains("projector-169"))exitProjector169();
  else enterProjector169();
}
function projectorGo(step){
  const entries=[...document.querySelectorAll(".entry")];
  let cur=document.querySelector(".entry.projector-current")||currentEntry();
  let i=Math.max(0,entries.indexOf(cur));
  let next=entries[Math.min(entries.length-1,Math.max(0,i+step))];
  setProjectorCurrent(next);
}
async function toggleFullscreen(){
  try{
    if(!document.fullscreenElement){
      await document.documentElement.requestFullscreen();
    }else{
      await document.exitFullscreen();
    }
  }catch(e){}
}
function bindProjector169(){
  document.getElementById("projector169")?.addEventListener("click",toggleProjector169);
  document.getElementById("fullscreenTop")?.addEventListener("click",toggleFullscreen);

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape" && document.body.classList.contains("projector-169"))exitProjector169();
    if(!document.body.classList.contains("projector-169"))return;
    if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();projectorGo(1)}
    if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();projectorGo(-1)}
    if(e.key.toLowerCase()==="f"){e.preventDefault();toggleFullscreen()}
    if(e.key.toLowerCase()==="p"){e.preventDefault();toggleProjector169()}
    if(e.key===" "){e.preventDefault();document.body.classList.toggle("projector-clean")}
  });

  let startX=0;
  document.addEventListener("touchstart",e=>{
    if(document.body.classList.contains("projector-169"))startX=e.changedTouches[0].screenX;
  },{passive:true});
  document.addEventListener("touchend",e=>{
    if(!document.body.classList.contains("projector-169"))return;
    const dx=e.changedTouches[0].screenX-startX;
    if(Math.abs(dx)>60)projectorGo(dx<0?1:-1);
  },{passive:true});

  const help=document.createElement("div");
  help.className="projector-help";
  help.textContent="← → 切章｜Space 顯示/隱藏工具列｜F 全螢幕｜Esc 離開";
  document.body.appendChild(help);
}
