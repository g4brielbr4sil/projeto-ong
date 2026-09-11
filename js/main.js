"use strict";

document.documentElement.classList.add("js");

const app = document.querySelector("#app");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navCta = document.querySelector(".nav-cta");
const descriptionMeta = document.querySelector('meta[name="description"]');
const successToast = document.querySelector("#toastSucesso");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!app) {
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

const routes = {
  "#inicio": {
    templateId: "view-inicio",
    title: "Solidariedade em Ação | Transformar começa perto",
    description: "A Solidariedade em Ação conecta pessoas e comunidades em iniciativas de educação, segurança alimentar e inclusão social em Brasília."
  },
  "#projetos": {
    source: "projetos.html",
    title: "Projetos | Solidariedade em Ação",
    description: "Conheça as iniciativas de educação, segurança alimentar e inclusão social da Solidariedade em Ação em Brasília."
  },
  "#voluntariado": {
    source: "cadastro.html",
    bodyClass: "form-page",
    title: "Voluntariado | Solidariedade em Ação",
    description: "Cadastre seu interesse em participar como pessoa voluntária das iniciativas da Solidariedade em Ação."
  }
};

const viewCache = new Map();
let renderVersion = 0;
let hasRendered = false;
let activeViewController = null;
let revealObserver = null;

function closeMenu({ returnFocus = false } = {}) {
  if (!navToggle || !siteNav) return;

  const wasOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.querySelector(".sr-only").textContent = "Abrir menu";
  siteNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");

  if (returnFocus && wasOpen) navToggle.focus();
}

function initNavigation() {
  if (!navToggle || !siteNav) return;

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

async function loadView(route) {
  if (route.templateId) {
    const template = document.querySelector(`#${route.templateId}`);
    if (!template) throw new Error(`Template não encontrado: ${route.templateId}`);
    return template.innerHTML;
  }

  if (!viewCache.has(route.source)) {
    const viewPromise = fetch(route.source)
      .then((response) => {
        if (!response.ok) throw new Error(`Não foi possível carregar ${route.source}.`);
        return response.text();
      })
      .then((html) => {
        const parsedDocument = new DOMParser().parseFromString(html, "text/html");
        const main = parsedDocument.querySelector("main");
        if (!main) throw new Error(`A view ${route.source} não possui um elemento main.`);
        return main.innerHTML;
      });

    viewCache.set(route.source, viewPromise);
  }

  return viewCache.get(route.source);
}

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

function prepareViewLinks(routeKey) {
  app.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    link.setAttribute("href", convertInternalHref(href, routeKey));
  });
}

