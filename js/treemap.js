// js/treemap.js
// Squarified treemap algorithm with multi-currency support (KRW / USD / PHP)

// ââ Currency config per language ââ
// ko = KRW, en = USD, tl = PHP (original, no conversion)
let exchangeRates = { KRW: 25.15, USD: 0.0175 }; // defaults
let rateLoaded = false;

function getLang() {
  return localStorage.getItem("mangoi_lang") || "ko";
}

function fetchExchangeRate() {
  return fetch("https://open.er-api.com/v6/latest/PHP")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data && data.rates) {
        if (data.rates.KRW) exchangeRates.KRW = data.rates.KRW;
        if (data.rates.USD) exchangeRates.USD = data.rates.USD;
        rateLoaded = true;
      }
    })
    .catch(function () {
      rateLoaded = true;
    });
}

// Convert PHP amount to current currency
function convertAmount(peso) {
  var lang = getLang();
  if (lang === "tl") return peso;                        // PHP (no conversion)
  if (lang === "en") return Math.round(peso * exchangeRates.USD * 100) / 100; // USD
  return Math.round(peso * exchangeRates.KRW);           // KRW
}

// Format amount with currency symbol
function fmtCurrency(val) {
  var lang = getLang();
  if (lang === "tl") return "\u20B1" + val.toLocaleString("en-PH");               // â±
  if (lang === "en") return "$" + val.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2}); // $
  return "\u20A9" + val.toLocaleString("ko-KR");                                   // â©
}

// Format converted amount (shorthand)
function fmtSalary(peso) {
  return fmtCurrency(convertAmount(peso));
}

// Currency label for summary bar
function currencyLabel() {
  var lang = getLang();
  if (lang === "tl") return "PHP";
  if (lang === "en") return "USD";
  return "KRW";
}

// Exchange rate info for tooltip
function rateInfo() {
  var lang = getLang();
  if (lang === "tl") return "";
  if (lang === "en") return "1 PHP = " + exchangeRates.USD.toFixed(4) + " USD";
  return "1 PHP = " + exchangeRates.KRW.toFixed(2) + " KRW";
}

// Group header label (translated)
function groupLabel(label) {
  var lang = getLang();
  if (lang === "en") {
    if (/OFFICE/i.test(label)) return "OFFICE";
    if (/HOME/i.test(label)) return "HOME-BASED";
    return label;
  }
  if (lang === "tl") {
    if (/OFFICE/i.test(label)) return "OFFICE";
    if (/HOME/i.test(label)) return "HOME-BASED";
    return label;
  }
  // ko
  if (/OFFICE/i.test(label)) return "OFFICE \uADFC\uBB34";
  if (/HOME/i.test(label)) return "HOME \uADFC\uBB34";
  return label;
}

// Tooltip labels per language
function tooltipLabels() {
  var lang = getLang();
  if (lang === "tl") return {
    salary: "Buwanang Sweldo",
    rate: "Rate / 10 min",
    grade: "Grado",
    weighted: "Weighted Score",
    workType: "Uri ng Trabaho"
  };
  if (lang === "en") return {
    salary: "Monthly Salary",
    rate: "Rate / 10 min",
    grade: "Grade",
    weighted: "Weighted Score",
    workType: "Work Type"
  };
  return {
    salary: "\uC6D4 \uAE09\uC5EC",
    rate: "10\uBD84\uB2F9 \uB2E8\uAC00",
    grade: "\uB4F1\uAE09",
    weighted: "\uAC00\uC911 \uC810\uC218",
    workType: "\uADFC\uBB34 \uD615\uD0DC"
  };
}

// Summary bar labels
function summaryLabels() {
  var lang = getLang();
  if (lang === "tl") return { total: "Kabuuang Guro", totalSal: "Kabuuang Sweldo", avg: "Average" };
  if (lang === "en") return { total: "Total Teachers", totalSal: "Total Salary", avg: "Average" };
  return { total: "\uCD1D \uAD50\uC0AC \uC218", totalSal: "\uCD1D \uAE09\uC5EC", avg: "\uD3C9\uADE0" };
}

