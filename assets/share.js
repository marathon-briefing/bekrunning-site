/* BEK 文章分享列：LINE / 複製連結 / 系統原生分享（2026-11-12）
   各文章頁引入；網址與標題即時讀取當篇 canonical 與 h1，不寫死。 */
(function () {
  "use strict";

  function canonicalUrl() {
    var link = document.querySelector('link[rel="canonical"]');
    if (link && link.href) return link.href;
    return location.href.split("#")[0];
  }

  function articleTitle() {
    var h = document.querySelector(".article-hero h1, .prose h1");
    if (h && h.textContent.trim()) return h.textContent.trim();
    var t = document.title || "";
    return t.split("｜")[0].trim() || t;
  }

  function svg(kind) {
    var paths = {
      line: '<path d="M12 3C6.9 3 3 6.4 3 10.6c0 2.4 1.3 4.5 3.3 5.9l-.8 2.6 2.9-1.6c.9.3 1.8.5 2.6.5 5.1 0 9-3.4 9-7.4S17.1 3 12 3z"/>',
      copy: '<path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/>',
      share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.4 10.8 7.2-3.6M8.4 13.2l7.2 3.6"/>'
    };
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[kind] || "") + "</svg>";
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  function copyText(text, btn) {
    var label = btn.querySelector(".share-label-text");
    function done() {
      if (!label) return;
      var old = label.textContent;
      label.textContent = "已複製";
      btn.classList.add("copied");
      setTimeout(function () {
        label.textContent = old;
        btn.classList.remove("copied");
      }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function init() {
    var anchor = document.querySelector(".article-meta") || document.querySelector(".prose");
    if (!anchor) return;

    var url = canonicalUrl();
    var title = articleTitle();

    var bar = document.createElement("div");
    bar.className = "share-bar";
    bar.setAttribute("aria-label", "分享這篇文章");

    // LINE 分享
    var line = document.createElement("a");
    line.className = "share-btn share-line";
    line.href = "https://social-plugins.line.me/lineit/share?url=" + encodeURIComponent(url);
    line.target = "_blank";
    line.rel = "noopener";
    line.innerHTML = svg("line") + '<span class="share-label-text">LINE</span>';
    bar.appendChild(line);

    // 複製連結
    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "share-btn share-copy";
    copy.innerHTML = svg("copy") + '<span class="share-label-text">複製連結</span>';
    copy.addEventListener("click", function () { copyText(url, copy); });
    bar.appendChild(copy);

    // 系統原生分享（不支援的瀏覽器自動隱藏）
    if (navigator.share) {
      var native = document.createElement("button");
      native.type = "button";
      native.className = "share-btn share-native";
      native.innerHTML = svg("share") + '<span class="share-label-text">更多分享</span>';
      native.addEventListener("click", function () {
        navigator.share({ title: title, url: url }).catch(function () {});
      });
      bar.appendChild(native);
    }

    anchor.insertAdjacentElement("afterend", bar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
