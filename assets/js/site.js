// Vibe Building — 零依赖。每个功能一个具名导出的纯函数 + 一个 init 包装，
// 便于 node --test 在没有 DOM 的环境里测纯逻辑。

// ---------------------------------------------------------------- 滚动擦洗
// 粘附容器高 height、视口高 viewportH，可滚动行程是 height - viewportH。
// 容器 rect.top 从 0 走到 -(height - viewportH)，所以进度 = -top / 行程。

export function scrubProgress(top, height, viewportH) {
  const travel = height - viewportH;
  if (travel <= 0) return 0;
  const p = -top / travel;
  return p <= 0 ? 0 : p > 1 ? 1 : p;  // <= 把 -0 归一成 +0，否则计数器显示 "-0"
}


// build_iso 的第 0 帧只有一张空网格（members 1 / 7 469）。静止时的 hero 不能是空的，
// 所以把擦洗区间压到 [from, 1]：一进页面就已经长出一截，滚到底仍是完整的框架。
export function scrubFraction(progress, from) {
  const f = from > 0 && from < 1 ? from : 0;
  return f + progress * (1 - f);
}

const reduced = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initScrub(doc) {
  const boxes = [...doc.querySelectorAll("[data-scrub]")];
  if (!boxes.length) return;

  // reduced-motion：不擦洗、不自动播放，停在海报帧并给出控件。
  // 计数器要对齐海报所在的进度，否则显示 0 而图上已经搭了一半。
  if (reduced()) {
    for (const box of boxes) {
      const v = box.querySelector("video");
      if (v) v.controls = true;
      const from = Number(box.getAttribute("data-scrub-from")) || 0;
      for (const out of box.querySelectorAll("[data-count-to]")) {
        const to = Number(out.getAttribute("data-count-to"));
        out.textContent = Math.round(from * to).toLocaleString("en-US");
      }
    }
    return;
  }

  let ticking = false;
  const paint = () => {
    ticking = false;
    for (const box of boxes) {
      const video = box.querySelector("video");
      const r = box.getBoundingClientRect();
      const from = Number(box.getAttribute("data-scrub-from")) || 0;
      const p = scrubProgress(r.top, r.height, innerHeight);
      const f = scrubFraction(p, from);
      if (video && video.duration) {
        video.currentTime = f * video.duration;
        // 静止时一直显示海报帧；只有真的滚起来了才让视频接管，
        // 避免 seek 落位前闪一下第 0 帧的空网格。
        const stage = video.parentElement;
        if (stage) stage.classList.toggle("ready", p > 0.01);
      }
      for (const out of box.querySelectorAll("[data-count-to]")) {
        const to = Number(out.getAttribute("data-count-to"));
        out.textContent = Math.round(f * to).toLocaleString("en-US");
      }
    }
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(paint); }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  for (const box of boxes) {
    const v = box.querySelector("video");
    if (!v) continue;
    v.addEventListener("loadedmetadata", paint, { once: true });
  }
  paint();
}

// ------------------------------------------------------- 幕 3：分段接力
// 把 0–1 的滚动进度切成 count 段。段内的视频进场播、离场停。

export function stageIndex(progress, count) {
  if (count <= 0) return 0;
  const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  const i = Math.floor(p * count);
  return i >= count ? count - 1 : i;
}

export function initStages(doc) {
  for (const box of doc.querySelectorAll("[data-stages]")) {
    const panes = [...box.querySelectorAll(".screen > [data-stage]")];
    const steps = [...box.querySelectorAll("ol > [data-stage]")];
    if (!panes.length) continue;
    const still = reduced();
    let shown = -1;

    const show = (i) => {
      if (i === shown) return;
      shown = i;
      panes.forEach((pane, k) => {
        const on = k === i;
        pane.classList.toggle("on", on);
        pane.setAttribute("aria-hidden", String(!on));
        const v = pane.querySelector("video");
        if (!v || still) return;
        if (on) { v.play().catch(() => {}); } else { v.pause(); }
      });
      steps.forEach((li, k) => li.classList.toggle("on", k === i));
    };

    let ticking = false;
    const paint = () => {
      ticking = false;
      const r = box.getBoundingClientRect();
      show(stageIndex(scrubProgress(r.top, r.height, innerHeight), panes.length));
    };
    addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    addEventListener("resize", paint, { passive: true });
    paint();
  }
}

