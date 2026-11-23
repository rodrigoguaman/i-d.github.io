(() => {
  const history = window.IDHUB_MARKET_HISTORY || {};
  const cases = {
    ipod: { name: "Apple", symbol: "AAPL", exchange: "NASDAQ", note: "Cotización de Apple, no ventas de iPod. La fuente disponible comienza en diciembre de 1984, después de la salida a bolsa de 1980." },
    kodak: { name: "Eastman Kodak", symbol: "KODK", exchange: "NYSE", note: "Cotización de la empresa reorganizada, no ventas de película fotográfica. La serie disponible empieza en 2013; las acciones anteriores se cancelaron durante la reorganización." },
    pfizer: { name: "Pfizer", symbol: "PFE", exchange: "NYSE", note: "Cotización de Pfizer, no ingresos ni dosis de Comirnaty. La evolución bursátil refleja muchos negocios y factores." },
    blackberry: { name: "BlackBerry", symbol: "BB", exchange: "NYSE", note: "Cotización de BlackBerry, no unidades vendidas de teléfonos. La empresa y su actividad han cambiado durante el periodo." }
  };
  const money = (n) => new Intl.NumberFormat("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const date = (d) => new Intl.DateTimeFormat("es-EC", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(d + "T00:00:00Z"));

  document.querySelectorAll(".history-chart").forEach((container) => {
    const item = cases[container.dataset.series];
    const data = history[container.dataset.series];
    if (!item || !data || !data.points.length) return;
    const points = data.points;
    const last = points[points.length - 1];
    const interval = data.interval === "3mo" ? "trimestral" : data.interval === "1mo" ? "mensual" : data.interval;
    const finance = `https://finance.yahoo.com/quote/${item.symbol}/history/`;
    container.innerHTML = `
      <div class="history-chart__head"><div><p class="history-chart__eyebrow">MERCADO · ${item.exchange}:${item.symbol}</p><h5>${item.name}</h5></div><span>USD por acción</span></div>
      <p class="history-chart__value" aria-live="polite"></p>
      <p class="history-chart__eyebrow">Instantánea histórica · último registro: ${date(last.date)}</p>
      <div class="history-chart__plot"><canvas role="img" aria-label="Cotización histórica de ${item.name}; consulta la tabla de datos para valores y fechas"></canvas></div>
      <div class="history-chart__controls" aria-label="Periodo de la gráfica"><button type="button" data-window="1" aria-pressed="false">1 año</button><button type="button" data-window="5" aria-pressed="false">5 años</button><button type="button" data-window="10" aria-pressed="false">10 años</button><button type="button" data-window="all" aria-pressed="true">Máx.</button></div>
      <p class="history-chart__note">${item.note}</p>
      <p class="history-chart__note">Fuente: Yahoo Finance, intervalo ${interval}; fecha mostrada según el inicio del periodo registrado por el proveedor. Último punto potencialmente incompleto o intradía. Valores de cierre proporcionados por la fuente; no incluyen dividendos reinvertidos. Instantánea local, no datos en vivo.</p>
      <details><summary>Ver datos y fuente</summary><div class="table-wrap history-chart__table"><table><thead><tr><th>Fecha del periodo</th><th>Cierre (USD)</th></tr></thead><tbody></tbody></table></div><p><a href="${finance}">Consultar historial en Yahoo Finance</a></p></details>
    `;
    const canvas = container.querySelector("canvas");
    const value = container.querySelector(".history-chart__value");
    const buttons = container.querySelectorAll("[data-window]");
    const tbody = container.querySelector("tbody");
    const table = document.createDocumentFragment();
    points.forEach((point) => {
      const row = document.createElement("tr");
      const period = document.createElement("th");
      const close = document.createElement("td");
      period.textContent = date(point.date);
      close.textContent = money(point.value);
      row.append(period, close);
      table.append(row);
    });
    tbody.append(table);
    if (typeof Chart === "undefined") {
      canvas.parentElement.hidden = true;
      value.textContent = "La gráfica no está disponible; consulta la tabla de datos.";
      container.querySelector("details").open = true;
      buttons.forEach((button) => { button.disabled = true; });
      return;
    }
    const chart = new Chart(canvas, {
      type: "line",
      data: { labels: [], datasets: [{ data: [], borderColor: "#005eb8", backgroundColor: "rgba(0,94,184,0.10)", fill: true, pointRadius: 0, pointHitRadius: 12, pointHoverRadius: 5, borderWidth: 2, tension: 0 }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `Cierre: ${money(context.parsed.y)} USD` } } },
        scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 5, maxRotation: 0, callback(value) { return this.getLabelForValue(value).slice(-4); } } }, y: { ticks: { callback: (tick) => money(tick) }, grid: { color: "#dce5ee" } } }
      }
    });
    function render(windowName) {
      const cutoff = new Date(last.date + "T00:00:00Z");
      if (windowName !== "all") cutoff.setUTCFullYear(cutoff.getUTCFullYear() - Number(windowName));
      let visible = windowName === "all" ? points : points.filter((point) => point.date >= cutoff.toISOString().slice(0, 10));
      if (!visible.length) visible = points.slice(-1);
      const first = visible[0], end = visible[visible.length - 1];
      const change = first.value ? (end.value - first.value) / first.value * 100 : null;
      value.textContent = `${money(end.value)} USD · ${change === null ? "sin variación calculable" : (change >= 0 ? "+" : "") + money(change) + " %"} desde ${date(first.date)}`;
      chart.data.labels = visible.map((point) => date(point.date));
      chart.data.datasets[0].data = visible.map((point) => point.value);
      chart.update();
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.window === windowName)));
    }
    buttons.forEach((button) => button.addEventListener("click", () => render(button.dataset.window)));
    render("all");
  });
})();
