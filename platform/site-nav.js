(() => {
  const nav = document.querySelector(".site-header nav");
  const chapters = window.IDHUB_CHAPTERS;
  if (!nav || !chapters) return;

  const isChapterPage = /\/pages\/capitulo-\d+\.html$/i.test(location.pathname);
  const currentPage = location.pathname.split("/").pop();
  const firstChapterTargets = { "101": "conceptos", "102": "ventaja", "103": "procesos", "104": "lanzamiento" };

  document.querySelectorAll(".subtopic-card").forEach((card) => {
    const code = card.querySelector(".topic-code")?.textContent.trim();
    if (code) card.id = `tema-${code}`;
  });

  const home = document.createElement("a");
  home.href = isChapterPage ? "../index.html" : "index.html";
  home.textContent = "Inicio";
  nav.replaceChildren(home);

  chapters.forEach((chapter, index) => {
    const page = isChapterPage ? chapter.page.replace(/^pages\//, "") : chapter.page;
    const menu = document.createElement("details");
    menu.className = "chapter-menu";
    const summary = document.createElement("summary");
    summary.textContent = `Capítulo ${index + 1}`;
    if (currentPage === chapter.page.split("/").pop()) summary.setAttribute("aria-current", "page");
    menu.append(summary);
    const list = document.createElement("div");
    list.className = "chapter-menu-list";
    const overview = document.createElement("a");
    overview.href = page;
    overview.className = "chapter-menu-overview";
    overview.textContent = "Ver capítulo";
    list.append(overview);
    chapter.subtopics.forEach((topic) => {
      const link = document.createElement("a");
      const target = firstChapterTargets[topic.code] || `tema-${topic.code}`;
      link.href = `${page}#${target}`;
      link.textContent = `${topic.code} · ${topic.title}`;
      list.append(link);
    });
    menu.append(list);
    menu.addEventListener("toggle", () => {
      if (menu.open) nav.querySelectorAll(".chapter-menu").forEach((other) => {
        if (other !== menu) other.open = false;
      });
    });
    list.addEventListener("click", () => { menu.open = false; });
    nav.append(menu);
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) nav.querySelectorAll(".chapter-menu").forEach((menu) => { menu.open = false; });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const openMenu = nav.querySelector(".chapter-menu[open]");
      if (openMenu) {
        openMenu.open = false;
        openMenu.querySelector("summary").focus();
      }
    }
  });
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
})();
