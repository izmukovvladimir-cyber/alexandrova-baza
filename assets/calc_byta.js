/* Калькулятор «Линия Быта»: дата → психоматрица → сколько цифр 4, 5, 6 и расшифровка.
   Тексты из постов канала t.me/Allaaleksandrova 1403, 1411-1413, 1417. */
(function () {
  "use strict";
  var PM = window.PM;
  var LINE = {
    0: ["Пустая линия: скрытый козырь", "Деньги ради самих денег вас не зажигают. Работать только ради зарплаты тяжело, копить «на чёрный день» скучно. Зато в любимом деле вы становитесь экспертом, и люди готовы за это платить. Ваш путь к деньгам идёт через то, что вас увлекает."],
    1: ["Одна цифра", "Вам не очень интересно зарабатывать деньги ради самих денег. Зарабатывать вы будете, просто мотивируют вас другие вещи: любимая работа, чувство долга, стремление к комфортной жизни. Заботы о быте могут быть для вас не самым приятным занятием."],
    2: ["Две цифры", "Вы понимаете, что нужно зарабатывать, чтобы обеспечивать себя и семью. Можете соглашаться на любую работу ради стабильности, даже если она не по душе. Иногда это мешает заниматься тем, что действительно нравится."],
    3: ["Три цифры", "Отношение к деньгам колеблется между бережливостью и расточительностью. Можете долго копить, а потом всё потратить. Работаете импульсно: зарабатываете на определённый период, после чего отдыхаете. Вам может подойти проектная работа."],
    4: ["Четыре или пять цифр", "Вы очень заботитесь о финансовом благополучии семьи, независимость в деньгах для вас очень важна. Иногда из-за этого забываете о себе, своих увлечениях, о друзьях. Обычно у вас всегда есть деньги, даже если зарабатываете не очень много: вы умеете ими распоряжаться."],
    6: ["Шесть и больше: перегруженная линия", "Вы трудоголик. Работаете на износ, быстро устаёте и можете потерять интерес к работе. Иногда делаете много всего, но это не приносит желаемого результата. Важно найти баланс и делать то, что приносит радость, даже если это не даёт немедленной выгоды."]
  };
  var SIX_TAIL = " Шестёрка это мастерство и упорный труд: умение доводить дело до совершенства, которое превращается в стабильный доход.";
  var SIX = {
    1: ["Одна шестёрка", "Вы чувствительны к финансовым возможностям и ищете свои уникальные пути к заработку." + SIX_TAIL],
    2: ["Две шестёрки", "Сильнее инстинкт самосохранения: вы избегаете рискованных вложений и просчитываете шаги наперёд." + SIX_TAIL],
    3: ["Три шестёрки и больше", "Предпринимательская жилка: умение зарабатывать и создавать собственный бизнес." + SIX_TAIL]
  };

  var form = document.getElementById("byta-form");
  var check = PM.dateField(document.getElementById("date-a"));
  var res = document.getElementById("byta-result");

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var p = check();
    if (!p) { res.hidden = true; return; }
    var r = PM.matrix(p.d, p.m, p.y);
    var c = r.cells;

    document.getElementById("byta-date").textContent = PM.fmt(p);
    document.getElementById("byta-dops").textContent = r.dops.join(" · ");
    var grid = document.getElementById("byta-grid");
    grid.innerHTML = "";
    [1, 4, 7, 2, 5, 8, 3, 6, 9].forEach(function (k) {
      var cell = PM.el("div", (c[k] ? "" : "empty") + ([4, 5, 6].indexOf(k) >= 0 ? " byta-hl" : ""));
      cell.appendChild(PM.el("i", null, String(k)));
      cell.appendChild(document.createTextNode(c[k] ? new Array(c[k] + 1).join(String(k)) : "пусто"));
      grid.appendChild(cell);
    });

    var n = c[4] + c[5] + c[6];
    var key = n >= 6 ? 6 : n >= 4 ? 4 : n;
    document.getElementById("byta-n").textContent = String(n);
    document.getElementById("byta-t").textContent = LINE[key][0];
    document.getElementById("byta-p").textContent = LINE[key][1];

    var six = document.getElementById("byta-six");
    if (c[6]) {
      var s = SIX[Math.min(c[6], 3)];
      document.getElementById("byta-six-t").textContent = s[0];
      document.getElementById("byta-six-p").textContent = s[1];
      six.hidden = false;
    } else {
      six.hidden = true;
    }
    res.hidden = false;
    res.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
