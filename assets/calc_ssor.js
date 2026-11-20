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

  /* Уровень двоек: L = 0-1 (сил мало), M = 2 (ровно), H = 3+ (с избытком). Шкала по kb_st1 «2: энергия». */
  function lvl(n) { return n >= 3 ? "H" : n === 2 ? "M" : "L"; }

  /* Тип пары. "hi" = у кого уровень выше: "you", "them" или "" (поровну). */
  function pairType(a, b) {
    var la = lvl(a), lb = lvl(b), rank = { L: 0, M: 1, H: 2 };
    var key = rank[la] >= rank[lb] ? la + lb : lb + la;
    var hi = la === lb ? "" : rank[la] > rank[lb] ? "you" : "them";
    return { key: key, hi: hi };
  }

  /* Что значит число двоек у одного человека. you = про вас, them = про партнёра. */
  var PERSON = {
    0: { you: "своих сил мало. Быстро выдыхаетесь, заряжаетесь от того, кто рядом, и ждёте, что вас заметят и поддержат.",
         them: "своих сил мало. Быстро выдыхается, заряжается от того, кто рядом, и ждёт, что его заметят и поддержат." },
    1: { you: "силы есть, но ненадолго. В ссоре хотите скорее закончить, даже если ничего не решили.",
         them: "силы есть, но ненадолго. В ссоре хочет скорее закончить, даже если ничего не решили." },
    2: { you: "сил хватает на спокойный разговор. За своё спорите и доводите спор до решения.",
         them: "сил хватает на спокойный разговор. За своё спорит и доводит спор до решения." },
    3: { you: "вас быстро заводит. Вспыхиваете на пустом месте, и в запале может вырваться лишнее.",
         them: "партнёра быстро заводит. Может вспыхнуть на пустом месте, и в запале может вырваться лишнее." },
    4: { you: "сил через край. Если за день они не ушли в дело, любая мелочь вырастает в разборку.",
         them: "сил через край. Если за день они не ушли в дело, любая мелочь вырастает в разборку." }
  };

  var MORE_LEAD = "Двойки показывают только запас сил. Остальное видно по другим цифрам ваших двух дат. На бесплатном эфире «Отношения» школа покажет, как читать эти цифры в паре и как договариваться такой паре, как ваша.";

  /* Симметричные пары: один текст. Асимметричные: вариант you (сил больше у вас) и them (у партнёра). */
  var TYPES = {
    LL: {
      name: "Испанские страсти",
      short: "Ссоримся на ровном месте, даже из-за кружки.",
      pair: "Силы у вас обоих кончаются быстро, и каждый ждёт, что поддержит другой. Не дождались, и срываетесь друг на друга.",
      scene: "Вечер, оба пришли уставшие. Кто-то спрашивает: «Почему кружка опять на столе?» Через две минуты уже «тебе вообще на меня плевать», хотя про кружку уже никто не помнит. Потом оба лежат без сил и не могут вспомнить, с чего всё началось.",
      steps: [
        "Скажите сегодня, пока тихо: «Давай первые полчаса дома без претензий. Сначала ужин, потом всё остальное».",
        "Почувствовали, что заводитесь из-за мелочи, скажите: «Я без сил. Давай вернёмся к этому через 20 минут». И правда вернитесь.",
        "Разговор всё равно пошёл по кругу, остановите его фразой: «Давай про это завтра утром. Сейчас у меня нет сил»."
      ],
      blind: "По двойкам видно, что сил мало у обоих. Не видно, кто из вас первым начинает требовать внимания, кто в итоге всегда уступает ради тишины и где каждому брать силы, чтобы не забирать их у другого."
    },
    MM: {
      name: "Холодная война",
      short: "Обиделись, разошлись по комнатам и молчим.",
      pair: "Сил хватает обоим, делить их не приходится, поэтому кричите вы редко. Только силы уходят в упрямство: каждый ждёт, что первым подойдёт другой, и молчать так можно долго.",
      scene: "Партнёр обещал позвонить, звонка нет весь день. Вечером на вопрос «что случилось?» в ответ «всё нормально», и дверь в комнату закрывается. Утром «доброе утро» сквозь зубы, и так тянется, пока кто-то не сделает вид, что ничего не было. Обида при этом никуда не уходит и всплывает в следующей ссоре.",
      steps: [
        "Собрались уйти молчать, назовите срок: «Мне нужен час, чтобы остыть. В восемь подойду». И подойдите.",
        "Кто остыл первым, приходит с одной фразой про себя: «Я не хочу молчать. Меня задело вот что…» Без «ты всегда» и «ты опять».",
        "Предложите партнёру в спокойную минуту мириться по очереди: сегодня первым идёте вы, в следующий раз партнёр. Так никто не копит счёт, кто сколько раз шёл навстречу."
      ],
      blind: "По двойкам видно, что сил на ссору у вас поровну. Не видно, почему кто-то из вас каждый раз ждёт, что первым подойдёт другой, и какие слова каждый на самом деле хочет услышать, чтобы оттаять."
    },
    HH: {
      name: "Два вулкана",
      short: "Если ругаться, то от души. Оба.",
      pair: "Сил много у обоих, и обоим нужно их куда-то девать. Если за день силы не ушли в дело, они уходят в ссору.",
      scene: "Потёк кран, или кто-то не так ответил про планы на выходные. Через две минуты оба кричат, в ход идут родня и прошлый отпуск. Часто через час всё будто забыто. Сказанное в запале потом неделю крутится в голове.",
      steps: [
        "Правило 10 минут, предложите его сегодня в спокойную минуту: голос пошёл вверх, любой из вас говорит «Стоп, 10 минут». Таймер на телефоне, расходитесь по разным комнатам, дверью не хлопаете.",
        "Вернулись, говорите только про сегодняшний случай. Родню и старые обиды не трогаете: кто вспомнил прошлое, тот сразу берёт ещё 10 минут."
      ],
      blind: "По двойкам видно, что сил на ссору у вас с запасом. Не видно, кто из вас на деле ведёт в паре, кто уступает в главном и в какое общее дело ваши силы уйдут без взрывов."
    },
    HL: {
      name: "Гроза и тишина",
      short: "Кто-то кипит, кто-то соглашается, лишь бы стало тихо.",
      you: {
        pair: "Сил у вас заметно больше, чем у партнёра. Вы заводитесь и идёте выяснять, партнёр выдыхается в первые же минуты и соглашается, лишь бы стало тихо.",
        scene: "Вы спрашиваете: «Почему мусор опять стоит?» В ответ короткое «да вынесу», и это задевает ещё сильнее. Вы продолжаете, и через пару минут партнёр соглашается со всем подряд и уходит в телефон. Спор окончен, а легче не стало: ничего не решили, и теперь неприятно уже само молчание.",
        steps: [
          "Назовите одну претензию и замолчите. Дождитесь ответа. Список «и ещё вот это» оставьте на потом.",
          "Услышали «да-да, хорошо», скорее всего, у партнёра кончились силы. Скажите: «Похоже, ты соглашаешься, чтобы закончить. Скажи, как на самом деле, я подожду 15 минут»."
        ]
      },
      them: {
        pair: "Сил у партнёра заметно больше, чем у вас. Партнёр заводится и идёт выяснять, вы выдыхаетесь в первые же минуты и соглашаетесь, лишь бы стало тихо.",
        scene: "Партнёр спрашивает: «Почему мусор опять стоит?» Вы отвечаете «да вынесу», и это задевает ещё сильнее. Через пару минут вы соглашаетесь со всем подряд, лишь бы закончилось, и уходите в телефон. Ничего не решили. Внутри остаётся обида, что вас опять не услышали.",
        steps: [
          "Поймали себя на том, что соглашаетесь со всем подряд, скажите: «Я сейчас соглашаюсь, только чтобы стало тихо. Дай мне 15 минут, потом скажу, что думаю на самом деле».",
          "В спокойную минуту, лучше сегодня, попросите: «Когда ты на взводе, говори мне одну претензию за раз. От списка я теряюсь и просто соглашаюсь»."
        ]
      },
      blind: "По двойкам видно, у кого в паре больше сил. Не видно, почему тот, у кого их меньше, молчит и копит обиду, и что каждому из вас нужно от другого, чтобы договариваться без давления."
    },
    ML: {
      name: "Качели",
      short: "Кто-то долго терпит, потом взрывается из-за сковородки.",
      you: {
        pair: "У вас сил хватает на разговор, у партнёра их меньше. Вы выслушиваете и сглаживаете, партнёр рядом с вами подзаряжается. Пока силы есть, всё ровно.",
        scene: "Вы весь вечер слушаете, как прошёл день партнёра, помогаете, успокаиваете. А через неделю вас взрывает из-за немытой сковородки. Партнёр искренне не понимает, откуда это, ведь «всё же было нормально».",
        steps: [
          "Не копите. Устали слушать, скажите сразу: «Я сейчас без сил. Давай я тебя выслушаю через час».",
          "Уже сорвались, скажите: «Дело не в сковородке. Мне давно тяжело, дай скажу, в чём»."
        ]
      },
      them: {
        pair: "У партнёра сил хватает на разговор, у вас их меньше. Партнёр выслушивает и сглаживает, вы рядом подзаряжаетесь. Пока у партнёра есть силы, всё ровно.",
        scene: "Вы приходите без сил и рассказываете про свой день, партнёр слушает и помогает. Так неделю. А потом из-за немытой сковородки партнёр вдруг взрывается, и вы не понимаете, откуда это, ведь всё было нормально.",
        steps: [
          "Партнёр стал отвечать коротко и устало, это сигнал. Спросите: «Как ты? Что сегодня было тяжёлым?» И дослушайте до конца.",
          "Партнёр вспыхнул из-за мелочи, не спорьте про сковородку. Скажите: «Похоже, на тебе сейчас слишком много. Что мне взять на себя?»"
        ]
      },
      blind: "По двойкам видно, кто в паре отдаёт силы и кто их берёт. Не видно, почему отдаёт почти всегда один и тот же из вас и как разделить нагрузку, пока качели не сорвались."
    },
    HM: {
      name: "Шторм и стена",
      short: "Кто-то вспыхивает, кто-то стоит на своём.",
      you: {
        pair: "Сил хватает обоим, у вас их больше. Вы заводитесь быстрее, партнёр спорит спокойно и до последнего стоит на своём.",
        scene: "Решаете, куда ехать на выходные. Партнёр спокойно приводит третий довод, и от этого вы закипаете сильнее, чем от крика. Голос идёт вверх, партнёр затихает. Спор опять не решён. А в голове крутится то, что вырвалось в запале.",
        steps: [
          "Чувствуете, что голос пошёл вверх, скажите «Стоп, мне нужно 10 минут» и выйдите из комнаты. Таймер на телефоне.",
          "Вернулись, начните с вопроса: «Давай заново. Что ты предлагаешь? Я слушаю»."
        ]
      },
      them: {
        pair: "Сил хватает обоим, у партнёра их больше. Партнёр заводится быстрее, вы спорите спокойно и до последнего стоите на своём.",
        scene: "Решаете, куда ехать на выходные. Вы спокойно приводите третий довод, а партнёра это заводит ещё сильнее. Голос идёт вверх, вы затихаете. Спор не решён. Обидные слова потом долго крутятся в голове.",
        steps: [
          "Видите, что партнёр закипает, новых доводов не добавляйте. Скажите: «Давай перерыв на 10 минут, потом договорим». Таймер на телефоне.",
          "После паузы начните с общего: «Мы оба хотим нормально отдохнуть. Давай решим, куда»."
        ]
      },
      blind: "По двойкам видно, кто в паре вспыхивает быстрее. Не видно, кто из вас на самом деле принимает решения и почему ваши споры возвращаются к одному и тому же."
    }
  };

  var LABELS = { pair: "Ваша связка", scene: "Как это выглядит в жизни", steps: "Что сделать в ближайшую ссору", blind: "Слепая зона вашей пары" };

  function plural(n) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return "двойка";
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "двойки";
    return "двоек";
  }

  function countWord(n) { return n + " " + plural(n); }

  function countLine(a, b) {
    if (a === 0 && b === 0) return "Двоек нет ни у вас, ни у партнёра";
    return "У вас " + (a ? a + " " + plural(a) : "двоек нет") + ", у партнёра " + (b ? b + " " + plural(b) : "ни одной");
  }

  function personLine(who, n) {
    var p = PERSON[Math.min(n, 4)];
    var lead = who === "you" ? "Вы, " : "Партнёр, ";
    var text = who === "you" ? p.you : p.them;
    return lead + countWord(n) + ": " + text;
  }

  function result(da, db) {
    var a = matrix(da.d, da.m, da.y).twos;
    var b = matrix(db.d, db.m, db.y).twos;
    var pt = pairType(a, b);
    var t = TYPES[pt.key];
    var v = pt.hi ? t[pt.hi] : t;
    return {
      a: a, b: b, key: pt.key, hi: pt.hi, name: t.name, short: t.short, line: countLine(a, b),
      people: [personLine("you", a), personLine("them", b)],
      pair: v.pair, scene: v.scene, steps: v.steps, blind: t.blind, more: MORE_LEAD
    };
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
    function sec(label) {
      var w = el("div", "ssor-sec");
      w.appendChild(el("h3", "", label));
      return w;
    }
    var s1 = sec(LABELS.pair);
    r.people.forEach(function (t) { s1.appendChild(el("p", "ssor-who", t)); });
    s1.appendChild(el("p", "", r.pair));
    card.appendChild(s1);
    var s2 = sec(LABELS.scene);
    s2.appendChild(el("p", "", r.scene));
    card.appendChild(s2);
    var s3 = sec(LABELS.steps);
    s3.className += " ssor-steps";
    var ol = el("ol", "");
    r.steps.forEach(function (t) { ol.appendChild(el("li", "", t)); });
    s3.appendChild(ol);
    card.appendChild(s3);
    var s4 = sec(LABELS.blind);
    s4.className += " ssor-blind";
    s4.appendChild(el("p", "", r.blind));
    s4.appendChild(el("p", "", r.more));
    var go = el("a", "btn btn-brand", "Записаться на бесплатный эфир");
    go.href = WEBINAR; go.target = "_blank"; go.rel = "noopener";
    s4.appendChild(go);
    card.appendChild(s4);
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
