(() => {
  "use strict";

  const data = window.PORTAFOLIO_DATA || {resources:{}};
  const partialNames = {1:"Primer parcial",2:"Segundo parcial",3:"Tercer parcial"};
  const members = ["Axel Revelo","Estefano Iñaguazo","Julian Quinga","Cristian Viteri","Jhon Sangurima"];
  const sections = document.getElementById("sections");
  const index = document.getElementById("index");
  const search = document.getElementById("searchInput");
  const title = document.getElementById("partialTitle");
  const subtitle = document.getElementById("partialSubtitle");
  const fileCount = document.getElementById("fileCount");
  const todo = document.getElementById("todoBox");
  let selectedPartial = 1;
  let selectedSection = "individual";

  const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function createDocLink(doc) {
    const [filename, type, url] = doc;
    const link = make("a","item");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label","Abrir " + filename);
    const icon = make("span","icon", (type === "Formulario" ? "FORM" : type === "Imagen" ? "IMG" : type === "Acceso directo" ? "LINK" : type).slice(0,4).toUpperCase());
    icon.classList.add("type-" + type.replace(/\s+/g,"-"));
    const filenameEl = make("span","name",filename);
    const meta = make("span","meta");
    meta.append(make("span","badge",type), make("span","external-mark","↗"));
    link.append(icon,filenameEl,meta);
    return link;
  }

  function createFileList(docs) {
    const list = make("div","list");
    docs.forEach(doc => list.append(createDocLink(doc)));
    return list;
  }

  function addIndex(label, href, count) {
    const a = make("a","chip",label);
    a.href = href;
    const number = make("span","chip-count",String(count));
    a.append(number);
    index.append(a);
  }

  function createGeneralSection(docs) {
    const section = make("section","document-section");
    section.id = "documentos-generales";
    section.append(make("h3","section-subheading","Documentos generales"));
    section.append(make("p","section-description","Informe, encuesta, hoja de cálculo y mapa conceptual."));
    section.append(createFileList(docs));
    sections.append(section);
  }

  function createMember(name,docs,expand) {
    const details = make("details","member");
    if(expand) details.open = true;
    const summary = make("summary","member-summary");
    const avatar = make("span","member-avatar",name.split(" ").map(part=>part.charAt(0)).slice(0,2).join(""));
    const info = make("span","member-info");
    info.append(make("strong","member-name",name));
    info.append(make("small","member-label",docs.length ? docs.length + (docs.length === 1 ? " archivo" : " archivos") : "Archivos por entregar"));
    const chevron = make("span","member-chevron","⌄");
    summary.append(avatar,info,chevron);
    details.append(summary);
    const body = make("div","member-body");
    if(docs.length) body.append(createFileList(docs));
    else body.append(make("p","member-pending","Todavía no se han subido documentos de este integrante."));
    details.append(body);
    return details;
  }

  function createIndividualSection(people,query) {
    const section = make("section","individual-section");
    section.id = "trabajos-individuales";
    const header = make("div","individual-heading");
    const intro = make("div","");
    intro.append(make("h3","section-subheading","Trabajos individuales"));
    intro.append(make("p","section-description","Selecciona un integrante para consultar sus archivos."));
    const tally = make("span","people-count",people.length + (people.length === 1 ? " integrante" : " integrantes"));
    header.append(intro,tally);
    section.append(header);
    const list = make("div","members");
    people.forEach(([name,docs],i)=>list.append(createMember(name,docs, Boolean(query) || i===0)));
    section.append(list);
    sections.append(section);
  }

  function render() {
    const groups = data.resources[String(selectedPartial)] || {};
    const query = normalize(search.value.trim());
    const docs = Object.values(groups).flat();
    title.textContent = partialNames[selectedPartial];
    subtitle.textContent = selectedPartial===1
      ? "Encuentra los documentos generales y los trabajos de cada integrante."
      : "Este parcial aún no tiene documentos disponibles.";
    const displayedCount = selectedPartial===1
      ? (selectedSection==="individual" ? members.reduce((n,name)=>n+(groups[name]||[]).length,0) : (groups.General||[]).length)
      : docs.length;
    fileCount.textContent = displayedCount + (displayedCount===1 ? " archivo" : " archivos");
    const viewNav = document.getElementById("viewNav");
    viewNav.hidden = selectedPartial!==1;
    viewNav.querySelectorAll("[data-section]").forEach(button=>{
      button.classList.toggle("active",button.dataset.section===selectedSection);
      button.setAttribute("aria-pressed",String(button.dataset.section===selectedSection));
    });
    index.replaceChildren();
    sections.replaceChildren();

    if(selectedPartial === 1) {
      todo.textContent = "Por completar: videos del equipo y archivos de los integrantes que aún no han entregado.";
      todo.style.display = "block";
    } else {
      todo.style.display = "none";
    }

    if(selectedPartial!==1 && docs.length===0) {
      const empty = make("div","empty");
      empty.append(make("h3","","Pendiente de archivos"));
      empty.append(make("p","","Los documentos se mostrarán aquí cuando estén disponibles."));
      sections.append(empty);
      return;
    }

    const general = groups.General || [];
    const generalGroupMatch = normalize("Documentos generales").includes(query);
    const visibleGeneral = general.filter(doc=> !query || generalGroupMatch || normalize(doc[0] + " " + doc[1]).includes(query));
    if(visibleGeneral.length && selectedSection==="general") {
      addIndex("Documentos generales","#documentos-generales",visibleGeneral.length);
      createGeneralSection(visibleGeneral);
    }

    const individualGroupMatch = normalize("Trabajos individuales").includes(query);
    const people = members
      .map(name => {
        const all = groups[name] || [];
        const nameMatches = normalize(name).includes(query);
        const matches = all.filter(doc => !query || nameMatches || individualGroupMatch || normalize(doc[0] + " " + doc[1]).includes(query));
        const shouldShow = !query || nameMatches || individualGroupMatch || matches.length>0;
        return shouldShow ? [name,matches] : null;
      })
      .filter(Boolean);
    if(people.length && selectedSection==="individual") {
      const count = people.reduce((sum,person)=>sum+person[1].length,0);
      addIndex("Trabajos individuales","#trabajos-individuales",count);
      createIndividualSection(people,query);
    }

    if((selectedSection==="general" && !visibleGeneral.length) || (selectedSection==="individual" && !people.length)) {
      const empty = make("div","empty");
      empty.append(make("h3","","No encontramos ese archivo"));
      empty.append(make("p","","Busca por el nombre de un integrante o por el documento."));
      sections.append(empty);
    }
  }

  document.querySelectorAll(".switch").forEach(button => {
    button.addEventListener("click",() => {
      document.querySelectorAll(".switch").forEach(b=>b.classList.remove("active"));
      button.classList.add("active");
      selectedPartial = Number(button.dataset.partial);
      selectedSection = "individual";
      search.value = "";
      render();
    });
  });
  document.querySelectorAll("[data-section]").forEach(button=>{
    button.addEventListener("click",()=>{
      selectedSection = button.dataset.section;
      search.value = "";
      render();
    });
  });
  const heroWork = document.getElementById("heroWorkLink");
  heroWork.addEventListener("click",()=>{
    selectedPartial=1;
    selectedSection="individual";
    document.querySelectorAll(".switch").forEach(b=>b.classList.toggle("active",Number(b.dataset.partial)===1));
    search.value="";
    render();
  });
  search.addEventListener("input",render);
  render();
})();
