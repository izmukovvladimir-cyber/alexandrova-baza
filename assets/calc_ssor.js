/* Калькулятор «Ваш сценарий ссор». Считает двойки в психоматрице двух людей. Без зависимостей.
   Расчёт повторяет tools/psychomatrix.py: дата d m yyyy без ведущих нулей, I = сумма цифр,
   II = сумма цифр I, III = |I - 2 * первая цифра записи|, IV = сумма цифр III, нули не считаются. */
(function () {
  "use strict";

  var SITE = "alexandrova-baza.ru";
  var WEBINAR = "https://alexandrova-numerology.com/sait_relation?utm_source=instagram&utm_medium=calculator&utm_campaign=calc_ssor";

  function digitSum(n) {
    return String(n).split("").reduce(function (s, c) { return s + Number(c); }, 0);
  }

  function matrix(d, m, y) {
    var top = String(d) + String(m) + String(y);
    var i1 = digitSum(top);
    var i2 = digitSum(i1);
    var i3 = Math.abs(i1 - 2 * Number(top[0]));
    var i4 = digitSum(i3);
    var all = top + i1 + i2 + i3 + i4;
    var cells = {};
    for (var k = 1; k <= 9; k++) cells[k] = all.split(String(k)).length - 1;
    return { dops: [i1, i2, i3, i4], cells: cells, twos: cells[2] };
  }

  function pairType(a, b) {
    if (Math.max(a, b) >= 3) return "fire";
    if (a === 0 && b === 0) return "spain";
    if (a === 2 && b === 2) return "cold";
    return "swing";
  }

  var TYPES = {
    fire: {
      name: "Всплесковый огонь",
      text: [
        "Три двойки и больше дают паре много энергии, и выходит она вспышками.",
        "Поэтому ссоры у вас яркие: если ругаться, то от души."
      ],
      short: "Если ругаться, то от души."
    },
    spain: {
      name: "Испанские страсти",
      text: [
        "Двоек нет у обоих, поэтому энергию вы берёте друг у друга.",
        "Отсюда ссоры на ровном месте.",
        "Начали с «Почему кружка стоит здесь?», а через пять минут звучит «Ты меня никогда не любил»."
      ],
      short: "Ссоры на ровном месте, даже из-за кружки."
    },
    cold: {
      name: "Холодная война",
      text: [
        "У каждого по две двойки, и энергии в паре хватает.",
        "Поэтому ссоритесь вы тихо: обиделись и разошлись по комнатам.",
        "Молчать так можете сутками."
      ],
      short: "Обиделись, разошлись по комнатам и молчите."
    },
    swing: {
      name: "Энергетические качели",
      text: [
        "Энергии на двоих не хватает, и один в паре её отдаёт, другой берёт.",
        "В школе про такую пару говорят: донор и тот, кто берёт энергию.",
        "У кого двоек меньше, тот добирает энергию у партнёра."
      ],
      textEqual: [
        "У каждого из вас по одной двойке, и энергии на двоих не хватает.",
        "В школе про такую пару говорят: донор и тот, кто берёт энергию.",
        "Одну двойку в школе называют дефицитом энергии, и у вас он у обоих."
      ],
      short: "Один отдаёт энергию, другой её берёт."
    }
  };

  var MORE = "Двойки показывают только энергию пары. Кто в паре делает первый шаг и как вам договориться, видно по единицам, линии семьи и допчислам. Это разбирают на бесплатном эфире «Отношения».";

  function plural(n) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return "двойка";
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "двойки";
    return "двоек";
  }

  function countLine(a, b) {
    if (a === 0 && b === 0) return "Двоек нет ни у вас, ни у партнёра";
    var you = a ? a + " " + plural(a) : "двоек нет";
    var them = b ? String(b) : "ни одной";
    return "У вас " + you + ", у партнёра " + them;
  }

  function result(da, db) {
    var a = matrix(da.d, da.m, da.y).twos;
    var b = matrix(db.d, db.m, db.y).twos;
    var key = pairType(a, b);
    var t = TYPES[key];
    var text = key === "swing" && a === b && t.textEqual ? t.textEqual : t.text;
    return { a: a, b: b, key: key, name: t.name, text: text, short: t.short, line: countLine(a, b), more: MORE };
  }

  /* Разбор даты: 15.01.1992, 15.1.1992, 15/1/1992, 15011992 */
  function parseDate(s) {
    var v = String(s || "").trim();
    var p = v.split(/[.\/\-\s,]+/).filter(Boolean);
    if (p.length === 1 && /^\d{8}$/.test(p[0])) p = [p[0].slice(0, 2), p[0].slice(2, 4), p[0].slice(4)];
    if (p.length !== 3 || !p.every(function (x) { return /^\d+$/.test(x); })) return null;
    var d = Number(p[0]), m = Number(p[1]), y = Number(p[2]);
    if (p[2].length !== 4) return null;
    var now = new Date();
    if (y < 1900 || y > now.getFullYear() || m < 1 || m > 12 || d < 1) return null;
    var dt = new Date(y, m - 1, d);
    if (dt.getMonth() !== m - 1 || dt.getDate() !== d || dt > now) return null;
    return { d: d, m: m, y: y };
  }

  var api = { matrix: matrix, pairType: pairType, result: result, parseDate: parseDate, countLine: countLine };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  /* ---------- страница ---------- */
  var form = document.getElementById("ssor-form");
  if (!form) return;
  var inA = document.getElementById("date-a");
  var inB = document.getElementById("date-b");
  var box = document.getElementById("ssor-result");
  var state = { blob: null, url: "", res: null };

  /* Маска дд.мм.гггг: точки ставятся сами, точка после одной цифры добавляет ноль впереди */
  function mask(v) {
    var segs = [""], max = [2, 2, 4];
    for (var i = 0; i < v.length && segs.length <= 3; i++) {
      var c = v[i], n = segs.length - 1;
      if (/\d/.test(c)) {
        if (segs[n].length >= max[n]) { if (n === 2) break; segs.push(""); n++; }
        segs[n] += c;
        if (n < 2 && segs[n].length === max[n]) segs.push("");
      } else if (/[.\/\-\s,]/.test(c) && n < 2 && segs[n].length) {
        if (segs[n].length === 1) segs[n] = "0" + segs[n];
        if (segs[n].length === max[n]) segs.push("");
      }
    }
    return segs.slice(0, 3).join(".");
  }

  [inA, inB].forEach(function (el) {
    el.addEventListener("input", function (ev) {
      if (ev.inputType && ev.inputType.indexOf("delete") === 0) return;
      el.value = mask(el.value);
      setErr(el, "");
    });
  });

  function setErr(el, msg) {
    var e = document.getElementById(el.id + "-err");
    e.textContent = msg;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function check(el) {
    var v = el.value.trim();
    if (!v) { setErr(el, "Введите дату в формате дд.мм.гггг, например 15.01.1992"); return null; }
    var p = parseDate(v);
    if (!p) { setErr(el, "Такой даты нет. Проверьте день, месяц и год: дд.мм.гггг"); return null; }
    setErr(el, "");
    return p;
  }

  function el(tag, cls, text) {
    var x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text != null) x.textContent = text;
    return x;
  }

  function fmt(p) {
    return (p.d < 10 ? "0" : "") + p.d + "." + (p.m < 10 ? "0" : "") + p.m + "." + p.y;
  }

  function person(label, p, n) {
    var w = el("div", "ssor-person");
    w.appendChild(el("span", "lbl", label));
    w.appendChild(el("b", "", String(n)));
    w.appendChild(el("span", "unit", plural(n)));
    w.appendChild(el("span", "dt", fmt(p)));
    return w;
  }

  function render(pa, pb) {
    var r = result(pa, pb);
    state.res = r;
    var card = document.getElementById("ssor-card");
    card.innerHTML = "";
    card.appendChild(el("p", "kicker", "Ваш сценарий ссор"));
    card.appendChild(el("h2", "", r.name));
    var row = el("div", "ssor-people");
    row.appendChild(person("Вы", pa, r.a));
    row.appendChild(el("span", "ssor-amp", "+"));
    row.appendChild(person("Партнёр", pb, r.b));
    card.appendChild(row);
    card.appendChild(el("p", "ssor-line", r.line + "."));
    var txt = el("div", "ssor-text");
    r.text.forEach(function (s) { txt.appendChild(el("p", "", s)); });
    card.appendChild(txt);
    card.appendChild(el("p", "ssor-more", r.more));
    box.hidden = false;
    return drawPng(r).then(function (blob) {
      state.blob = blob;
      if (state.url) URL.revokeObjectURL(state.url);
      state.url = URL.createObjectURL(blob);
      document.getElementById("ssor-png").src = state.url;
      var dl = document.getElementById("ssor-save");
      dl.href = state.url;
      return r;
    });
  }

  /* ---------- картинка 1080 x 1350 ---------- */
  function wrap(ctx, text, maxW) {
    var words = text.split(" "), lines = [], cur = "";
    words.forEach(function (w) {
      var t = cur ? cur + " " + w : w;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var loads = [
      document.fonts.load('700 120px "Cormorant Garamond"'),
      document.fonts.load('italic 600 120px "Cormorant Garamond"'),
      document.fonts.load("700 40px Manrope"),
      document.fonts.load("500 40px Manrope")
    ];
    var timeout = new Promise(function (res) { setTimeout(res, 2500); });
    return Promise.race([Promise.all(loads), timeout]).catch(function () {});
  }

  function drawPng(r) {
    return fontsReady().then(function () {
      var W = 1080, H = 1350, X = 90;
      var cv = document.getElementById("ssor-canvas");
      cv.width = W; cv.height = H;
      var ctx = cv.getContext("2d");
      var serif = '"Cormorant Garamond", Georgia, serif';
      var sans = "Manrope, Arial, sans-serif";

      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#6a37a8");
      g.addColorStop(0.55, "#57308b");
      g.addColorStop(1, "#3a1d63");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      var glow = ctx.createRadialGradient(940, 160, 20, 940, 160, 520);
      glow.addColorStop(0, "rgba(117,20,208,.75)");
      glow.addColorStop(1, "rgba(117,20,208,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.14)";
      ctx.lineWidth = 2;
      [260, 330].forEach(function (rad) { ctx.beginPath(); ctx.arc(1010, 1290, rad, 0, Math.PI * 2); ctx.stroke(); });

      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#d5c1f2";
      ctx.font = "700 30px " + sans;
      if ("letterSpacing" in ctx) ctx.letterSpacing = "5px";
      ctx.fillText("ВАШ СЦЕНАРИЙ ССОР", X, 150);
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 128px " + serif;
      var nameLines = wrap(ctx, r.name, W - 2 * X);
      var y = 290;
      nameLines.forEach(function (ln) { ctx.fillText(ln, X, y); y += 122; });

      var boxY = y - 30, boxW = (W - 2 * X - 30) / 2, boxH = 300;
      [["Вы", r.a], ["Партнёр", r.b]].forEach(function (p, i) {
        var bx = X + i * (boxW + 30);
        rrect(ctx, bx, boxY, boxW, boxH, 36);
        ctx.fillStyle = "rgba(255,255,255,.10)";
        ctx.fill();
        ctx.fillStyle = "#d5c1f2";
        ctx.font = "600 34px " + sans;
        ctx.fillText(p[0], bx + 44, boxY + 70);
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 150px " + sans;
        ctx.fillText(String(p[1]), bx + 40, boxY + 225);
        var nw = ctx.measureText(String(p[1])).width;
        ctx.fillStyle = "#eadff9";
        ctx.font = "600 38px " + sans;
        ctx.fillText(plural(p[1]), bx + 40 + nw + 20, boxY + 222);
      });

      y = boxY + boxH + 100;
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic 600 62px " + serif;
      wrap(ctx, r.short, W - 2 * X).forEach(function (ln) { ctx.fillText(ln, X, y); y += 68; });

      ctx.fillStyle = "#eadff9";
      ctx.font = "500 34px " + sans;
      y += 20;
      wrap(ctx, r.line + ".", W - 2 * X).forEach(function (ln) { ctx.fillText(ln, X, y); y += 46; });

      ctx.strokeStyle = "rgba(255,255,255,.25)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X, H - 170); ctx.lineTo(W - X, H - 170); ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 36px " + sans;
      ctx.fillText(SITE, X, H - 105);
      ctx.fillStyle = "#cbb6ec";
      ctx.font = "500 28px " + sans;
      ctx.fillText("Посчитайте свою пару по датам рождения", X, H - 62);

      return new Promise(function (res) { cv.toBlob(function (b) { res(b); }, "image/png"); });
    });
  }

  /* ---------- кнопки ---------- */
  function pageUrl() {
    return location.href.split("?")[0].split("#")[0];
  }

  function flash(msg) {
    var s = document.getElementById("ssor-status");
    s.textContent = msg;
    setTimeout(function () { if (s.textContent === msg) s.textContent = ""; }, 4000);
  }

  document.getElementById("ssor-share").addEventListener("click", function () {
    var r = state.res;
    var text = r ? "Наш сценарий ссор: «" + r.name + "». Посчитайте свой: " + pageUrl() : pageUrl();
    var file = state.blob && typeof File === "function" ? new File([state.blob], "scenariy-ssor.png", { type: "image/png" }) : null;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: "Ваш сценарий ссор", text: text }).catch(function () {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { flash("Ссылка скопирована. Отправьте её партнёру или подруге."); },
        function () { window.prompt("Скопируйте ссылку:", pageUrl()); }
      );
    } else {
      window.prompt("Скопируйте ссылку:", pageUrl());
    }
  });

  document.getElementById("ssor-cta").href = WEBINAR;

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var pa = check(inA), pb = check(inB);
    if (!pa || !pb) { (pa ? inB : inA).focus(); return; }
    render(pa, pb).then(function () {
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ?a=15.1.1992&b=22.9.1979 заполняет форму и считает; &png=1 показывает только картинку */
  var q = new URLSearchParams(location.search);
  if (q.get("a") && q.get("b")) {
    inA.value = mask(q.get("a"));
    inB.value = mask(q.get("b"));
    var pa = check(inA), pb = check(inB);
    if (pa && pb) {
      render(pa, pb).then(function () {
        if (q.get("png") === "1") {
          document.body.innerHTML = "";
          document.body.style.background = "#222";
          var img = new Image();
          img.src = state.url;
          img.style.cssText = "display:block;width:1080px;height:1350px;max-width:none";
          document.body.appendChild(img);
        }
      });
    }
  }
})();
