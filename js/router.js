import { initReveal } from "./animations.js";
import { projectsData } from "./data/projects.js";
import { initVolunteerForm } from "./form.js";
import { prepareViewLinks, updateGlobalNavigation } from "./navigation.js";
import { renderDynamicComponents } from "./templates/projects.js";

const routes = {
  "#inicio": {
    templateId: "view-inicio",
    title: "Solidariedade em Ação | Transformar começa perto",
    description: "A Solidariedade em Ação conecta pessoas e comunidades em iniciativas de educação, segurança alimentar e inclusão social em Brasília."
  },
  "#projetos": {
    templateId: "view-projetos",
    title: "Projetos | Solidariedade em Ação",
    description: "Conheça as iniciativas de educação, segurança alimentar e inclusão social da Solidariedade em Ação em Brasília."
  },
  "#voluntariado": {
    templateId: "view-voluntariado",
    bodyClass: "form-page",
    title: "Voluntariado | Solidariedade em Ação",
    description: "Cadastre seu interesse em participar como pessoa voluntária das iniciativas da Solidariedade em Ação."
  }
};

function parseHash(hash = window.location.hash) {
  let decodedHash;

  try {
    decodedHash = decodeURIComponent(hash || "");
  } catch {
    decodedHash = "";
  }

  const routeValue = decodedHash.replace(/^#/, "");
  const [pathValue = "", queryValue = ""] = routeValue.split("?", 2);
  const [routeName = "", section = ""] = pathValue.split("/", 2);

  return {
    key: `#${routeName}`,
    params: new URLSearchParams(queryValue),
    section
  };
}

function resolveRoute() {
  if (!window.location.hash) {
    window.history.replaceState(null, "", "#inicio");
  }

  let routeState = parseHash();

  if (!routes[routeState.key]) {
    window.history.replaceState(null, "", "#inicio");
    routeState = parseHash("#inicio");
  }

  return routeState;
}

function loadView(route) {
  const template = document.querySelector(`#${route.templateId}`);
  if (!template) throw new Error(`Template não encontrado: ${route.templateId}`);
  return template.innerHTML;
}

function scrollToRouteSection(section) {
  const target = section ? document.getElementById(section) : null;

  if (target) {
    target.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function redirectLegacyPage() {
  const pageName = window.location.pathname.split("/").pop();
  const legacySection = window.location.hash.replace(/^#/, "");
  const legacyArea = new URLSearchParams(window.location.search).get("area");
  let spaHash = "#inicio";

  if (pageName === "projetos.html") {
    spaHash = legacySection ? `#projetos/${legacySection}` : "#projetos";
  }

  if (pageName === "cadastro.html") {
    spaHash = legacyArea ? `#voluntariado?area=${encodeURIComponent(legacyArea)}` : "#voluntariado";
  }

  window.location.replace(`index.html${spaHash}`);
}

export function createRouter({
  app,
  navCta,
  descriptionMeta,
  successToast,
  closeMenu,
  prefersReducedMotion
}) {
  let hasRendered = false;
  let activeViewController = null;
  let cleanupReveal = () => {};

  function cleanupActiveView() {
    activeViewController?.abort();
    activeViewController = null;
    cleanupReveal();
    cleanupReveal = () => {};
  }

  function renderRoute() {
    const routeState = resolveRoute();
    const route = routes[routeState.key];
    app.setAttribute("aria-busy", "true");

    try {
      const viewHtml = loadView(route);

      cleanupActiveView();
      activeViewController = new AbortController();
      app.innerHTML = viewHtml;
      renderDynamicComponents(app, projectsData);
      app.dataset.route = routeState.key.slice(1);
      app.dataset.routeSection = routeState.section;
      app.removeAttribute("aria-busy");

      document.body.classList.toggle("form-page", route.bodyClass === "form-page");
      document.title = route.title;
      if (descriptionMeta) descriptionMeta.content = route.description;

      prepareViewLinks(app, routeState.key);
      updateGlobalNavigation(routeState.key, navCta);
      closeMenu();
      cleanupReveal = initReveal(app, prefersReducedMotion);

      if (routeState.key === "#voluntariado") {
        initVolunteerForm({
          app,
          params: routeState.params,
          signal: activeViewController.signal,
          successToast,
          prefersReducedMotion
        });
      }

      const shouldFocusApp = hasRendered && !routeState.section;
      hasRendered = true;

      window.setTimeout(() => {
        scrollToRouteSection(routeState.section);
        if (shouldFocusApp) app.focus({ preventScroll: true });
      }, 0);
    } catch (error) {
      app.removeAttribute("aria-busy");
      console.error(error);
    }
  }

  function handleSpaNavigation(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link) return;

    if (link.matches("[data-skip-link]")) {
      event.preventDefault();
      window.setTimeout(() => {
        app.focus({ preventScroll: true });
        app.scrollIntoView({ behavior: "auto", block: "start" });
      }, 0);
      return;
    }

    const targetHash = link.getAttribute("href");
    if (!targetHash?.startsWith("#") || !routes[parseHash(targetHash).key]) return;

    event.preventDefault();
    closeMenu();

    if (window.location.hash === targetHash) renderRoute();
    else window.location.hash = targetHash;
  }

  function start() {
    document.addEventListener("click", handleSpaNavigation);
    window.addEventListener("hashchange", renderRoute);
    renderRoute();
  }

  return { renderRoute, start };
}
