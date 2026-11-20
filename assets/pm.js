/* Общие функции калькуляторов базы знаний: психоматрица, разбор и маска даты, картинка 1080 x 1350.
   Расчёт повторяет tools/psychomatrix.py: дата d m yyyy без ведущих нулей, I = сумма цифр,
   II = сумма цифр I, III = |I - 2 * первая цифра записи|, IV = сумма цифр III, нули не считаются.
   calc_ssor.js пока держит свою копию расчёта; новые калькуляторы берут его отсюда. */
(function (root) {
  "use strict";

  var LINES = { "147": [1, 4, 7], "258": [2, 5, 8], "369": [3, 6, 9], "123": [1, 2, 3],
                "456": [4, 5, 6], "789": [7, 8, 9], "159": [1, 5, 9], "357": [3, 5, 7] };

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
    var lines = {};
    Object.keys(LINES).forEach(function (key) {
      lines[key] = LINES[key].reduce(function (s, c) { return s + cells[c]; }, 0);
    });
    return { dops: [i1, i2, i3, i4], cells: cells, lines: lines };
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

  function fmt(p) {
    return (p.d < 10 ? "0" : "") + p.d + "." + (p.m < 10 ? "0" : "") + p.m + "." + p.y;
  }

  /* forms: [одна, две-четыре, пять и больше] */
  function plural(n, forms) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return forms[0];
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return forms[1];
    return forms[2];
  }

  /* ---------- DOM ---------- */
  function el(tag, cls, text) {
    var x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text != null) x.textContent = text;
    return x;
  }

  /* Поле даты с маской и ошибкой в #<id>-err. Возвращает check(): {d,m,y} или null */
  function dateField(input) {
    function setErr(msg) {
      var e = document.getElementById(input.id + "-err");
      if (e) e.textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    input.addEventListener("input", function (ev) {
      if (ev.inputType && ev.inputType.indexOf("delete") === 0) return;
      input.value = mask(input.value);
      setErr("");
    });
    return function check() {
      var v = input.value.trim();
      if (!v) { setErr("Введите дату в формате дд.мм.гггг, например 15.01.1992"); return null; }
      var p = parseDate(v);
      if (!p) { setErr("Такой даты нет. Проверьте день, месяц и год: дд.мм.гггг"); return null; }
      setErr("");
      return p;
    };
  }

  /* ---------- картинка ---------- */
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
      document.fonts.load("600 40px Manrope"),
      document.fonts.load("500 40px Manrope")
    ];
    var timeout = new Promise(function (res) { setTimeout(res, 2500); });
    return Promise.race([Promise.all(loads), timeout]).catch(function () {});
  }

  var SERIF = '"Cormorant Garamond", Georgia, serif';
  var SANS = "Manrope, Arial, sans-serif";

  /* Фон, надпись сверху и подвал карточки. Возвращает ctx. */
  function cardFrame(cv, kicker, site, footer) {
    var W = 1080, H = 1350, X = 90;
    cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
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
    ctx.font = "700 30px " + SANS;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "5px";
    ctx.fillText(kicker.toUpperCase(), X, 150);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.strokeStyle = "rgba(255,255,255,.25)";
    ctx.beginPath(); ctx.moveTo(X, H - 170); ctx.lineTo(W - X, H - 170); ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 36px " + SANS;
    ctx.fillText(site, X, H - 105);
    ctx.fillStyle = "#cbb6ec";
    ctx.font = "500 28px " + SANS;
    ctx.fillText(footer, X, H - 62);
    return ctx;
  }

  function toBlob(cv) {
    return new Promise(function (res) { cv.toBlob(function (b) { res(b); }, "image/png"); });
  }

  /* Кнопки «Сохранить» и «Поделиться». getState() -> {blob, text, file, title} */
  function shareButtons(btn, statusEl, getState) {
    function pageUrl() { return location.href.split("?")[0].split("#")[0]; }
    function flash(msg) {
      statusEl.textContent = msg;
      setTimeout(function () { if (statusEl.textContent === msg) statusEl.textContent = ""; }, 4000);
    }
    btn.addEventListener("click", function () {
      var s = getState();
      var text = s.text ? s.text + " " + pageUrl() : pageUrl();
      var file = s.blob && typeof File === "function" ? new File([s.blob], s.file, { type: "image/png" }) : null;
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: s.title, text: text }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { flash("Ссылка скопирована. Отправьте её подруге."); },
          function () { window.prompt("Скопируйте ссылку:", pageUrl()); }
        );
      } else {
        window.prompt("Скопируйте ссылку:", pageUrl());
      }
    });
  }

  /* ?png=1: оставить на странице только картинку (для проверки) */
  function pngOnly(url) {
    document.body.innerHTML = "";
    document.body.style.background = "#222";
    var img = new Image();
    img.src = url;
    img.style.cssText = "display:block;width:1080px;height:1350px;max-width:none";
    document.body.appendChild(img);
  }

  var PM = {
    LINES: LINES, digitSum: digitSum, matrix: matrix, parseDate: parseDate, mask: mask, fmt: fmt,
    plural: plural, el: el, dateField: dateField, wrap: wrap, rrect: rrect, fontsReady: fontsReady,
    cardFrame: cardFrame, toBlob: toBlob, shareButtons: shareButtons, pngOnly: pngOnly,
    SERIF: SERIF, SANS: SANS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = PM;
  else root.PM = PM;
})(this);