// ââ Squarify algorithm ââ
function squarify(items, x, y, w, h) {
  if (items.length === 0) return [];
  if (items.length === 1) {
    items[0]._x = x;
    items[0]._y = y;
    items[0]._w = w;
    items[0]._h = h;
    return items;
  }

  var total = items.reduce(function (s, i) { return s + i._area; }, 0);
  var sorted = items.slice().sort(function (a, b) { return b._area - a._area; });

  var result = [];
  layoutRow(sorted, 0, x, y, w, h, total, result);
  return result;
}

function layoutRow(items, start, x, y, w, h, totalArea, result) {
  if (start >= items.length) return;
  if (start === items.length - 1) {
    items[start]._x = x;
    items[start]._y = y;
    items[start]._w = w;
    items[start]._h = h;
    result.push(items[start]);
    return;
  }

  var horizontal = w >= h;
  var rowItems = [items[start]];
  var rowArea = items[start]._area;
  var bestRatio = worstRatio(
    rowItems, rowArea, totalArea,
    horizontal ? w : h, horizontal ? h : w
  );

  for (var i = start + 1; i < items.length; i++) {
    var testItems = rowItems.concat([items[i]]);
    var testArea = rowArea + items[i]._area;
    var ratio = worstRatio(
      testItems, testArea, totalArea,
      horizontal ? w : h, horizontal ? h : w
    );
    if (ratio <= bestRatio) {
      rowItems.push(items[i]);
      rowArea = testArea;
      bestRatio = ratio;
    } else break;
  }

  var rowFrac = rowArea / totalArea;
  var cx = x, cy = y;

  if (horizontal) {
    var rowW = w * rowFrac;
    rowItems.forEach(function (item) {
      var frac = item._area / rowArea;
      item._x = cx; item._y = cy;
      item._w = rowW; item._h = h * frac;
      cy += item._h;
      result.push(item);
    });
    layoutRow(items, start + rowItems.length, x + rowW, y, w - rowW, h, totalArea - rowArea, result);
  } else {
    var rowH = h * rowFrac;
    rowItems.forEach(function (item) {
      var frac = item._area / rowArea;
      item._x = cx; item._y = cy;
      item._w = w * frac; item._h = rowH;
      cx += item._w;
      result.push(item);
    });
    layoutRow(items, start + rowItems.length, x, y + rowH, w, h - rowH, totalArea - rowArea, result);
  }
}

function worstRatio(items, rowArea, totalArea, side, otherSide) {
  var rowFrac = rowArea / totalArea;
  var worst = 0;
  items.forEach(function (item) {
    var frac = item._area / rowArea;
    var w = side * rowFrac;
    var h = otherSide * frac;
    var ratio = Math.max(w / h, h / w);
    if (ratio > worst) worst = ratio;
  });
  return worst;
}

