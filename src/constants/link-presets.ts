import I18nKey from "@i18n/i18nKey";
import { i18n, i18nForLocale } from "@i18n/translation";
import { LinkPreset, type NavBarLink } from "@/types/config";
import type { Locale } from "@utils/locale-utils";
import { DEFAULT_LOCALE } from "@utils/locale-utils";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: i18n(I18nKey.home),
		url: "/",
	},
	[LinkPreset.About]: {
		name: i18n(I18nKey.about),
		url: "/about/",
	},
	[LinkPreset.Archive]: {
		name: i18n(I18nKey.archive),
		url: "/archive/",
	},
};

export function getLocalizedLinkPresets(
	locale: Locale,
): { [key in LinkPreset]: NavBarLink } {
	const loc = locale || DEFAULT_LOCALE;
	const t = (key: I18nKey) => i18nForLocale(loc, key);
	return {
		[LinkPreset.Home]: {
			name: t(I18nKey.home),
			url: `/${loc}/`,
		},
		[LinkPreset.About]: {
			name: t(I18nKey.about),
			url: `/${loc}/about/`,
		},
		[LinkPreset.Archive]: {
			name: t(I18nKey.archive),
			url: `/${loc}/archive/`,
		},
	};
}
