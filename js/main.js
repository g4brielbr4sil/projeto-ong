"use strict";

document.documentElement.classList.add("js");

const app = document.querySelector("#app");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navCta = document.querySelector(".nav-cta");
const descriptionMeta = document.querySelector('meta[name="description"]');
const successToast = document.querySelector("#toastSucesso");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const VOLUNTEER_DRAFT_STORAGE_KEY = "solidariedade-voluntariado-draft-v1";
const VOLUNTEER_DRAFT_FIELDS = Object.freeze(["nome", "cidade", "estado", "area", "mensagem"]);
const VOLUNTEER_DRAFT_INPUT_FIELDS = Object.freeze(["nome", "cidade", "mensagem"]);
const VOLUNTEER_DRAFT_CHANGE_FIELDS = Object.freeze(["estado", "area"]);

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

const projectsData = [
  {
    id: "educacao",
    number: "01",
    icon: "Aa",
    category: "Educação",
    pillarDescription: "Reforço escolar, inclusão digital e oficinas que abrem novas perspectivas para crianças e jovens.",
    badge: { label: "Educação", modifier: "success" },
    preview: {
      label: "Educação",
      title: "Educação para Todos",
      description: "Aprender muda o jeito de ver o mundo.",
      image: "educacao",
      alt: "Estudantes em sala de aula acompanhando uma atividade",
      width: 900,
      height: 700
    },
    detail: {
      title: "Educação para Todos",
      image: "educacao",
      alt: "Professora orientando estudantes durante uma atividade em sala",
      lead: "Aprender não deveria depender do CEP. Criamos espaços acolhedores para ampliar repertórios e perspectivas.",
      objective: "Apoiar crianças e adolescentes no desenvolvimento escolar e no acesso consciente às ferramentas digitais.",
      activities: [
        "Reforço e acompanhamento escolar",
        "Oficinas de inclusão digital",
        "Circulação de livros e materiais"
      ],
      formArea: "educacao"
    }
  },
  {
    id: "alimentacao",
    number: "02",
    icon: "◒",
    category: "Segurança alimentar",
    pillarDescription: "Mobilização solidária para apoiar famílias com alimentos e fortalecer redes locais de cuidado.",
    badge: { label: "Segurança alimentar", modifier: "info" },
    preview: {
      label: "Alimentação",
      title: "Alimento que Transforma",
      image: "alimentacao",
      alt: "Voluntários separando alimentos para doação",
      width: 800,
      height: 520
    },
    detail: {
      title: "Alimento que Transforma",
      image: "alimentacao",
      alt: "Pessoas voluntárias organizando doações de alimentos",
      lead: "Cuidado também chega à mesa. Mobilizamos redes solidárias para apoiar famílias com respeito e proximidade.",
      objective: "Contribuir com a segurança alimentar e fortalecer uma rede comunitária de apoio contínuo.",
      activities: [
        "Campanhas de arrecadação",
        "Organização de cestas essenciais",
        "Distribuição comunitária responsável"
      ],
      formArea: "alimentacao"
    }
  },
  {
    id: "comunidade",
    number: "03",
    icon: "◎",
    category: "Inclusão social",
    pillarDescription: "Vivências, cultura e capacitação para promover autonomia, cidadania e pertencimento.",
    badge: { label: "Mobilização comunitária", modifier: "warm" },
    preview: {
      label: "Inclusão",
      title: "Comunidade em Movimento",
      image: "inclusao-social",
      alt: "Crianças reunidas em atividade comunitária",
      width: 800,
      height: 520
    },
    detail: {
      title: "Comunidade em Movimento",
      image: "inclusao-social",
      alt: "Crianças participando juntas de uma atividade comunitária",
      lead: "Pertencer também transforma. Criamos encontros que estimulam autonomia, convivência e participação cidadã.",
      objective: "Promover experiências coletivas que valorizem talentos locais, cultura e desenvolvimento comunitário.",
      activities: [
        "Oficinas de capacitação",
        "Atividades culturais e esportivas",
        "Rodas de conversa e orientação"
      ],
      formArea: "eventos"
    }
  }
];

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

function loadView(route) {
  const template = document.querySelector(`#${route.templateId}`);
  if (!template) throw new Error(`Template não encontrado: ${route.templateId}`);
  return template.innerHTML;
}

function pillarTemplate(project) {
  return `
    <article class="pillar-item reveal">
      <span class="pillar-number">${project.number}</span>
      <div class="pillar-icon" aria-hidden="true">${project.icon}</div>
      <div><h3>${project.category}</h3><p>${project.pillarDescription}</p></div>
      <a href="#projetos/${project.id}" aria-label="Conhecer o projeto de ${project.category.toLowerCase()}">↗</a>
    </article>`;
}

function projectPreviewTemplate(project, isLarge = false) {
  const { preview } = project;
  const description = preview.description ? `<p>${preview.description}</p>` : "";

  return `
    <article class="project-preview${isLarge ? " project-preview-large" : ""} reveal">
      <a href="#projetos/${project.id}" aria-label="Conhecer ${preview.title}">
        <picture>
          <source srcset="../imagens/${preview.image}.webp" type="image/webp">
          <img src="../imagens/${preview.image}.jpg" alt="${preview.alt}" width="${preview.width}" height="${preview.height}">
        </picture>
        <div class="preview-overlay"><span>${preview.label}</span><h3>${preview.title}</h3>${description}</div>
      </a>
    </article>`;
}

