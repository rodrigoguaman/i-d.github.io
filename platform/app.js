const chapters = window.IDHUB_CHAPTERS || [];
const chapterGrid = document.querySelector("#chapterGrid");

function renderChapterGrid() {
  if (!chapterGrid) return;

  chapterGrid.innerHTML = chapters.map((chapter) => `
    <article class="chapter-card">
      <span class="unit-pill">Unidad ${chapter.unit}</span>
      <h3>${chapter.title}</h3>
      <p>${chapter.description}</p>
      <ul>
        ${chapter.subtopics.map((topic) => `<li><strong>${topic.code}</strong> ${topic.title}</li>`).join("")}
      </ul>
      <a class="button-link" href="${chapter.page}">Abrir capítulo</a>
    </article>
  `).join("");
}

renderChapterGrid();
