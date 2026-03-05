import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "crazy.ark",
	subtitle: "Our greatest glory is not in never falling, but rising every time we fall.",
	lang: "zh_CN",
	themeColor: {
		hue: 200,
		fixed: false,
	},
	banner: {
		enable: false,
		src: "",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 3,
	},
	favicon: [
		{
			src: "/favicon.ico",
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/arkbriar",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/img/avatar.jpg",
	name: "Ark",
	bio: "Our greatest glory is not in never falling, but rising every time we fall.",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/arkbriar",
		},
		{
			name: "Twitter",
			icon: "fa6-brands:twitter",
			url: "https://twitter.com/ImperiusDs",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
