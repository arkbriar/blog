export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";

export function getLocaleFromSlug(slug: string): Locale {
	const prefix = slug.split("/")[0];
	if (LOCALES.includes(prefix as Locale)) {
		return prefix as Locale;
	}
	return DEFAULT_LOCALE;
}

export function getBaseSlug(slug: string): string {
	const prefix = slug.split("/")[0];
	if (LOCALES.includes(prefix as Locale)) {
		return slug.slice(prefix.length + 1);
	}
	return slug;
}

export function getI18nLang(locale: Locale): string {
	const map: Record<Locale, string> = {
		zh: "zh_CN",
		en: "en",
	};
	return map[locale];
}
