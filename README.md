# crazy.ark blog

Personal technical blog built with [Astro 5](https://astro.build/) and the [Fuwari](https://github.com/saicaca/fuwari) theme.

**Live:** [blog.crazyark.me](https://blog.crazyark.me)

## Stack

- **Astro 5 + Fuwari** — stylish blog theme with animated transitions, search, light/dark mode
- **Multilingual** — locale-prefixed routing (`/zh/`, `/en/`) with per-locale UI translations
- **KaTeX** — server-side LaTeX math rendering via remark-math + rehype-katex
- **Expressive Code** — syntax highlighting with collapsible sections and line numbers
- **Pagefind** — static search index generated at build time
- **Tailwind CSS** — styling via Fuwari's design system

## Development

```bash
pnpm install
pnpm dev          # start dev server
pnpm build        # production build + search index
pnpm preview      # preview production build
pnpm new-post <f> # scaffold a new blog post
```

## Project Structure

```
src/
├── config.ts            # Site title, nav, profile, theme config
├── utils/locale-utils.ts # Locale definitions and helpers
├── content/
│   ├── config.ts        # Content collection schema (Zod)
│   ├── posts/           # Markdown blog posts
│   └── spec/about.md    # About page content
├── pages/
│   ├── index.astro      # Root redirect to default locale
│   └── [locale]/        # Locale-prefixed routes
│       ├── [...page].astro
│       ├── posts/[...slug].astro
│       ├── archive.astro
│       └── about.astro
└── styles/              # Tailwind + custom CSS
public/
├── img/                 # Blog images
└── favicon.ico
```

## Deployment

Deployed to GitHub Pages via [GitHub Actions](.github/workflows/deploy.yml). Pushes to `main` trigger a build and deploy automatically.
