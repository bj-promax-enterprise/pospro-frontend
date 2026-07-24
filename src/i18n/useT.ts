import { usePreferencesStore } from "../stores/preferencesStore";
import { translations } from "./translations";

function resolve(obj: unknown, path: string[]): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function useT() {
  const language = usePreferencesStore((s) => s.language);

  return function t(key: string, vars?: Record<string, string | number>): string {
    const path = key.split(".");
    let value = resolve(translations[language], path);
    if (typeof value !== "string") {
      value = resolve(translations.zh, path);
    }
    if (typeof value !== "string") {
      return key;
    }
    if (!vars) return value;
    return Object.entries(vars).reduce(
      (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
      value
    );
  };
}
