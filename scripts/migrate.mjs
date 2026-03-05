import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';

const HUGO_ROOT = path.resolve('_old_hugo_blog');
const POSTS_SRC = path.join(HUGO_ROOT, 'content/posts');
const POSTS_DEST = path.resolve('src/content/posts');

function migratePosts() {
  const files = fs.readdirSync(POSTS_SRC).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} posts to migrate`);

  for (const file of files) {
    const content = fs.readFileSync(path.join(POSTS_SRC, file), 'utf-8');
    const migrated = transformPost(content, file);
    fs.writeFileSync(path.join(POSTS_DEST, file), migrated);
    console.log(`  Migrated: ${file}`);
  }
}

function transformPost(content, filename) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    console.warn(`  Warning: No YAML frontmatter in ${filename}`);
    return content;
  }

  const frontmatter = fmMatch[1];
  let body = fmMatch[2];

  const newFm = transformFrontmatter(frontmatter);
  body = transformBody(body, filename);

  return `---\n${newFm}\n---\n${body}`;
}

function transformFrontmatter(fm) {
  const lines = fm.split('\n');
  const result = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip fields not in Fuwari schema
    if (trimmed.startsWith('toc:') || trimmed.startsWith('comments:')) {
      continue;
    }

    // Rename date → published
    if (trimmed.startsWith('date:')) {
      result.push(line.replace('date:', 'published:'));
      continue;
    }

    // Convert categories (array) → category (first element, string)
    if (trimmed.startsWith('categories:')) {
      const match = trimmed.match(/categories:\s*\[(.*)\]/);
      if (match) {
        const cats = match[1].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const primary = cats[0] || '';
        result.push(`category: "${primary}"`);
      } else {
        result.push('category: ""');
      }
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}

function transformBody(body, filename) {
  // 1. Strip <!--more--> markers
  body = body.replace(/<!--more-->\n?/g, '');

  // 2. Convert backtick-wrapped math: `$...$` → $...$
  //    Also handle trailing whitespace before closing backtick: `$...$  `
  body = body.replace(/`(\$[\s\S]*?\$)\s*`/g, '$1');

  // 3. Fix mis\`ere → misère (escaped backtick in game_theory.md)
  body = body.replace(/mis\\`ere/g, 'misère');

  // 4. Fix malformed LaTeX: \sum_\limits{...} → \sum\limits_{...}
  body = body.replace(/\\sum_\\limits\{/g, '\\sum\\limits_{');

  // 5. Fix display math with trailing punctuation on same line
  //    Move trailing punctuation to next line: $$...$$，→ $$...$$ \n，
  body = body.replace(/\$\$([，。、；！？,.])/g, '$$$$ \n$1');

  // 6. Image paths: use /img/ for public directory (Fuwari serves from public/)
  //    No change needed — images will be in public/img/

  return body;
}

migratePosts();
console.log('\nMigration complete!');
