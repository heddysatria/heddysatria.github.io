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

const certificateModal = document.querySelector("#certificate-modal");
const certificateTitle = document.querySelector("#certificate-modal-title");
const certificateImage = document.querySelector("#certificate-modal-image");
const certificateClose = certificateModal?.querySelector(".certificate-close");
const certificatePageRegions = [
  document.querySelector(".site-header"),
  document.querySelector("main"),
  document.querySelector("footer"),
].filter(Boolean);
let certificateTrigger = null;

const closeCertificate = () => {
  if (!certificateModal || certificateModal.hidden) return;
  certificateModal.hidden = true;
  document.body.classList.remove("certificate-open");
  certificatePageRegions.forEach((region) => region.removeAttribute("inert"));
  certificateImage.removeAttribute("src");
  certificateTrigger?.focus();
  certificateTrigger = null;
};

document.querySelectorAll(".certificate-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    certificateTrigger = trigger;
    certificateTitle.textContent = trigger.dataset.certificateTitle;
    certificateImage.src = trigger.dataset.certificateSrc;
    certificateImage.alt = trigger.dataset.certificateTitle;
    certificateModal.hidden = false;
    document.body.classList.add("certificate-open");
    certificatePageRegions.forEach((region) => region.setAttribute("inert", ""));
    certificateClose.focus();
  });
});

certificateModal?.querySelectorAll("[data-certificate-close]").forEach((control) => {
  control.addEventListener("click", closeCertificate);
});

certificateModal?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeCertificate();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = [...certificateModal.querySelectorAll("button:not([disabled])")];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const copyEmailButton = document.querySelector(".copy-email");
const copyEmailIcon = copyEmailButton?.querySelector(".copy-icon");
const copyEmailSuccessIcon = copyEmailButton?.querySelector(".copy-success-icon");
const copyEmailStatus = copyEmailButton?.querySelector(".copy-status");
let copyEmailFeedback;

const copyEmailFallback = (email) => {
  const input = document.createElement("textarea");
  input.value = email;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  return copied;
};

copyEmailButton?.addEventListener("click", async () => {
  const email = copyEmailButton.dataset.email;
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(email);
      copied = true;
    } else {
      copied = copyEmailFallback(email);
    }
  } catch {
    copied = copyEmailFallback(email);
  }

  clearTimeout(copyEmailFeedback);
  copyEmailIcon.toggleAttribute("hidden", copied);
  copyEmailSuccessIcon.toggleAttribute("hidden", !copied);
  copyEmailStatus.textContent = copied ? "Email copied" : "Unable to copy email address";
  copyEmailFeedback = setTimeout(() => {
    copyEmailIcon.removeAttribute("hidden");
    copyEmailSuccessIcon.setAttribute("hidden", "");
    copyEmailStatus.textContent = "";
  }, 2000);
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
