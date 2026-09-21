function convertInternalHref(href, routeKey) {
  if (href === "index.html") return "#inicio";

  if (href.startsWith("projetos.html")) {
    const [, section = ""] = href.split("#", 2);
    return section ? `#projetos/${section}` : "#projetos";
  }

  if (href.startsWith("cadastro.html")) {
    const query = href.includes("?") ? href.split("?", 2)[1] : "";
    return query ? `#voluntariado?${query}` : "#voluntariado";
  }

  if (/^#(?:inicio|projetos|voluntariado)(?:[/?]|$)/.test(href)) {
    return href;
  }

  if (href.startsWith("#") && routeKey === "#projetos") {
    const section = href.slice(1);
    return section ? `#projetos/${section}` : "#projetos";
  }

  if (href.startsWith("#") && routeKey === "#voluntariado") {
    const section = href.slice(1);
    return section ? `#voluntariado/${section}` : "#voluntariado";
  }

  return href;
}

export function createMenuController({ navToggle, siteNav }) {
  function closeMenu({ returnFocus = false } = {}) {
    if (!navToggle || !siteNav) return;

    const wasOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.querySelector(".sr-only").textContent = "Abrir menu";
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");

    if (returnFocus && wasOpen) navToggle.focus();
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.querySelector(".sr-only").textContent = isOpen ? "Abrir menu" : "Fechar menu";
      siteNav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu({ returnFocus: true });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  return { closeMenu };
}

export function prepareViewLinks(container, routeKey) {
  container.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    link.setAttribute("href", convertInternalHref(href, routeKey));
  });
}

export function updateGlobalNavigation(routeKey, navCta) {
  document.querySelectorAll("[data-route-link]").forEach((link) => {
    const isCurrent = link.getAttribute("href") === routeKey;
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (!navCta) return;

  if (routeKey === "#voluntariado") {
    navCta.href = "#voluntariado/formulario";
    navCta.innerHTML = 'Preencher cadastro <span aria-hidden="true">↓</span>';
  } else {
    navCta.href = "#voluntariado";
    navCta.innerHTML = 'Quero participar <span aria-hidden="true">↗</span>';
  }
}
