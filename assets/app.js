/* Поиск по базе знаний: заголовки, теги, разделы. Без зависимостей. */
(function () {
  "use strict";
  var root = document.body.getAttribute("data-root") || "";

  function norm(s) {
    return (s || "").toLowerCase().replace(/ё/g, "е").replace(/[«»"().,:;!?]/g, " ").replace(/\s+/g, " ").trim();
  }

  function render(box, q) {
    var data = window.KB_ARTICLES || [];
    var words = norm(q).split(" ").filter(function (w) { return w.length > 1; });
    box.innerHTML = "";
    if (!words.length) { box.classList.remove("open"); return; }
    var found = data.filter(function (a) {
      var hay = norm(a.title + " " + a.tags.join(" ") + " " + a.section);
      return words.every(function (w) {
        // совпадение по началу слова, чтобы «долг» находил «долги», «должника»
        return hay.indexOf(w) !== -1 || hay.indexOf(w.slice(0, Math.max(4, w.length - 2))) !== -1;
      });
    });
    found.sort(function (a, b) { return (b.ready ? 1 : 0) - (a.ready ? 1 : 0); });
    if (!found.length) {
      var e = document.createElement("div");
      e.className = "empty";
      e.textContent = "Пока ничего не нашли. Попробуйте «психоматрица», «долги» или «отношения».";
      box.appendChild(e);
    }
    found.slice(0, 8).forEach(function (a) {
      var link = document.createElement("a");
      link.href = root + a.url;
      var t = document.createElement("span");
      t.textContent = a.title;
      var m = document.createElement("span");
      m.className = "meta";
      m.textContent = a.ready ? a.section + " · читать" : a.section + " · скоро";
      link.appendChild(t);
      link.appendChild(m);
      box.appendChild(link);
    });
    box.classList.add("open");
  }

  var input = document.getElementById("q");
  var box = document.getElementById("results");
  if (input && box) {
    input.addEventListener("input", function () { render(box, input.value); });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") { input.value = ""; render(box, ""); }
    });
    document.querySelectorAll("[data-tag]").forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.classList.contains("on");
        document.querySelectorAll("[data-tag]").forEach(function (x) { x.classList.remove("on"); });
        input.value = on ? "" : b.getAttribute("data-tag");
        if (!on) b.classList.add("on");
        render(box, input.value);
        input.focus();
      });
    });
  }

  /* Страница подарка: подставляем подарок из ?g= */
  var gp = document.getElementById("gift-page");
  if (gp && window.KB_GIFTS) {
    var key = new URLSearchParams(location.search).get("g") || "psychomatrix";
    var g = window.KB_GIFTS[key] || window.KB_GIFTS.psychomatrix;
    document.getElementById("g-title").textContent = g.title;
    document.getElementById("g-from").textContent = g.from;
    document.getElementById("g-text").textContent = g.text;
    var ul = document.getElementById("g-list");
    ul.innerHTML = "";
    g.items.forEach(function (it) { var li = document.createElement("li"); li.textContent = it; ul.appendChild(li); });
    document.getElementById("g-img").src = root + "img/" + g.img + ".webp";
    document.getElementById("g-btn").href = g.bot;
    document.querySelectorAll("[data-gift]").forEach(function (a) {
      a.classList.toggle("on", a.getAttribute("data-gift") === key);
    });
    document.title = g.title + " · База знаний школы Аллы Александровой";
  }
})();
