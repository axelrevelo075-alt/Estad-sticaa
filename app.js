(()=>{
'use strict';
const D=window.PORTAFOLIO_DATA;
if(!D||!Array.isArray(D.recursos)||!Array.isArray(D.parciales)){console.error('Falta el archivo recursos.js');return;}
const $=(selector)=>document.querySelector(selector);
let current=1,activeFilter='Todos',textQuery='';
const groupsOrder=['Carpetas del proyecto','Encuesta y datos','Análisis estadístico','Informe y manuales','Material didáctico'];
const groupLabels={'Carpetas del proyecto':'Acceso a Google Drive','Encuesta y datos':'Encuesta y base de datos','Análisis estadístico':'Cálculos, tablas y gráficos','Informe y manuales':'Documentación e informes','Material didáctico':'Materiales de apoyo'};
const categoryLabel=(name)=>groupLabels[name]||name;
const validLink=(s)=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol);}catch(_){return false;}};
const linked=(r)=>validLink(r.url||'');
const currItems=()=>D.recursos.filter(r=>r.parcial===current||r.parcial===0);
const icon=(r)=>{if(/Carpeta/i.test(r.tipo))return '▤';if(/Video/i.test(r.tipo))return '▶';if(/PDF|Documento/i.test(r.tipo))return '▧';if(/Excel|Sheet|Hoja/i.test(r.tipo))return '▦';return '◫';};
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function clear(node){node.replaceChildren();}
function setLink(selector,url){const n=$(selector);if(n&&validLink(url))n.href=url;}
function renderIndex(){const root=$('#indexList');clear(root);const all=currItems();const names=['Todos',...groupsOrder.filter(n=>all.some(r=>r.categoria===n)),...new Set(all.map(r=>r.categoria).filter(n=>!groupsOrder.includes(n)))];names.forEach((name,i)=>{const btn=el('button','index-link'+(activeFilter===name?' is-active':''));btn.type='button';btn.append(el('span',null,i===0?'◈':'▫'),el('span',null,i===0?'Todos los recursos':categoryLabel(name)),el('span','index-count',String(name==='Todos'?all.length:all.filter(x=>x.categoria===name).length)));btn.addEventListener('click',()=>selectFilter(name));root.append(btn);});}
function renderFilters(){const root=$('#filters');clear(root);['Todos','Disponibles','Por vincular'].forEach(name=>{const btn=el('button','filter-btn'+((name==='Todos'&&activeFilter==='Todos')||(name===activeFilter)?' selected':''),name);btn.type='button';btn.addEventListener('click',()=>selectFilter(name));root.append(btn);});}
function selectFilter(name){activeFilter=name;renderIndex();renderFilters();renderResources();}
function resourceCard(r){const card=el('article','resource-card '+(linked(r)?'available':'unlinked'));
  const iconBox=el('span','file-icon',icon(r));iconBox.setAttribute('aria-hidden','true');
  const content=el('div','file-content');content.append(el('h5',null,r.titulo),el('p',null,r.descripcion||''));
  const bottom=el('div','file-bottom');bottom.append(el('span','file-type',r.tipo||'Documento'));
  if(linked(r)){const a=el('a','file-link','Abrir recurso ↗');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Abrir '+r.titulo+' en una nueva pestaña');bottom.append(a);}
  else{bottom.append(el('span','pending','Por vincular'));}
  content.append(bottom);card.append(iconBox,content);return card;
}
function renderResources(){const root=$('#resourceGroups');clear(root);const q=textQuery.toLocaleLowerCase('es').trim();let items=currItems();if(activeFilter==='Disponibles')items=items.filter(linked);else if(activeFilter==='Por vincular')items=items.filter(x=>!linked(x));else if(activeFilter!=='Todos')items=items.filter(x=>x.categoria===activeFilter);
if(q)items=items.filter(x=>[x.titulo,x.descripcion,x.categoria,x.tipo].some(s=>String(s||'').toLocaleLowerCase('es').includes(q)));
$('#resourceCount').textContent=`${items.length} ${items.length===1?'recurso':'recursos'}`;
if(items.length===0){const box=el('div','empty-state');box.append(el('div','empty-icon','◇'),el('strong',null,'No hay recursos con estos filtros'),el('p',null,'Prueba otra búsqueda o consulta la carpeta compartida de Google Drive.'));const b=el('button','back-to-all','Mostrar todos los recursos');b.type='button';b.addEventListener('click',()=>{textQuery='';$('#search').value='';selectFilter('Todos');});box.append(b);root.append(box);return;}
const cats=[...groupsOrder,...new Set(items.map(r=>r.categoria).filter(n=>!groupsOrder.includes(n)))];
for(const name of cats){const found=items.filter(r=>r.categoria===name);if(!found.length)continue;const section=el('section','resource-group');section.append(el('h4',null,categoryLabel(name)));const list=el('div','resource-list');found.forEach(r=>list.append(resourceCard(r)));section.append(list);root.append(section);}
}
function switchPartial(id){current=id;activeFilter='Todos';textQuery='';$('#search').value='';const partial=D.parciales.find(p=>p.id===id);if(!partial)return;
document.querySelectorAll('[data-tab]').forEach(b=>{const active=Number(b.dataset.tab)===id;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
$('#partialLabel').textContent=partial.titulo.toLocaleUpperCase('es');$('#partialTitle').textContent=partial.subtitulo;$('#partialDesc').textContent=partial.descripcion;$('.partial-decoration').textContent=String(id).padStart(2,'0');
const topics=$('#topics');clear(topics);(partial.temas.length?partial.temas:['Espacio para nuevas entregas']).forEach(t=>topics.append(el('span','topic-pill',t)));
const first=D.recursos.find(x=>x.parcial===id&&x.tipo==='Carpeta de Drive'&&linked(x));setLink('#sidebarDrive',first?first.url:D.meta.driveGeneral);
renderIndex();renderFilters();renderResources();}
['#topDrive','#heroDrive','#footerDrive'].forEach(id=>setLink(id,D.meta.driveGeneral));
const verified=D.recursos.filter(x=>x.verificado&&/Carpeta/i.test(x.tipo)&&linked(x)).length;
$('#folderCount').textContent=verified+' '+(verified===1?'carpeta':'carpetas');
$('#search').addEventListener('input',e=>{textQuery=e.target.value;renderResources();});
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>switchPartial(Number(b.dataset.tab))));
const params=new URLSearchParams(location.search);const initial=Number(params.get('parcial'));switchPartial([1,2,3].includes(initial)?initial:1);
})();
