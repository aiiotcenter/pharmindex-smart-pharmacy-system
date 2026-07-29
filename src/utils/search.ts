const TR_MAP: Record<string, string> = {
  ı: "i",
  İ: "i",
  I: "i",
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
};

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .split("")
    .map((char) => TR_MAP[char] ?? char)
    .join("")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function buildSearchPattern(value: string): string | null {
  const normalized = normalizeSearchText(value);
  if (!normalized) {
    return null;
  }
  return `%${normalized}%`;
}
