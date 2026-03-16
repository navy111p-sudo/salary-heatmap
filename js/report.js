// js/report.js
document.addEventListener("DOMContentLoaded", () => {
  renderReportTables();
});

// ==================== Grade 자동 계산 함수 ====================
function calcGradeFromWeighted(weighted) {
  if (weighted >= 4.75) return "Outstanding";
  if (weighted >= 4.50) return "Very Satisfactory";
  if (weighted >= 3.50) return "Satisfactory";
  return "Needs Improvement";
}

function getGradeColor(grade) {
  switch (grade) {
    case "Outstanding": return "#10b981";
    case "Very Satisfactory": return "#3b82f6";
    case "Satisfactory": return "#6b7280";
    case "Needs Improvement": return "#ef4444";
    default: return "#000000";
  }
}

function getGradeBg(grade) {
  switch (grade) {
    case "Outstanding": return "#E2F9EE";
    case "Very Satisfactory": return "#E0EDFF";
    case "Satisfactory": return "#F0F0F0";
    case "Needs Improvement": return "#FDE8E8";
    default: return "#FFFFFF";
  }
}

function getGradeLabel(grade, lang) {
  const labels = {
    "Outstanding":        { ko: "최우수", en: "Outstanding", tl: "Pinakamahusay" },
    "Very Satisfactory":  { ko: "매우 우수", en: "Very Satisfactory", tl: "Napakahusay" },
    "Satisfactory":       { ko: "우수", en: "Satisfactory", tl: "Mahusay" },
    "Needs Improvement":  { ko: "개선 요망", en: "Needs Improvement", tl: "Kailangan Pagbutihin" }
  };
  const l = (typeof currentLang !== 'undefined') ? currentLang : 'ko';
  return labels[grade] ? labels[grade][lang || l] || grade : grade;
}