function updateGlobalNavigation(routeKey) {
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

function initReveal() {
  const revealElements = app.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  revealElements.forEach((element) => revealObserver.observe(element));
}

function initForm(params, signal) {
  const form = app.querySelector("#formCadastro");
  if (!form) return;

  const cpf = form.querySelector("#cpf");
  const telefone = form.querySelector("#telefone");
  const cep = form.querySelector("#cep");
  const birthDate = form.querySelector("#dataNascimento");
  const area = form.querySelector("#area");
  const message = form.querySelector("#mensagem");
  const messageCounter = form.querySelector("#contadorMensagem");
  const successMessage = form.querySelector("#mensagemSucesso");
  const toastClose = successToast?.querySelector(".toast-close");
  let toastAutoHideTimer;
  let toastTransitionTimer;

  function hideSuccessToast({ immediate = false } = {}) {
    if (!successToast) return;

    window.clearTimeout(toastAutoHideTimer);
    window.clearTimeout(toastTransitionTimer);
    successToast.classList.remove("is-visible");

    if (immediate || prefersReducedMotion) {
      successToast.hidden = true;
      return;
    }

    toastTransitionTimer = window.setTimeout(() => {
      successToast.hidden = true;
    }, 300);
  }

  function showSuccessToast() {
    if (!successToast) return;

    window.clearTimeout(toastAutoHideTimer);
    window.clearTimeout(toastTransitionTimer);
    successToast.hidden = false;
    window.requestAnimationFrame(() => successToast.classList.add("is-visible"));
    toastAutoHideTimer = window.setTimeout(hideSuccessToast, 7000);
  }

  const onlyNumbers = (value) => value.replace(/\D/g, "");

  function formatCpf(value) {
    return onlyNumbers(value)
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function formatPhone(value) {
    const digits = onlyNumbers(value).slice(0, 11);

    if (digits.length <= 2) return digits.replace(/(\d{1,2})/, "($1");
    if (digits.length <= 6) return digits.replace(/(\d{2})(\d+)/, "($1) $2");
    if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  function formatCep(value) {
    return onlyNumbers(value).slice(0, 8).replace(/(\d{5})(\d+)/, "$1-$2");
  }

  const validationMessages = {
    nome: "Informe seu nome completo.",
    email: "Informe um e-mail válido.",
    cpf: "Use o formato 000.000.000-00.",
    telefone: "Use o formato (00) 00000-0000.",
    dataNascimento: "Informe sua data de nascimento.",
    cep: "Use o formato 00000-000.",
    cidade: "Informe sua cidade.",
    estado: "Selecione seu estado.",
    area: "Selecione uma área de interesse.",
    consentimento: "É necessário aceitar o consentimento para continuar."
  };

  function getErrorElement(input) {
    return form.querySelector(`#erro-${input.id}`);
  }

  function showFieldError(input) {
    const errorElement = getErrorElement(input);
    if (!errorElement) return;

    let errorMessage = validationMessages[input.id] || "Revise este campo.";
    if (input.validity.tooShort) errorMessage = `Use pelo menos ${input.minLength} caracteres.`;

    errorElement.textContent = errorMessage;
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", errorElement.id);
  }

  function clearFieldError(input) {
    const errorElement = getErrorElement(input);
    if (!errorElement || !input.validity.valid) return;

    errorElement.textContent = "";
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }

  function bindMask(input, formatter) {
    if (!input) return;
    input.addEventListener("input", () => {
      input.value = formatter(input.value);
      clearFieldError(input);
    }, { signal });
  }

  bindMask(cpf, formatCpf);
  bindMask(telefone, formatPhone);
  bindMask(cep, formatCep);

  if (birthDate) birthDate.max = new Date().toISOString().split("T")[0];

  if (area) {
    const requestedArea = params.get("area");
    const availableOption = Array.from(area.options).some((option) => option.value === requestedArea);
    if (availableOption) area.value = requestedArea;
  }

  if (message && messageCounter) {
    const updateCounter = () => {
      messageCounter.textContent = `${message.value.length} / 500`;
    };
    message.addEventListener("input", updateCounter, { signal });
    updateCounter();
  }

  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("invalid", () => showFieldError(input), { signal });
    input.addEventListener("blur", () => {
      if (input.value || input.type === "checkbox") {
        input.validity.valid ? clearFieldError(input) : showFieldError(input);
      }
    }, { signal });
    input.addEventListener("change", () => clearFieldError(input), { signal });
  });

  toastClose?.addEventListener("click", () => hideSuccessToast(), { signal });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    successMessage.hidden = false;
    successMessage.textContent = "Cadastro simulado com sucesso. Obrigado por querer fazer parte desta transformação.";
    form.reset();
    form.querySelectorAll("[aria-invalid]").forEach((input) => {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    });
    form.querySelectorAll(".field-error").forEach((error) => {
      error.textContent = "";
    });
    if (messageCounter) messageCounter.textContent = "0 / 500";
    showSuccessToast();
    successMessage.focus();
  }, { signal });

  signal.addEventListener("abort", () => hideSuccessToast({ immediate: true }), { once: true });
}

function cleanupActiveView() {
  activeViewController?.abort();
  revealObserver?.disconnect();
  revealObserver = null;
}

function scrollToRouteSection(section) {
  const target = section ? document.getElementById(section) : null;

  if (target) {
    target.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

async function renderRoute() {
  const currentRender = ++renderVersion;
  const routeState = resolveRoute();
  const route = routes[routeState.key];
  app.setAttribute("aria-busy", "true");

  try {
    const viewHtml = await loadView(route);
    if (currentRender !== renderVersion) return;

    cleanupActiveView();
    activeViewController = new AbortController();
    app.innerHTML = viewHtml;
    app.dataset.route = routeState.key.slice(1);
    app.dataset.routeSection = routeState.section;
    app.removeAttribute("aria-busy");

    document.body.classList.toggle("form-page", route.bodyClass === "form-page");
    document.title = route.title;
    if (descriptionMeta) descriptionMeta.content = route.description;

    prepareViewLinks(routeState.key);
    updateGlobalNavigation(routeState.key);
    closeMenu();
    initReveal();
    if (routeState.key === "#voluntariado") initForm(routeState.params, activeViewController.signal);

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

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

if (app) {
  initNavigation();
  document.addEventListener("click", handleSpaNavigation);
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}
