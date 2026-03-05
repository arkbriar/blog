# Handover Summary

## What Was Done

Migrated a Hugo blog (`_old_hugo_blog/`) to Astro 5 with the [Fuwari](https://github.com/saicaca/fuwari) theme.

### 1. Fuwari Theme Setup
- Cloned Fuwari template, installed with `pnpm`
- Configured `src/config.ts`: site title "crazy.ark", lang `zh_CN`, avatar, GitHub/Twitter links, TOC depth 3, favicon
- Set site URL to `https://blog.crazyark.xyz/` in `astro.config.mjs`
- Fixed a Tailwind CSS build error: `@apply link` in `markdown.css` failed because the custom `link` class (defined in `main.css` `@layer components`) wasn't resolvable cross-file with newer postcss. Inlined the equivalent utilities directly.

### 2. Content Migration (`scripts/migrate.mjs`)
Migrated 36 markdown posts from Hugo to Fuwari's content collection format:
- **Frontmatter**: `date` → `published`, `categories[]` → `category` (string, first element), dropped `toc`/`comments`
- **Math**: Stripped backtick wrappers from `$...$` expressions (Hugo blackfriday workaround). Regex handles optional trailing whitespace before closing backtick.
- **Content fixes**:
  - `stoer_wagner_al.md`: `\sum_\limits{` → `\sum\limits_{` (valid LaTeX)
  - `game_theory.md`: `mis\`ere` → `misère` (3 occurrences)
  - `bloom_filter.md`: Moved trailing Chinese comma after `$$...$$` to its own line
- Stripped `<!--more-->` markers
- Image paths stay as `/img/...` (served from `public/img/`)

### 3. Pangu Spacing (`scripts/pangu-spacing.mjs`)
Added spaces between CJK and Latin/number characters (254 lines across 26 posts). The script:
- Protects math (`$...$`, `$$...$$`), inline code, code blocks, markdown links, HTML tags
- Does NOT add spaces before CJK punctuation (。，；：！？、)
- 5 pre-existing spaces before Chinese punctuation in the original Hugo content were left as-is

### 4. Assets
- Images: `_old_hugo_blog/static/img/` → `public/img/` (including `posts/` subfolder, avatar)
- Favicon: `public/favicon.ico`
- PDF: `public/files/Concurrent_Tries_with_Efficient_Non-Blocking_Snaps.pdf`
- About page: `src/content/spec/about.md`

### 5. Known Items
- 11 draft posts are included (they don't appear in the built site)
- KaTeX warning about Unicode comma in math mode — cosmetic, doesn't affect rendering
- The `_old_hugo_blog/` directory is excluded from git but kept locally for reference
- Contact page was dropped (Formspree integration was broken/outdated)

## Key Commands
```bash
pnpm install        # install dependencies
pnpm dev            # dev server
pnpm build          # production build + Pagefind search index
pnpm preview        # preview production build
```

## Build Stats
- 31 pages: 26 published posts + 4 pagination pages + about + archive
- 26 pages indexed by Pagefind
- All math (KaTeX), images, and code blocks verified working
