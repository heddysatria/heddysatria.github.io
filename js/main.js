const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector(".nav-links");
const sections = [...document.querySelectorAll("main section[id]")];
const links = [...document.querySelectorAll(".nav-links a")];

document.querySelectorAll(".project-media-slot").forEach((slot) => {
  const image = new Image();
  image.alt = slot.dataset.alt || "";
  image.decoding = "async";
  image.onload = () => {
    slot.append(image);
    slot.classList.add("has-image");
  };
  image.src = slot.dataset.imageSrc;
});

const stubbyTabs = [...document.querySelectorAll("[data-stubby-view]")];
const stubbyPanel = document.querySelector("#stubby-panel");
const stubbyViews = {
  app: {
    source: "assets/projects/stubby.png",
    alt: "Stubby matchmaking application",
    caption: "Implemented Application",
  },
};

const createStubbyImage = ({ source, alt }) => {
  const image = new Image();
  image.alt = alt;
  image.src = source;
  return image;
};

const showStubbyView = (tab) => {
  const view = stubbyViews[tab.dataset.stubbyView];
  if (!stubbyPanel || (tab.dataset.stubbyView !== "design" && !view)) return;

  stubbyTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  stubbyPanel.setAttribute("aria-labelledby", tab.id);
  stubbyPanel.dataset.view = tab.dataset.stubbyView;
  stubbyPanel.classList.add("is-switching");

  if (tab.dataset.stubbyView === "design") {
    const designLayout = document.createElement("div");
    designLayout.className = "stubby-design-pair";
    [
      { label: "Wireframe", source: "assets/projects/stubby-wireframe.png", alt: "Stubby UX wireframe" },
      { label: "Figma Prototype", source: "assets/projects/stubby-prototype.png", alt: "Stubby Figma prototype" },
    ].forEach((item) => {
      const figure = document.createElement("figure");
      figure.append(createStubbyImage(item));
      const caption = document.createElement("figcaption");
      caption.textContent = item.label;
      figure.append(caption);
      designLayout.append(figure);
    });
    stubbyPanel.replaceChildren(designLayout);
    requestAnimationFrame(() => stubbyPanel.classList.remove("is-switching"));
    return;
  }

  const image = createStubbyImage(view);
  const caption = document.createElement("span");
  caption.className = "stubby-media-caption";
  caption.textContent = view.caption;
  stubbyPanel.replaceChildren(image, caption);
  stubbyPanel.classList.remove("is-switching");
};

stubbyTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => showStubbyView(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % stubbyTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + stubbyTabs.length) % stubbyTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = stubbyTabs.length - 1;
    stubbyTabs[nextIndex].focus();
    showStubbyView(stubbyTabs[nextIndex]);
  });
});

const updateHeader = () => header.classList.toggle("scrolled", scrollY > 20);
addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
links.forEach((link) =>
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }),
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.12 },
);
document
  .querySelectorAll(".reveal")
  .forEach((element) => revealObserver.observe(element));

let scrollFrame;
const updateActiveSection = () => {
  const readingLine = scrollY + header.offsetHeight + 120;
  const atPageEnd =
    innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
  const current = atPageEnd
    ? document.querySelector("#contact")
    : sections
        .filter(
          (section) => section.id !== "top" && section.offsetTop <= readingLine,
        )
        .at(-1);

  links.forEach((link) =>
    link.classList.toggle("active", link.hash === `#${current?.id}`),
  );
};

addEventListener(
  "scroll",
  () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateActiveSection);
  },
  { passive: true },
);
updateActiveSection();

document.querySelector("#year").textContent = new Date().getFullYear();
