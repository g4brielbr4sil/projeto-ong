const VOLUNTEER_DRAFT_STORAGE_KEY = "solidariedade-voluntariado-draft-v1";

const VOLUNTEER_DRAFT_FIELDS = Object.freeze(["nome", "cidade", "estado", "area", "mensagem"]);

export function saveFormDraft(draft) {
  const safeDraft = Object.fromEntries(
    VOLUNTEER_DRAFT_FIELDS.map((fieldName) => [
      fieldName,
      typeof draft[fieldName] === "string" ? draft[fieldName] : ""
    ])
  );

  try {
    localStorage.setItem(VOLUNTEER_DRAFT_STORAGE_KEY, JSON.stringify(safeDraft));
  } catch {
    // O formulário continua funcional quando o armazenamento estiver indisponível.
  }
}

export function removeFormDraft() {
  try {
    localStorage.removeItem(VOLUNTEER_DRAFT_STORAGE_KEY);
  } catch {
    // Falhas de acesso ao armazenamento não devem interromper a experiência.
  }
}

export function loadFormDraft() {
  try {
    const storedDraft = localStorage.getItem(VOLUNTEER_DRAFT_STORAGE_KEY);
    if (!storedDraft) return null;

    const parsedDraft = JSON.parse(storedDraft);
    if (!parsedDraft || typeof parsedDraft !== "object" || Array.isArray(parsedDraft)) {
      removeFormDraft();
      return null;
    }

    return Object.fromEntries(
      VOLUNTEER_DRAFT_FIELDS.flatMap((fieldName) => (
        typeof parsedDraft[fieldName] === "string" ? [[fieldName, parsedDraft[fieldName]]] : []
      ))
    );
  } catch {
    removeFormDraft();
    return null;
  }
}