// ââ UI Rendering ââ
function renderTreemap() {
  var sortBy = document.getElementById("sort-dropdown").value;
  var groupByVal = document.getElementById("group-dropdown").value;

  var sorted = sortTeachers(teachers, sortBy);
  var groups = groupTeachers(sorted, groupByVal);

  var container = document.getElementById("treemap-container");
  container.innerHTML = "";
  // Apply display:flex directly via inline style (bypass Tailwind CDN timing)
  container.style.display = "flex";
  container.style.gap = "8px";

  var totalSalary = teachers.reduce(function (s, t) { return s + t.salary; }, 0);

  // Render Legend
  var legendContainer = document.getElementById("legend-container");
  if (legendContainer.innerHTML.trim() === "") {
    var legendHTML = Object.keys(gradeColor)
      .map(function (grade) {
        return '<div style="display:flex; align-items:center; gap:4px">' +
          '<div style="width:12px; height:12px; border-radius:2px; background-color:' + gradeColor[grade] + '"></div>' +
          '<span style="color:#4b5563">' + grade + '</span></div>';
      })
      .join("");
    legendContainer.innerHTML = legendHTML;
  }

  // CSS Styling inject (hover effects & tooltip only)
  if (!document.getElementById("treemap-styles")) {
    var style = document.createElement("style");
    style.id = "treemap-styles";
    style.textContent = "\n" +
      ".treemap__cell:hover { filter: brightness(1.1); z-index: 10; transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }\n" +
      ".treemap__tooltip { display: none; position: fixed; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; font-size: 12px; z-index: 1000; pointer-events: none; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); min-width: 220px; color: #374151; }\n" +
      ".treemap__tooltip.visible { display: block; }\n";
    document.head.appendChild(style);
  }

  // Build all groups first (ALL inline styles â no Tailwind classes on dynamic elements)
  var groupData = [];
  groups.forEach(function (group) {
    var groupSalary = group.teachers.reduce(function (s, t) { return s + t.salary; }, 0);
    var groupFrac = groupSalary / totalSalary;

    var groupEl = document.createElement("div");
    groupEl.style.cssText = "display:flex; flex-direction:column; border-radius:4px; overflow:hidden; background:#f9fafb; flex:" + groupFrac + "; min-width:0;";

    var headerEl = document.createElement("div");
    headerEl.style.cssText = "padding:4px 12px; font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid #e5e7eb;";
    headerEl.textContent = groupLabel(group.label) + " \u2014 " + fmtSalary(groupSalary);
    groupEl.appendChild(headerEl);

    var bodyEl = document.createElement("div");
    bodyEl.style.cssText = "flex:1; padding:4px; position:relative; overflow:hidden;";
    groupEl.appendChild(bodyEl);
    container.appendChild(groupEl);

    groupData.push({ group: group, bodyEl: bodyEl });
  });

  // Force layout so getBoundingClientRect returns correct values
  void container.offsetHeight;

  groupData.forEach(function (gd) {
    var bodyEl = gd.bodyEl;
    var group = gd.group;
    var rect = bodyEl.getBoundingClientRect();
    var W = rect.width - 8;
    var H = rect.height - 8;

    if (W <= 0 || H <= 0) return;

    var items = group.teachers.map(function (t) { return Object.assign({}, t, { _area: t.salary }); });
    squarify(items, 4, 4, W, H);

    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      var cell = document.createElement("div");
      cell.className = "treemap__cell";
      cell.style.cssText = "position:absolute; border-radius:4px; color:white; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:4px; cursor:pointer; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(0,0,0,0.1); transition:filter 0.2s, transform 0.2s, box-shadow 0.2s;" +
        "left:" + item._x + "px;" +
        "top:" + item._y + "px;" +
        "width:" + Math.max(item._w - 2, 0) + "px;" +
        "height:" + Math.max(item._h - 2, 0) + "px;" +
        "background-color:" + (gradeColor[item.grade] || "#6b7280") + ";";

      var cw = item._w;
      var ch = item._h;
      var nameSize = Math.max(10, Math.min(18, Math.floor(Math.min(cw, ch) / 4.5)));
      var descSize = Math.max(9, nameSize - 4);

      var html = '<div style="font-weight:bold; font-size:' + nameSize + 'px; text-shadow:0 1px 2px rgba(0,0,0,0.2)">' + item.name + '</div>';
      if (cw > 60 && ch > 40) {
        html += '<div style="font-size:' + descSize + 'px; opacity:0.9">' + fmtSalary(item.salary) + '</div>';
      }
      if (cw > 80 && ch > 60) {
        html += '<div style="font-size:' + (descSize - 1) + 'px; opacity:0.8; margin-top:2px">' + item.grade + '</div>';
      }

      cell.innerHTML = html;
      cell.addEventListener("mouseenter", function (e) { showTooltip(e, item); });
      cell.addEventListener("mousemove", moveTooltip);
      cell.addEventListener("mouseleave", hideTooltip);
      frag.appendChild(cell);
    });
    bodyEl.appendChild(frag);
  });

  // Update Summary bar
  var lbl = summaryLabels();
  var cur = currencyLabel();
  var totalConverted = convertAmount(totalSalary);
  var avgConverted = getLang() === "en"
    ? Math.round(totalConverted / teachers.length * 100) / 100
    : Math.round(totalConverted / teachers.length);

  document.getElementById("total-count").textContent = teachers.length;

  var totalFmt = getLang() === "en"
    ? totalConverted.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})
    : totalConverted.toLocaleString("ko-KR");
  var avgFmt = getLang() === "en"
    ? avgConverted.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})
    : avgConverted.toLocaleString("ko-KR");

  document.getElementById("total-salary").textContent = totalFmt;
  document.getElementById("avg-salary").textContent = avgFmt;

  // Update summary bar text labels
  var summaryBar = document.getElementById("summary-bar");
  if (summaryBar) {
    summaryBar.innerHTML = lbl.total + ': <span id="total-count">' + teachers.length + '</span> | ' +
      lbl.totalSal + ': <span id="total-salary">' + totalFmt + '</span> ' + cur + ' | ' +
      lbl.avg + ': <span id="avg-salary">' + avgFmt + '</span> ' + cur;
  }
}