// ==================== 쉼표 포맷 헬퍼 ====================
function fmtNum(v, decimals) {
  const d = decimals !== undefined ? decimals : 2;
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

// ==================== 수업수 localStorage 관리 ====================
function loadLessons() {
  try {
    const stored = localStorage.getItem("mangoi_lessons");
    return stored ? JSON.parse(stored) : {};
  } catch(e) { return {}; }
}
function saveLessons(data) {
  localStorage.setItem("mangoi_lessons", JSON.stringify(data));
}

// ==================== i18n helpers ====================
function rptLang() {
  return (typeof currentLang !== 'undefined') ? currentLang : 'ko';
}
function rptT(key) {
  var dict = {
    "confirm_btn":   { ko: "\u2713 \uD655\uC778", en: "\u2713 Confirm", tl: "\u2713 Kumpirma" },
    "confirm_title": { ko: "\uBCC0\uACBD\uC0AC\uD56D \uC801\uC6A9", en: "Apply changes", tl: "Ilapat ang mga pagbabago" },
    "total_classes": { ko: "\uCD1D \uC218\uC5C5\uC218<br>(20\uBD84)", en: "Total Classes<br>(20min)", tl: "Kabuuang Klase<br>(20min)" }
  };
  var lang = rptLang();
  return dict[key] ? (dict[key][lang] || dict[key]["en"]) : key;
}

// ==================== 렌더릁 ====================
function renderReportTables() {
  if (typeof teachers === "undefined" || !teachers.length) return;
  const lessonsData = loadLessons();
  const scoreSummaryBody = document.getElementById("scoreSummaryBody");
  if (scoreSummaryBody) {
    scoreSummaryBody.innerHTML = "";
    teachers.forEach((t, index) => {
      const bgColor = index % 2 === 0 ? "#F5F5F5" : "#FFFFFF";
      const grade = calcGradeFromWeighted(t.weighted);
      const gradeColor = getGradeColor(grade);
      const gradeBg = getGradeBg(grade);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="color:#000000;font-size:10.0pt;text-align:general"></td>
        <td style="color:#000000;font-weight:bold;font-size:9.0pt;background:${bgColor};text-align:left;vertical-align:middle">${t.name}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${t.scores.inst.toFixed(1)}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${t.scores.ret.toFixed(1)}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${t.scores.punct.toFixed(1)}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${t.scores.admin.toFixed(1)}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${t.scores.contrib.toFixed(1)}</td>
        <td style="color:#000000;font-weight:bold;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${t.weighted.toFixed(2)}</td>
        <td style="color:${gradeColor};font-weight:bold;font-size:9.0pt;background:${gradeBg};text-align:center;vertical-align:middle">${grade}</td>
      `;
      scoreSummaryBody.appendChild(tr);
    });
  }
  const rateVerificationBody = document.getElementById("rateVerificationBody");
  let totalSalary = 0, totalClasses = 0, totalRateShown = 0, totalCalculated = 0;
  if (rateVerificationBody) {
    rateVerificationBody.innerHTML = "";
    teachers.forEach((t, index) => {
      const bgColor = index % 2 === 0 ? "#F5F5F5" : "#FFFFFF";
      const salary = t.salary || 0, rate = t.rate || 0;
      const classes = rate > 0 ? Math.floor(salary / rate) : 0;
      totalSalary += salary; totalClasses += classes;
      totalRateShown += rate; totalCalculated += rate;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="color:#000000;font-size:10.0pt;text-align:general"></td>
        <td style="color:#000000;font-weight:bold;font-size:9.0pt;background:${bgColor};text-align:left;vertical-align:middle">${t.name}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${fmtNum(salary)}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${classes}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${fmtNum(rate)}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">${fmtNum(rate)}</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">0</td>
        <td style="color:#000000;font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">OK</td>
        <td style="font-size:9.0pt;background:${bgColor};text-align:center;vertical-align:middle">0</td>
      `;
      rateVerificationBody.appendChild(tr);
    });
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="color:#000000;font-size:10.0pt"></td>
      <td style="font-weight:bold;font-size:9.0pt;background:#E8EEF4;text-align:right;vertical-align:middle">TOTAL</td>
      <td style="font-size:10.0pt;background:#E8EEF4;text-align:center">${fmtNum(totalSalary)}</td>
      <td style="font-size:10.0pt;background:#E8EEF4;text-align:center">${totalClasses}</td>
      <td style="font-size:10.0pt;background:#E8EEF4;text-align:center">${fmtNum(totalRateShown)}</td>
      <td style="font-size:10.0pt;background:#E8EEF4;text-align:center">${fmtNum(totalCalculated)}</td>
      <td style="font-size:10.0pt;background:#E8EEF4">0</td>
      <td style="font-weight:bold;font-size:9.0pt;background:#E8EEF4"></td>
      <td style="font-weight:bold;font-size:9.0pt;background:#E8EEF4">0</td>
    `;
    rateVerificationBody.appendChild(tr);
  }
  const top5OfficeBody = document.getElementById("top5OfficeBody");
  if (top5OfficeBody) {
    top5OfficeBody.innerHTML = "";
    teachers.filter(t => t.status === "office" && !t.name.includes("HT"))
      .sort((a, b) => b.weighted - a.weighted || b.years - a.years).slice(0, 5)
      .forEach((t, index) => {
        const bg = index % 2 === 0 ? "#FFF8E1" : index === 1 ? "#FFFFFF" : "#F5F5F5";
        const rc = index === 0 ? "#F9A825" : "#000000";
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-size:10.0pt"></td>
          <td style="color:${rc};font-weight:bold;font-size:11.0pt;background:${bg};text-align:center;vertical-align:middle">${index + 1}</td>
          <td style="font-weight:bold;font-size:9.0pt;background:${bg};text-align:left;vertical-align:middle">${t.name}</td>
          <td style="font-weight:bold;font-size:10.0pt;background:${bg};text-align:center">${t.weighted.toFixed(2)}</td>
          <td style="font-size:9.0pt;background:${bg};text-align:center">${t.years} Years</td>
          <td style="font-size:9.0pt;background:${bg};text-align:center">${t.grade}</td>
          <td style="font-size:9.0pt;background:${bg};text-align:center">Office</td>
          <td style="font-size:9.0pt;background:${bg};text-align:center">${fmtNum(t.rate || 0)}</td>
          <td style="font-size:9.0pt;background:${bg};text-align:center">${fmtNum(t.rate || 0)}</td>
          <td style="font-size:9.0pt;background:${bg};text-align:center">0</td>
          <td style="font-size:9.0pt;background:${bg};text-align:center">0</td>
        `;
        top5OfficeBody.appendChild(tr);
      });
  }
  const gradeSummaryBody = document.getElementById("gradeSummaryBody");
  if (gradeSummaryBody) {
    const gsTable = gradeSummaryBody.closest('table');
    if (gsTable && !gsTable.dataset.lessonsAdded) {
      gsTable.dataset.lessonsAdded = 'true';
      gsTable.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
          const cs = parseInt(cell.getAttribute('colspan') || '1');
          if (cs === 13) cell.setAttribute('colspan', '14');
          if (cs === 14) cell.setAttribute('colspan', '15');
        });
        cells.forEach(cell => {
          const txt = cell.textContent.trim();
          if (txt === 'MonthlySalary' || txt === 'Monthly Salary' || txt.includes('Monthly')) {
            if (cell.parentElement === row && !row.querySelector('.lessons-header')) {
              const newTd = document.createElement('td');
              newTd.className = 'lessons-header';
              newTd.setAttribute('style', 'color:#FFFFFF;font-weight:bold;font-size:8.0pt;background:#2B5797;text-align:center;vertical-align:middle;border:1px solid #1B3A6B');
              newTd.innerHTML = rptT('total_classes');
              cell.after(newTd);
            }
          }
        });
      });
    }
    gradeSummaryBody.innerHTML = "";
    teachers.forEach((t, index) => {
      const bgColor = index % 2 === 0 ? "#F7FAFF" : "#FFFFFF";
      const instC = "#1B3A6B", retC = "#FF0000";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-size:11.0pt"></td>
        <td style="font-size:11.0pt;background:${bgColor};text-align:center;vertical-align:middle">${index+1}</td>
        <td style="font-weight:bold;font-size:11.0pt;background:${bgColor};text-align:left;vertical-align:middle">${t.name}</td>
        <td style="font-size:11.0pt;background:${bgColor};text-align:center">${t.status}</td>
        <td style="font-size:11.0pt;background:${bgColor};text-align:center">${t.years}</td>
        <td style="color:${instC};font-weight:bold;font-size:11.0pt;background:#EEF4FF;text-align:center">${t.scores.inst.toFixed(1)}</td>
        <td style="color:${retC};font-weight:bold;font-size:11.0pt;background:#EEF4FF;text-align:center">${t.scores.ret.toFixed(1)}</td>
        <td style="color:${instC};font-weight:bold;font-size:11.0pt;background:#EEF4FF;text-align:center">${t.scores.punct.toFixed(1)}</td>
        <td style="color:${instC};font-weight:bold;font-size:11.0pt;background:#EEF4FF;text-align:center">${t.scores.admin.toFixed(1)}</td>
        <td style="color:${instC};font-weight:bold;font-size:11.0pt;background:#EEF4FF;text-align:center">${t.scores.contrib.toFixed(1)}</td>
        <td style="color:#1B3A6B;font-weight:bold;font-size:11.0pt;background:#D6E4F7;text-align:center">${t.weighted.toFixed(2)}</td>
        <td style="color:${getGradeColor(t.grade)};font-weight:bold;font-size:10.0pt;background:${getGradeBg(t.grade)};text-align:center">${t.grade}</td>
        <td class="salary-cell" data-teacher="${t.name}" style="font-size:11.0pt;background:${bgColor};text-align:right;vertical-align:middle">${fmtNum(t.salary || 0)}</td>
        <td style="background:${bgColor};text-align:center;vertical-align:middle;white-space:nowrap"><input type="number" step="0.5" min="0" value="${lessonsData[t.name] !== undefined ? lessonsData[t.name] : (t.rate > 0 ? (Math.round((t.salary || 0) / t.rate / 2 * 2) / 2) : 0)}" data-teacher="${t.name}" data-rate="${t.rate || 0}" class="lessons-input" style="width:50px;text-align:center;border:1px solid #ccc;border-radius:4px;padding:2px 4px;font-size:10pt;" placeholder="0" data-original="${lessonsData[t.name] !== undefined ? lessonsData[t.name] : (t.rate > 0 ? (Math.round((t.salary || 0) / t.rate / 2 * 2) / 2) : 0)}"><button class="btn-confirm-lessons" data-teacher="${t.name}" title="${rptT('confirm_title')}" style="display:none;cursor:pointer;background:#10b981;color:#fff;border:none;border-radius:4px;font-size:11px;font-weight:bold;padding:2px 10px;margin-left:4px;">${rptT('confirm_btn')}</button></td>
        <td style="font-size:11.0pt;background:${bgColor};text-align:right;vertical-align:middle">${fmtNum(t.rate || 0)}</td>
      `;
      gradeSummaryBody.appendChild(tr);
    });
    // 수업수 input 변경 시: 확인 버튼만 표시
    gradeSummaryBody.addEventListener('input', function(e) {
      if (e.target.classList.contains('lessons-input')) {
        var input = e.target;
        var btn = input.nextElementSibling;
        var originalVal = parseFloat(input.dataset.original) || 0;
        var currentVal = parseFloat(input.value) || 0;
        if (currentVal !== originalVal) {
          input.style.background = '#FFF3CD';
          input.style.border = '2px solid #f59e0b';
          input.style.fontWeight = 'bold';
          if (btn) btn.style.display = 'inline-block';
        } else {
          input.style.background = '';
          input.style.border = '1px solid #ccc';
          input.style.fontWeight = '';
          if (btn) btn.style.display = 'none';
        }
      }
    });
    // 확인 버튼 클릭 시: salary 업데이트 + localStorage 저장
    gradeSummaryBody.addEventListener('click', function(e) {
      if (e.target.classList.contains('btn-confirm-lessons')) {
        var btn = e.target;
        var teacherName = btn.dataset.teacher;
        var input = gradeSummaryBody.querySelector('.lessons-input[data-teacher="' + teacherName + '"]');
        var rate = parseFloat(input.dataset.rate) || 0;
        var val = parseFloat(input.value);
        if (!isNaN(val) && val >= 0) {
          var data = loadLessons();
          data[teacherName] = val;
          var newSalary = val * rate * 2;
          var salaryCell = gradeSummaryBody.querySelector('.salary-cell[data-teacher="' + teacherName + '"]');
          if (salaryCell) {
            salaryCell.textContent = fmtNum(newSalary);
            salaryCell.style.transition = 'background 0.5s';
            salaryCell.style.backgroundColor = '#D1FAE5';
            setTimeout(function() { salaryCell.style.backgroundColor = ''; }, 2000);
          }
          saveLessons(data);
          input.dataset.original = val;
          input.style.background = '';
          input.style.border = '1px solid #ccc';
          input.style.fontWeight = '';
          input.style.borderColor = '#10b981';
          setTimeout(function() { input.style.borderColor = '#ccc'; }, 1500);
          btn.style.display = 'none';
        }
      }
    })
  }
}

// ==================== i18n dynamic update ====================
window.updateReportI18n = function() {
  if (typeof rptT !== "function") return;
  var header = document.querySelector(".lessons-header");
  if (header) header.innerHTML = rptT("total_classes");
  var btns = document.querySelectorAll(".btn-confirm-lessons");
  for (var i = 0; i < btns.length; i++) {
    btns[i].textContent = rptT("confirm_btn");
    btns[i].setAttribute("title", rptT("confirm_title"));
  }
};

window.updateReportFromStorage = function () {
  const stored = localStorage.getItem("mangoi_teachers");
  if (stored) window.teachers = JSON.parse(stored);
  renderReportTables();
};