// ------------------------------------------- 幕 5：条形几何 与 入场揭示
// 条总宽 = 裁决器自报的通过率；实心段 = 物理复核后真正交付的；
// 余下的就是假阳性。delivered 不可能超过 claimed，但夹一下防止数据错时出现负宽。

export function barGeometry(row, scale) {
  const total = row.claimed;
  const solid = Math.min(row.delivered, total);
  const false_ = Math.max(0, total - solid);
  return {
    total, solid, false_,
    totalPct: (total / scale) * 100,
    solidPct: (solid / scale) * 100,
    falsePct: (false_ / scale) * 100,
  };
}

export function initReveal(doc) {
  const targets = doc.querySelectorAll("[data-reveal]");
  if (!targets.length) return;
  if (reduced() || typeof IntersectionObserver === "undefined") {
    for (const t of targets) t.classList.add("in");
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }
  }, { rootMargin: "0px 0px -18% 0px", threshold: 0.2 });
  for (const t of targets) io.observe(t);
}

// ---------------------------------------------- 卡片：悬停播放 与 类别筛选

export function matchesFilter(kind, filter) {
  if (filter === "all") return true;
  return kind === filter;
}

// opts.still 由调用方注入，便于在没有 matchMedia 的环境里测试。
export function initCards(doc, opts = {}) {
  const still = opts.still ?? reduced();
  if (still) return;                      // reduced-motion：卡片停在静态图
  for (const card of doc.querySelectorAll("a.card")) {
    const v = card.querySelector("video");
    if (!v) continue;
    card.addEventListener("pointerenter", () => { v.play().catch(() => {}); });
    card.addEventListener("pointerleave", () => { v.pause(); });
    card.addEventListener("focusin", () => { v.play().catch(() => {}); });
    card.addEventListener("focusout", () => { v.pause(); });
  }
}

export function initFilters(doc) {
  const buttons = [...doc.querySelectorAll("[data-filter]")];
  if (!buttons.length) return;
  const cards = [...doc.querySelectorAll("a.card")];
  for (const btn of buttons) {
    btn.addEventListener("click", () => {
      const want = btn.getAttribute("data-filter");
      for (const b of buttons) {
        const on = b === btn;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", String(on));
      }
      for (const c of cards) {
        c.hidden = !matchesFilter(c.getAttribute("data-kind"), want);
      }
    });
  }
}

// ------------------------------------------------- 对比滑块（体量 ↔ 框架）
// 参照 3D Gaussian Splatting（SIGGRAPH 2023 Best Paper）的 before/after 做法。

export function comparePercent(clientX, rect) {
  if (!rect.width) return 0;
  const p = ((clientX - rect.left) / rect.width) * 100;
  return p <= 0 ? 0 : p > 100 ? 100 : p;
}

export function initCompare(doc) {
  for (const box of doc.querySelectorAll("[data-compare]")) {
    const handle = box.querySelector(".cmp-handle");
    if (!handle) continue;

    const set = (pct) => {
      box.style.setProperty("--split", pct + "%");
      handle.setAttribute("aria-valuenow", String(Math.round(pct)));
    };
    const fromEvent = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      set(comparePercent(x, box.getBoundingClientRect()));
    };

    let dragging = false;
    box.addEventListener("pointerdown", (e) => {
      dragging = true; box.setPointerCapture?.(e.pointerId); fromEvent(e);
    });
    box.addEventListener("pointermove", (e) => { if (dragging) fromEvent(e); });
    for (const ev of ["pointerup", "pointercancel", "pointerleave"]) {
      box.addEventListener(ev, () => { dragging = false; });
    }
    // 键盘可达：方向键步进
    handle.addEventListener("keydown", (e) => {
      const now = Number(handle.getAttribute("aria-valuenow")) || 50;
      const step = e.shiftKey ? 10 : 2;
      if (e.key === "ArrowLeft") { set(Math.max(0, now - step)); e.preventDefault(); }
      if (e.key === "ArrowRight") { set(Math.min(100, now + step)); e.preventDefault(); }
    });
    set(50);
  }
}

