import { initInputMasks } from "./masks.js";
import { loadFormDraft, removeFormDraft, saveFormDraft } from "./storage.js";

const DRAFT_INPUT_FIELDS = Object.freeze(["nome", "cidade", "mensagem"]);
const DRAFT_CHANGE_FIELDS = Object.freeze(["estado", "area"]);

function collectFormDraft(form) {
  return {
    nome: form.elements.namedItem("nome")?.value ?? "",
    cidade: form.elements.namedItem("cidade")?.value ?? "",
    estado: form.elements.namedItem("estado")?.value ?? "",
    area: form.elements.namedItem("area")?.value ?? "",
    mensagem: form.elements.namedItem("mensagem")?.value ?? ""
  };
}

function restoreFormDraft(form) {
  const draft = loadFormDraft();
  if (!draft) return;

  Object.entries(draft).forEach(([fieldName, storedValue]) => {
    const field = form.elements.namedItem(fieldName);
    if (!field) return;

    if (field instanceof HTMLSelectElement) {
      const hasOption = Array.from(field.options).some((option) => option.value === storedValue);
      if (hasOption) field.value = storedValue;
      return;
    }

    const maximumLength = field.maxLength > -1 ? field.maxLength : storedValue.length;
    field.value = storedValue.slice(0, maximumLength);
  });
}

export function initVolunteerForm({ app, params, signal, successToast, prefersReducedMotion }) {
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

  initInputMasks({
    fields: { cpf, telefone, cep },
    onAccept: clearFieldError,
    signal
  });

  if (birthDate) birthDate.max = new Date().toISOString().split("T")[0];

  restoreFormDraft(form);

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
    if (DRAFT_INPUT_FIELDS.includes(event.target.name)) saveFormDraft(collectFormDraft(form));
  }, { signal });

  form.addEventListener("change", (event) => {
    if (DRAFT_CHANGE_FIELDS.includes(event.target.name)) saveFormDraft(collectFormDraft(form));
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
