(() => {
  "use strict";

  /*
   * Programme pages, in reading order.
   * To add a page, drop the image into /pages and add its path below.
   */
  const PAGES = [
    "pages/0.png",
    "pages/1.png",
  ];

  const booklet = document.getElementById("booklet");

  if (!booklet || PAGES.length === 0) {
    return;
  }

  const pages = [];
  let activeIndex = 0;

  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setActive = (index) => {
    activeIndex = index;

    pages.forEach((page, pageIndex) => {
      page.classList.toggle("is-active", pageIndex === index);
    });
  };

  const goTo = (index) => {
    const targetIndex = Math.max(0, Math.min(pages.length - 1, index));
    const target = pages[targetIndex];

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  PAGES.forEach((src, index) => {
    const section = document.createElement("section");
    section.className = "page";
    section.id = `page-${index + 1}`;
    section.setAttribute("aria-label", `Programme page ${index + 1} of ${PAGES.length}`);
    section.setAttribute("aria-roledescription", "page");

    const frame = document.createElement("figure");
    frame.className = "page__frame";

    const img = document.createElement("img");
    img.alt = `Programme page ${index + 1} of ${PAGES.length}`;
    img.decoding = "async";
    img.loading = index < 2 ? "eager" : "lazy";
    img.draggable = false;

    if (index === 0) {
      img.fetchPriority = "high";
    }

    img.addEventListener("load", () => frame.classList.add("is-loaded"), { once: true });
    img.addEventListener("error", () => {
      frame.classList.remove("is-loaded");
      frame.classList.add("is-error");
    }, { once: true });

    img.src = src;

    if (img.complete && img.naturalWidth > 0) {
      frame.classList.add("is-loaded");
    }

    frame.appendChild(img);
    section.appendChild(frame);
    booklet.appendChild(section);
    pages.push(section);
  });

  const hashMatch = window.location.hash.match(/^#page-(\d+)$/);
  const initialIndex = hashMatch
    ? Math.max(0, Math.min(pages.length - 1, Number(hashMatch[1]) - 1))
    : 0;

  setActive(initialIndex);

  if (initialIndex > 0) {
    booklet.scrollTop = pages[initialIndex].offsetTop;
  }

  let ticking = false;

  const syncActivePage = () => {
    ticking = false;

    const pageHeight = booklet.clientHeight || 1;
    const index = Math.max(
      0,
      Math.min(pages.length - 1, Math.round(booklet.scrollTop / pageHeight))
    );

    if (index !== activeIndex) {
      setActive(index);
    }
  };

  booklet.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(syncActivePage);
    }
  }, { passive: true });

  window.addEventListener("resize", syncActivePage);

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    let nextIndex = null;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
      case "PageDown":
        nextIndex = activeIndex + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
      case "PageUp":
        nextIndex = activeIndex - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = pages.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    goTo(nextIndex);
  });
})();
