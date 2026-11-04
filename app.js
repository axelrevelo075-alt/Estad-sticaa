(()=>{
"use strict";
const data=window.PORTAFOLIO_DATA||{recursos:[]};
const folders=["General","Axel Revelo","Estefano Iñaguazo","Julian Quinga","Cristian Viteri","Jhon Sangurima"];
const escid=s=>"grupo-"+s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
const available=(data.recursos||[]).filter(r=>Number.isInteger(Number(r.parcial))&&r.url&&/^https:\/\//i.test(r.url)&&r.tipo!=="Carpeta"&&r.tipo!=="Carpeta de Drive");
const $=id=>document.getElementById(id);
const labels={1:"Primer parcial",2:"Segundo parcial",3:"Tercer parcial"};
const svgDocument='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 2.5h8l4 4v15H6a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2Z"/><path d="M14 2.5v5h5M8 12h7M8 16h7"/></svg>';
const svgExternal='<svg class="external" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M13 5h6v6M19 5l-9 9"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';
let parcial=1;
function el(tag,className,textValue){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(textValue!==undefined)node.textContent=textValue;
  return node;
}
function norm(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function setTab(n){
  parcial=n;
  document.querySelectorAll(".tab").forEach(btn=>{
    const active=Number(btn.dataset.parcial)===parcial;
    btn.classList.toggle("active",active);
    btn.setAttribute("aria-selected",String(active));
  });
  $("section-title").textContent=labels[n];
  $("search").value="";
  $("section-subtitle").textContent=n===1?"Documentos del equipo organizados por integrante.":"Los documentos de este parcial se agregarán cuando estén disponibles.";
  $("tools").hidden=n!==1&&!available.some(r=>Number(r.parcial)===n);
  $("remaining").hidden=n!==1;
  render();
}
function render(){
  const text=norm($("search").value.trim());
  const full=available.filter(r=>Number(r.parcial)===parcial);
  const current=full.filter(r=>norm(r.titulo+" "+r.categoria+" "+r.tipo).includes(text));
  $("file-counter").textContent=String(full.length);
  $("index").replaceChildren();
  $("sections").replaceChildren();
  const unique=[...new Set(current.map(r=>r.categoria))];
  const order=[...folders.filter(k=>unique.includes(k)),...unique.filter(k=>!folders.includes(k))];
  for(const group of order){
    const docs=current.filter(r=>r.categoria===group);
    if(!docs.length)continue;
    const id=escid(group);
    const chip=el("a","index-link");
    chip.href="#"+id;
    chip.append(document.createTextNode(group));
    chip.append(el("span","count",String(docs.length)));
    $("index").append(chip);
    const section=el("section","file-group");
    section.id=id;
    const h=el("div","group-head");
    h.append(el("h3","",group==="General"?"Documentos generales":group));
    h.append(el("span","group-count",docs.length===1?"1 archivo":docs.length+" archivos"));
    section.append(h);
    const ul=el("div","file-list");
    for(const doc of docs){
      const a=el("a","file-link");
      a.href=doc.url;a.target="_blank";a.rel="noopener noreferrer";
      a.title="Abrir "+doc.titulo;
      const icon=el("span","file-icon");icon.dataset.format=doc.tipo||"Documento";icon.innerHTML=svgDocument;
      const name=el("span","file-name",doc.titulo);
      const meta=el("span","file-meta");
      meta.append(el("span","format",doc.tipo||"Archivo"));
      meta.insertAdjacentHTML("beforeend",svgExternal);
      a.append(icon,name,meta);
      ul.append(a);
    }
    section.append(ul);$("sections").append(section);
  }
  const empty=!current.length;
  $("empty").hidden=!empty;
  if(empty){
    $("empty-title").textContent=full.length?(text?"No se encontraron archivos":"Sin documentos"):"Aún no hay archivos cargados";
    $("empty-message").textContent=full.length?"Prueba con otro nombre o borra la búsqueda.":"Este parcial todavía no tiene documentos añadidos.";
  }
}
for(let n=1;n<=3;n++){
  const count=available.filter(r=>Number(r.parcial)===n).length;
  const span=document.querySelector('[data-count="'+n+'"]');
  if(span)span.textContent=count?String(count):"—";
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
  const n=Number(b.dataset.parcial);setTab(n);
  if(history.replaceState){history.replaceState(null,"",n===1?"#documentos":"#parcial-"+n);}
}));
$("search").addEventListener("input",render);
const hash=location.hash.match(/^#parcial-(2|3)$/);
setTab(hash?Number(hash[1]):1);
})();