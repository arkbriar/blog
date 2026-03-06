<script lang="ts">
import { onMount, onDestroy } from "svelte";

const localeLabels: Record<string, string> = {
	zh: "EN",
	en: "中文",
};

let currentLocale = "zh";
let targetPath = "/en/";

function detectLocale() {
	const path = window.location.pathname;
	const match = path.match(/^\/(zh|en)(\/|$)/);
	currentLocale = match ? match[1] : "zh";
	const otherLocale = currentLocale === "zh" ? "en" : "zh";
	targetPath = path.replace(/^\/(zh|en)(\/|$)/, `/${otherLocale}$2`);
}

function onSwupReplace() {
	detectLocale();
}

onMount(() => {
	detectLocale();
	document.addEventListener("swup:contentReplaced", onSwupReplace);
});

onDestroy(() => {
	if (typeof document !== "undefined") {
		document.removeEventListener("swup:contentReplaced", onSwupReplace);
	}
});
</script>

<a
	href={targetPath}
	data-no-swup
	aria-label="Switch language"
	class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 flex items-center justify-center text-sm font-bold"
>
	{localeLabels[currentLocale] || "EN"}
</a>
