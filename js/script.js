const sampleProjects = [
  {id:"sample-1",title:"Personal Portfolio",creator:"Alex Morgan",description:"A clean personal portfolio featuring selected work, skills, and a contact section.",language:"HTML",rating:4.8,reviewCount:12,url:"https://example.com",symbol:"{ }",cover:1},
  {id:"sample-2",title:"Study Space",creator:"Jamie Lee",description:"A calm dashboard concept for organizing study tasks and class notes.",language:"CSS",rating:4.6,reviewCount:8,url:"",symbol:"▦",cover:2},
  {id:"sample-3",title:"Weather Dashboard",creator:"Sam Rivera",description:"A responsive weather interface with a clear, simple information layout.",language:"JavaScript",rating:4.9,reviewCount:16,url:"",symbol:"☼",cover:3},
  {id:"sample-4",title:"Library Manager",creator:"Taylor Cruz",description:"A small library-management concept for tracking books and readers.",language:"Java",rating:null,reviewCount:0,url:"",symbol:"▤",cover:4},
  {id:"sample-5",title:"Color Playground",creator:"Morgan Chen",description:"An interactive space for exploring color combinations and palettes.",language:"JavaScript",rating:4.2,reviewCount:5,url:"",symbol:"◒",cover:5},
  {id:"sample-6",title:"Cafe Landing Page",creator:"Riley Santos",description:"A warm landing page concept for a neighborhood coffee shop.",language:"HTML",rating:4.7,reviewCount:9,url:"",symbol:"✳",cover:6}
];
let projects = [...sampleProjects, ...loadProjects()];
const grid = document.getElementById("projectGrid");
const searchInput = document.getElementById("searchInput");
const languageFilter = document.getElementById("languageFilter");
const sortFilter = document.getElementById("sortFilter");
const toast = document.getElementById("toast");
let toastTimer;

function loadProjects(){ try{return JSON.parse(localStorage.getItem("codeArchiveProjects")||"[]")}catch{return []} }
function saveProjects(){localStorage.setItem("codeArchiveProjects",JSON.stringify(projects.filter(p=>!p.id.startsWith("sample-"))))}
function stars(rating){if(rating===null||rating===undefined)return '<span class="unrated">Not yet rated</span>';return `<span class="stars" aria-label="${rating} out of 5 stars">★★★★★</span><span>${Number(rating).toFixed(1)}</span>`}
function renderProjects(){
  const term=searchInput.value.trim().toLowerCase(),lang=languageFilter.value,sort=sortFilter.value;
  let list=projects.filter(p=>(lang==="all"||p.language===lang)&&(!term||`${p.title} ${p.creator} ${p.description} ${p.language}`.toLowerCase().includes(term)));
  if(sort==="newest")list.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  if(sort==="rating")list.sort((a,b)=>(b.rating??-1)-(a.rating??-1));
  document.getElementById("resultsCount").textContent=`${list.length} project${list.length===1?"":"s"} found`;
  grid.innerHTML=list.map(p=>`<article class="project-card" data-id="${p.id}" tabindex="0" role="button" aria-label="View ${escapeHtml(p.title)}">
    <div class="project-cover cover-${p.cover||1}"><span class="language-pill">${escapeHtml(p.language)}</span><span class="cover-symbol">${escapeHtml(p.symbol||"{ }")}</span></div>
    <div class="project-body"><div class="project-title-row"><h3>${escapeHtml(p.title)}</h3></div><p class="project-description">${escapeHtml(p.description)}</p>
    <div class="creator-line"><span class="avatar">${escapeHtml(initials(p.creator))}</span><span class="creator-name">${escapeHtml(p.creator)}</span><span class="rating">${stars(p.rating)}</span></div></div></article>`).join("");
  document.getElementById("emptyState").classList.toggle("hidden",list.length!==0);
}
function initials(name){return name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function showToast(message){toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2600)}
function openModal(id){document.getElementById(id).classList.remove("hidden")}
function closeModal(id){document.getElementById(id).classList.add("hidden")}
function makeKey(){return "CA-"+Array.from(crypto.getRandomValues(new Uint8Array(6))).map(n=>n.toString(16).padStart(2,"0")).join("").toUpperCase()}

document.getElementById("uploadBtn").addEventListener("click",()=>openModal("uploadModal"));
document.getElementById("heroUploadBtn").addEventListener("click",()=>openModal("uploadModal"));
document.getElementById("signupBtn").addEventListener("click",()=>showToast("Account registration will be added in the Firebase stage."));
document.getElementById("loginBtn").addEventListener("click",()=>showToast("Login will be added in the Firebase stage."));
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));
[searchInput,languageFilter,sortFilter].forEach(el=>el.addEventListener(el===searchInput?"input":"change",renderProjects));
document.getElementById("clearFilters").addEventListener("click",()=>{searchInput.value="";languageFilter.value="all";sortFilter.value="featured";renderProjects()});
document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",()=>closeModal(btn.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(backdrop=>backdrop.addEventListener("click",e=>{if(e.target===backdrop&&backdrop.id!=="keyModal")closeModal(backdrop.id)}));

