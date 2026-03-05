# crazy.ark blog

Personal technical blog built with [Astro 5](https://astro.build/) and the [Fuwari](https://github.com/saicaca/fuwari) theme. Primarily Chinese writing on algorithms, data structures, math, and systems programming.

## Stack

- **Astro 5 + Fuwari** — stylish blog theme with animated transitions, search, light/dark mode
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
├── content/
│   ├── config.ts        # Content collection schema (Zod)
│   ├── posts/           # Markdown blog posts
│   └── spec/about.md    # About page content
├── pages/
│   ├── [...page].astro  # Home with pagination
│   ├── posts/[...slug].astro
│   ├── archive.astro
│   └── about.astro
└── styles/              # Tailwind + custom CSS
public/
├── img/                 # Blog images
└── favicon.ico
```

## Migration

Migrated from Hugo (`_old_hugo_blog/`). The migration script (`scripts/migrate.mjs`) handles:

- Converting frontmatter to Fuwari schema (`date` -> `published`, `categories[]` -> `category`)
- Stripping backtick-wrapped LaTeX (Hugo blackfriday workaround)
- Fixing malformed LaTeX (`\sum_\limits{}` -> `\sum\limits_{}`)
- Fixing escaped backticks in text (`mis\`ere` -> `misere`)
- Removing `<!--more-->` summary markers
- Separating display math trailing punctuation
