const MASK_CONFIGURATIONS = Object.freeze([
  { field: "cpf", pattern: "000.000.000-00" },
  { field: "telefone", pattern: "(00) 00000-0000" },
  { field: "cep", pattern: "00000-000" }
]);

export function initInputMasks({ fields, onAccept, signal }) {
  if (typeof window.IMask !== "function") return;

  const maskInstances = MASK_CONFIGURATIONS.flatMap(({ field, pattern }) => {
    const input = fields[field];
    if (!input) return [];

    const mask = window.IMask(input, { mask: pattern });
    mask.on("accept", () => onAccept(input));
    return [mask];
  });

  signal.addEventListener("abort", () => {
    maskInstances.forEach((mask) => mask.destroy());
  }, { once: true });
}