// ------------------------------------- 进入视口才播的视频（学术页用）
// 四个 Best Paper 参照站首页都是视频驱动的。但学术页要能打印、能截进幻灯片，
// 所以不用 autoplay 属性：由 JS 在进入视口时播，离开就停；
// reduced-motion 或没有 IntersectionObserver 时退化成带控件的静止首帧。

// 一个页面上同时播的视频数必须设上限。实测：22 个 <video> 的页面上，
// 一次性对 12 个调 play()，一个都播不起来（Chrome 的并发媒体上限）；
// 手动只播 4 个则全部成功。所以只让最靠近视口中心的几个播。
export const PLAY_BUDGET = 6;

export function pickToPlay(vids, viewportH, budget, rectOf) {
  if (budget <= 0) return [];
  const mid = viewportH / 2;
  return vids
    .map((v) => ({ v, r: rectOf(v) }))
    .filter(({ r }) => r.top < viewportH && r.bottom > 0)
    .map((o) => ({ ...o, d: Math.abs((o.r.top + o.r.bottom) / 2 - mid) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, budget)
    .map((o) => o.v);
}

export function initInViewVideo(doc, opts = {}) {
  const vids = [...doc.querySelectorAll("video[data-inview]")];
  if (!vids.length) return;
  const still = opts.still ?? reduced();
  const budget = opts.budget ?? PLAY_BUDGET;

  if (still) {                       // reduced-motion：全部停在 poster
    for (const v of vids) v.controls = true;
    return;
  }

  let ticking = false;
  const apply = () => {
    ticking = false;
    const want = new Set(pickToPlay(vids, innerHeight, budget,
                                    (v) => v.getBoundingClientRect()));
    for (const v of vids) {
      if (want.has(v)) {
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    }
  };
  const schedule = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(apply); }
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });

  // 光靠 scroll 事件不够：实测滚到网格后 readyState=4、手动 play() 全部成功，
  // 但自动路径一个都没播——触发没发生。IntersectionObserver 在元素进出视口时
  // 必定回调，用它做主触发器，scroll 只作补充。
  if (typeof IntersectionObserver !== "undefined") {
    const io = new IntersectionObserver(schedule, { threshold: [0, 0.25, 0.6] });
    for (const v of vids) io.observe(v);
  }
  apply();
}

// --------------------------------------------------- 点击看大图（lightbox）

export function lightboxCaption({ alt = "", caption = "" } = {}) {
  const flat = (t) => String(t).replace(/\s+/g, " ").trim();
  return flat(caption) || flat(alt) || "";
}

export function initLightbox(doc) {
  const imgs = [...doc.querySelectorAll("figure.paperfig img, figure.introfig img")];
  if (!imgs.length) return;

  const box = doc.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.innerHTML = '<img alt=""><p class="lb-cap"></p>';
  doc.body.appendChild(box);
  const big = box.querySelector("img");
  const cap = box.querySelector(".lb-cap");

  const close = () => { box.classList.remove("on"); big.src = ""; };
  box.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  for (const img of imgs) {
    img.addEventListener("click", () => {
      const fig = img.closest("figure");
      const fc = fig && fig.querySelector("figcaption");
      big.src = img.currentSrc || img.src;
      big.alt = img.alt || "";
      cap.textContent = lightboxCaption({
        alt: img.alt, caption: fc ? fc.textContent : "" });
      box.classList.add("on");
    });
  }
}

// ------------------------------------------------------------------- 启动
if (typeof document !== "undefined") {
  initScrub(document);
  initStages(document);
  initReveal(document);
  initCards(document);
  initFilters(document);
  initCompare(document);
  initInViewVideo(document);
  initLightbox(document);
}