document.getElementById("uploadForm").addEventListener("submit",e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const key=makeKey();
  const project={id:"user-"+Date.now(),title:data.get("title").trim(),creator:data.get("creator").trim(),description:data.get("description").trim(),url:data.get("url").trim(),language:data.get("language"),rating:null,reviewCount:0,symbol:"</>",cover:((projects.length%6)+1),createdAt:Date.now(),editingKey:key};
  projects.unshift(project);saveProjects();renderProjects();e.currentTarget.reset();closeModal("uploadModal");
  document.getElementById("editingKeyText").textContent=key;
  document.getElementById("keyCopyStatus").textContent="You should copy your key before closing this message.";
  document.getElementById("copyKeyBtn").textContent="Copy key";
  document.getElementById("keyDoneBtn").disabled=true;
  openModal("keyModal");
});
document.getElementById("copyKeyBtn").addEventListener("click",async()=>{
  const key=document.getElementById("editingKeyText").textContent;
  try{await navigator.clipboard.writeText(key);document.getElementById("copyKeyBtn").textContent="Copied ✓";document.getElementById("keyCopyStatus").textContent="Key copied. Keep it somewhere safe.";document.getElementById("keyDoneBtn").disabled=false}
  catch{document.getElementById("keyCopyStatus").textContent="Clipboard access was blocked. Select and copy the key manually.";showToast("Select the key and copy it manually.");}
});
document.getElementById("keyDoneBtn").addEventListener("click",()=>{closeModal("keyModal");showToast("Your project is now in the archive.")});

grid.addEventListener("click",e=>{const card=e.target.closest(".project-card");if(card)showDetails(card.dataset.id)});
grid.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("project-card")){e.preventDefault();showDetails(e.target.dataset.id)}});
function showDetails(id){
  const p=projects.find(x=>x.id===id);if(!p)return;
  const own=!id.startsWith("sample-");
  document.getElementById("detailContent").innerHTML=`<div class="detail-cover project-cover cover-${p.cover||1}"><span class="cover-symbol">${escapeHtml(p.symbol||"{ }")}</span></div>
    <div class="eyebrow">PROJECT DETAILS</div><h2 id="detailTitle">${escapeHtml(p.title)}</h2>
    <div class="detail-meta"><span>${escapeHtml(p.language)}</span><span>By ${escapeHtml(p.creator)}</span><span>${p.rating===null?"Not yet rated":`${Number(p.rating).toFixed(1)} / 5 stars`}</span></div>
    <p class="detail-copy">${escapeHtml(p.description)}</p>
    ${p.url?`<p class="detail-copy">Project link: <a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" style="color:#3478f6">Open project ↗</a></p>`:""}
    ${own?`<div class="detail-actions"><button class="btn btn-outline" id="editProjectBtn">Edit project</button><button class="btn btn-outline" id="deleteProjectBtn">Delete project</button></div>`:""}
    <p class="detail-copy" style="margin-top:18px;font-size:10px">Review scores and commission messaging will be connected in a later development stage.</p>`;
  openModal("detailModal");
  if(own){
    document.getElementById("editProjectBtn").addEventListener("click",()=>editProject(p.id));
    document.getElementById("deleteProjectBtn").addEventListener("click",()=>deleteProject(p.id));
  }
}
function editProject(id){
  const p=projects.find(x=>x.id===id);if(!p)return;
  const entered=prompt("Enter the editing key you received when uploading this project:");
  if(entered===null)return;
  if(entered!==p.editingKey){showToast("That editing key doesn't match.");return}
  const title=prompt("Project title:",p.title);if(title===null)return;
  const description=prompt("Project description:",p.description);if(description===null)return;
  p.title=title.trim()||p.title;p.description=description.trim()||p.description;
  saveProjects();renderProjects();closeModal("detailModal");showToast("Project updated.");
}
function deleteProject(id){
  const p=projects.find(x=>x.id===id);if(!p)return;
  const entered=prompt("Enter the editing key to delete this project:");
  if(entered===null)return;
  if(entered!==p.editingKey){showToast("That editing key doesn't match.");return}
  if(!confirm("Delete this project from this browser?"))return;
  projects=projects.filter(x=>x.id!==id);saveProjects();renderProjects();closeModal("detailModal");showToast("Project deleted.");
}
renderProjects();