// ââ Tooltip ââ
var tooltipEl = document.getElementById("treemap-tooltip");
if (!tooltipEl) {
  tooltipEl = document.createElement("div");
  tooltipEl.id = "treemap-tooltip";
  tooltipEl.className = "treemap__tooltip";
  document.body.appendChild(tooltipEl);
}

function showTooltip(e, t) {
  var lbl = tooltipLabels();
  var ri = rateInfo();
  var rateFooter = ri ? '<div style="margin-top:4px; font-size:9px; color:#d1d5db">' + ri + '</div>' : '';
  var rowStyle = 'style="display:flex; justify-content:space-between; margin:4px 0"';
  var labelStyle = 'style="color:#6b7280"';
  var valStyle = 'style="font-weight:600"';

  tooltipEl.innerHTML =
    '<div style="font-weight:700; font-size:16px; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #e5e7eb; color:' + gradeColor[t.grade] + '">' + t.name + '</div>' +
    '<div ' + rowStyle + '><span ' + labelStyle + '>' + lbl.salary + '</span><span ' + valStyle + '>' + fmtSalary(t.salary) + '</span></div>' +
    '<div ' + rowStyle + '><span ' + labelStyle + '>' + lbl.rate + '</span><span ' + valStyle + '>' + fmtSalary(t.rate) + '</span></div>' +
    '<div ' + rowStyle + '><span ' + labelStyle + '>' + lbl.grade + '</span><span ' + valStyle + ' style="font-weight:600; color:' + gradeColor[t.grade] + '">' + t.grade + '</span></div>' +
    '<div ' + rowStyle + '><span ' + labelStyle + '>' + lbl.weighted + '</span><span ' + valStyle + '>' + t.weighted + '</span></div>' +
    '<div ' + rowStyle + '><span ' + labelStyle + '>' + lbl.workType + '</span><span ' + valStyle + '>' + t.status.toUpperCase() + '</span></div>' +
    '<div style="margin-top:8px; padding-top:8px; border-top:1px solid #e5e7eb; font-size:10px; color:#9ca3af">' +
    'Inst.(' + t.scores.inst + ') \u00b7 Ret.(' + t.scores.ret + ') \u00b7 Punct.(' + t.scores.punct + ') \u00b7 Admin(' + t.scores.admin + ') \u00b7 Contrib.(' + t.scores.contrib + ')' +
    '</div>' +
    rateFooter;
  tooltipEl.classList.add("visible");
  moveTooltip(e);
}

function moveTooltip(e) {
  var x = e.clientX + 16;
  var y = e.clientY + 16;
  var rect = tooltipEl.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) x = e.clientX - rect.width - 16;
  if (y + rect.height > window.innerHeight) y = e.clientY - rect.height - 16;
  tooltipEl.style.left = x + "px";
  tooltipEl.style.top = y + "px";
}

function hideTooltip() {
  tooltipEl.classList.remove("visible");
}

// ââ Init ââ
document.getElementById("sort-dropdown").addEventListener("change", renderTreemap);
document.getElementById("group-dropdown").addEventListener("change", renderTreemap);
window.addEventListener("resize", renderTreemap);

// Listen for language changes (i18n sets mangoi_lang in localStorage)
window.addEventListener("storage", function (e) {
  if (e.key === "mangoi_lang") renderTreemap();
});

// Also observe lang label changes for same-tab switching
var _langObserver = new MutationObserver(function () { renderTreemap(); });
var _langLabel = document.getElementById("currentLangLabel");
if (_langLabel) {
  _langObserver.observe(_langLabel, { childList: true, characterData: true, subtree: true });
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("treemap-container")) {
    fetchExchangeRate().then(function () {
      renderTreemap();
    });
  }
});
