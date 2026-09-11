document.documentElement.classList.add("js");

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function closeMenu() {
  if (!navToggle || !siteNav) return;

  navToggle.setAttribute("aria-expanded", "false");
  navToggle.querySelector(".sr-only").textContent = "Abrir menu";
  siteNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navToggle.querySelector(".sr-only").textContent = isOpen ? "Abrir menu" : "Fechar menu";
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      navToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  revealElements.forEach((element) => revealObserver.observe(element));
}

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const form = document.querySelector("#formCadastro");

if (form) {
  const cpf = form.querySelector("#cpf");
  const telefone = form.querySelector("#telefone");
  const cep = form.querySelector("#cep");
  const birthDate = form.querySelector("#dataNascimento");
  const area = form.querySelector("#area");
  const message = form.querySelector("#mensagem");
  const messageCounter = form.querySelector("#contadorMensagem");
  const successMessage = form.querySelector("#mensagemSucesso");
  const successToast = document.querySelector("#toastSucesso");
  const toastClose = successToast?.querySelector(".toast-close");
  let toastAutoHideTimer;
  let toastTransitionTimer;

  function hideSuccessToast() {
    if (!successToast || successToast.hidden) return;

    window.clearTimeout(toastAutoHideTimer);
    window.clearTimeout(toastTransitionTimer);
    successToast.classList.remove("is-visible");

    if (prefersReducedMotion) {
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

  toastClose?.addEventListener("click", hideSuccessToast);

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

  function bindMask(input, formatter) {
    if (!input) return;
    input.addEventListener("input", () => {
      input.value = formatter(input.value);
      clearFieldError(input);
    });
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

    if (input.validity.tooShort) {
      errorMessage = `Use pelo menos ${input.minLength} caracteres.`;
    }

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

  bindMask(cpf, formatCpf);
  bindMask(telefone, formatPhone);
  bindMask(cep, formatCep);

  if (birthDate) {
    birthDate.max = new Date().toISOString().split("T")[0];
  }

  if (area) {
    const requestedArea = new URLSearchParams(window.location.search).get("area");
    const availableOption = Array.from(area.options).some((option) => option.value === requestedArea);
    if (availableOption) area.value = requestedArea;
  }

  if (message && messageCounter) {
    const updateCounter = () => {
      messageCounter.textContent = `${message.value.length} / 500`;
    };
    message.addEventListener("input", updateCounter);
    updateCounter();
  }

  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("invalid", () => showFieldError(input));
    input.addEventListener("blur", () => {
      if (input.value || input.type === "checkbox") {
        input.validity.valid ? clearFieldError(input) : showFieldError(input);
      }
    });
    input.addEventListener("change", () => clearFieldError(input));
  });

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
  });
}
