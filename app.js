(() => {
  const data = window.PORTAFOLIO_DATA;
  const partialNames = {1:'Primer parcial',2:'Segundo parcial',3:'Tercer parcial'};
  const partialDesc = {
    1:'Documentos reales encontrados en el Drive del grupo.',
    2:'Todavía no hay archivos cargados en este parcial.',
    3:'Todavía no hay archivos cargados en este parcial.'
  };
  const sections = document.getElementById('sections');
  const index = document.getElementById('index');
  const searchInput = document.getElementById('searchInput');
  const partialTitle = document.getElementById('partialTitle');
  const partialSubtitle = document.getElementById('partialSubtitle');
  const fileCount = document.getElementById('fileCount');
  const todoBox = document.getElementById('todoBox');
  let currentPartial = 1;

  function getGroups(partial){
    return data.resources[String(partial)] || data.resources[partial] || {};
  }
  function allDocs(groups){
    return Object.entries(groups).flatMap(([group,docs]) => docs.map(doc => ({group, ...docToObj(doc)})));
  }
  function docToObj(doc){
    return {title:doc[0], type:doc[1], url:doc[2]};
  }
  function icon(type){
    const safe = type.replace(/\s+/g,'\ ');
    return `<span class="icon type-${safe}">${type.slice(0,3).toUpperCase()}</span>`;
  }
  function render(){
    const groups = getGroups(currentPartial);
    const q = searchInput.value.trim().toLowerCase();
    partialTitle.textContent = partialNames[currentPartial];
    partialSubtitle.textContent = partialDesc[currentPartial];
    index.innerHTML = '';
    sections.innerHTML = '';
    const filteredGroups = [];
    Object.entries(groups).forEach(([group,docs]) => {
      const filtered = docs.filter(d => (d[0] + ' ' + d[1]).toLowerCase().includes(q));
      if(filtered.length) filteredGroups.push([group, filtered]);
    });
    const total = filteredGroups.reduce((acc,[,docs]) => acc + docs.length, 0);
    fileCount.textContent = `${total} archivo${total === 1 ? '' : 's'}`;
    if(currentPartial === 1) {
      todoBox.innerHTML = '<strong>Por completar:</strong> videos del equipo y archivos de Cristian Viteri y Jhon Sangurima.';
      todoBox.style.display = 'block';
    } else {
      todoBox.style.display = 'none';
    }
    if(!filteredGroups.length){
      sections.innerHTML = `<div class="empty"><h3>Sin archivos todavía</h3><p>${currentPartial === 1 ? 'No hay resultados con esa búsqueda.' : 'Aquí aparecerán los documentos cuando estén disponibles.'}</p></div>`;
      return;
    }
    filteredGroups.forEach(([group,docs]) => {
      const anchor = group.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-');
      const chip = document.createElement('a');
      chip.className = 'chip';
      chip.href = '#' + anchor;
      chip.textContent = `${group} (${docs.length})`;
      index.appendChild(chip);
      const wrapper = document.createElement('section');
      wrapper.className = 'group';
      wrapper.id = anchor;
      const title = document.createElement('h3');
      title.textContent = group;
      const list = document.createElement('div');
      list.className = 'list';
      docs.forEach(doc => {
        const a = document.createElement('a');
        a.className = 'item';
        a.href = doc[2];
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = `${icon(doc[1])}<span class="name">${doc[0]}</span><span class="meta"><span class="badge">${doc[1]}</span><span aria-hidden="true">↗</span></span>`;
        list.appendChild(a);
      });
      wrapper.appendChild(title);
      wrapper.appendChild(list);
      sections.appendChild(wrapper);
    });
  }
  document.querySelectorAll('.switch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.switch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPartial = Number(btn.dataset.partial);
      render();
    });
  });
  searchInput.addEventListener('input', render);
  render();
})();