function projectBadgeTemplate(project) {
  return `<li><span class="feedback-badge feedback-badge-${project.badge.modifier}">${project.badge.label}</span></li>`;
}

function activityTemplate(activity, index) {
  return `<li><span>${String(index + 1).padStart(2, "0")}</span> ${activity}</li>`;
}

function projectDetailTemplate(project, index) {
  const { detail } = project;
  const activities = detail.activities.map(activityTemplate).join("");

  return `
    <div class="project-detail${index % 2 === 1 ? " project-detail-alt" : ""}" id="${project.id}">
      <div class="container project-detail-grid">
        <div class="project-detail-media reveal">
          <span class="project-index">${project.number} / ${String(projectsData.length).padStart(2, "0")}</span>
          <picture>
            <source srcset="../imagens/${detail.image}.webp" type="image/webp">
            <img src="../imagens/${detail.image}.jpg" alt="${detail.alt}" width="900" height="720">
          </picture>
        </div>
        <article class="project-detail-copy reveal reveal-delay">
          <p class="eyebrow"><span></span> ${project.category}</p>
          <h2 id="${project.id}-titulo">${detail.title}</h2>
          <p class="project-lead">${detail.lead}</p>
          <div class="project-objective"><h3>Nosso objetivo</h3><p>${detail.objective}</p></div>
          <ul class="impact-list" aria-label="Atividades do projeto">${activities}</ul>
          <a class="button button-primary" href="#voluntariado?area=${detail.formArea}">Quero contribuir <span aria-hidden="true">↗</span></a>
        </article>
      </div>
    </div>`;
}

function renderPillars(projects) {
  return projects.map(pillarTemplate).join("");
}

function renderFeaturedProjects(projects) {
  const [featuredProject, ...otherProjects] = projects;
  const featured = projectPreviewTemplate(featuredProject, true);
  const stack = otherProjects.map((project) => projectPreviewTemplate(project)).join("");

  return `${featured}<div class="featured-stack">${stack}</div>`;
}

function renderProjectBadges(projects) {
  return projects.map(projectBadgeTemplate).join("");
}

function renderProjectDetails(projects) {
  return projects.map(projectDetailTemplate).join("");
}

function renderDynamicComponents() {
  const componentRenderers = {
    "home-pillars": renderPillars,
    "featured-projects": renderFeaturedProjects,
    "project-badges": renderProjectBadges,
    "project-details": renderProjectDetails
  };

  app.querySelectorAll("[data-component]").forEach((container) => {
    const renderComponent = componentRenderers[container.dataset.component];
    if (renderComponent) container.innerHTML = renderComponent(projectsData);
  });
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

function saveFormDraft(form) {
  const draft = {
    nome: form.elements.namedItem("nome")?.value ?? "",
    cidade: form.elements.namedItem("cidade")?.value ?? "",
    estado: form.elements.namedItem("estado")?.value ?? "",
    area: form.elements.namedItem("area")?.value ?? "",
    mensagem: form.elements.namedItem("mensagem")?.value ?? ""
  };

  try {
    localStorage.setItem(VOLUNTEER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // O formulário continua funcional quando o armazenamento estiver indisponível.
  }
}

function removeFormDraft() {
  try {
    localStorage.removeItem(VOLUNTEER_DRAFT_STORAGE_KEY);
  } catch {
    // Falhas de acesso ao armazenamento não devem interromper a experiência.
  }
}

function loadFormDraft(form) {
  try {
    const storedDraft = localStorage.getItem(VOLUNTEER_DRAFT_STORAGE_KEY);
    if (!storedDraft) return;

    const draft = JSON.parse(storedDraft);
    if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
      removeFormDraft();
      return;
    }

    VOLUNTEER_DRAFT_FIELDS.forEach((fieldName) => {
      const field = form.elements.namedItem(fieldName);
      const storedValue = draft[fieldName];
      if (!field || typeof storedValue !== "string") return;

      if (field instanceof HTMLSelectElement) {
        const hasOption = Array.from(field.options).some((option) => option.value === storedValue);
        if (hasOption) field.value = storedValue;
        return;
      }

      const maximumLength = field.maxLength > -1 ? field.maxLength : storedValue.length;
      field.value = storedValue.slice(0, maximumLength);
    });
  } catch {
    removeFormDraft();
  }
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

  loadFormDraft(form);

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

  form.addEventListener("input", (event) => {
    if (VOLUNTEER_DRAFT_INPUT_FIELDS.includes(event.target.name)) saveFormDraft(form);
  }, { signal });

  form.addEventListener("change", (event) => {
    if (VOLUNTEER_DRAFT_CHANGE_FIELDS.includes(event.target.name)) saveFormDraft(form);
  }, { signal });

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
    removeFormDraft();
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

function renderRoute() {
  const routeState = resolveRoute();
  const route = routes[routeState.key];
  app.setAttribute("aria-busy", "true");

  try {
    const viewHtml = loadView(route);

    cleanupActiveView();
    activeViewController = new AbortController();
    app.innerHTML = viewHtml;
    renderDynamicComponents();
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
