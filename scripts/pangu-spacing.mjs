import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve('src/content/posts');
const ABOUT_FILE = path.resolve('src/content/spec/about.md');

// CJK ideographs (excluding punctuation \u3000-\u303f and \uff00-\uffef)
const CJK_CHARS = '\\u2e80-\\u2fff\\u3040-\\u309f\\u30a0-\\u30ff\\u3100-\\u312f\\u3200-\\u32ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\ufe30-\\ufe4f';
// CJK + CJK punctuation (for "CJK then Latin" — we DO want space after CJK punct before Latin)
const CJK_ALL = '\\u2e80-\\u9fff\\uf900-\\ufaff\\ufe30-\\ufe4f';
// CJK before Latin: add space (includes punct like 。before A)
const RE_CJK_LATIN = new RegExp(`([${CJK_ALL}])([A-Za-z0-9\\[\\(])`, 'g');
// Latin before CJK: add space only before ideographs, NOT before CJK punctuation
const RE_LATIN_CJK = new RegExp(`([A-Za-z0-9\\]\\)%])([${CJK_CHARS}])`, 'g');

function addSpacing(text) {
  text = text.replace(RE_CJK_LATIN, '$1 $2');
  text = text.replace(RE_LATIN_CJK, '$1 $2');
  return text;
}

function processFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');

  // Split frontmatter and body
  const fmMatch = content.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
  if (!fmMatch) return content;

  const frontmatter = fmMatch[1];
  const body = fmMatch[2];

  const result = processBody(body);
  return frontmatter + result;
}

function processBody(body) {
  const lines = body.split('\n');
  const output = [];
  let inCodeBlock = false;

  for (const line of lines) {
    // Track fenced code blocks
    if (/^```/.test(line.trimStart())) {
      inCodeBlock = !inCodeBlock;
      output.push(line);
      continue;
    }

    if (inCodeBlock) {
      output.push(line);
      continue;
    }

    // Process line, protecting inline code, math, links, and HTML
    output.push(processLine(line));
  }

  return output.join('\n');
}

function processLine(line) {
  // Split line into protected segments and text segments
  // Protected: inline code `...`, math $...$, display math $$...$$,
  //            markdown links [...](...)  markdown images ![...](...), HTML tags <...>
  const segments = [];
  let remaining = line;

  while (remaining.length > 0) {
    // Find the earliest protected pattern
    let earliest = null;
    let earliestIndex = remaining.length;

    const patterns = [
      // Display math $$...$$
      { regex: /\$\$[\s\S]*?\$\$/, type: 'math' },
      // Inline code `...`
      { regex: /`[^`]+`/, type: 'code' },
      // Inline math $...$  (not preceded by \)
      { regex: /(?<!\\)\$(?!\$)(?:[^$\\]|\\.)+?\$/, type: 'math' },
      // Markdown image ![...](...)
      { regex: /!\[[^\]]*\]\([^)]*\)/, type: 'link' },
      // Markdown link [...](...)
      { regex: /\[[^\]]*\]\([^)]*\)/, type: 'link' },
      // HTML tags
      { regex: /<[^>]+>/, type: 'html' },
    ];

    for (const p of patterns) {
      const m = remaining.match(p.regex);
      if (m && m.index < earliestIndex) {
        earliest = m;
        earliestIndex = m.index;
      }
    }

    if (earliest === null) {
      // No more protected segments, process remaining text
      segments.push({ type: 'text', content: remaining });
      break;
    }

    // Add text before the protected segment
    if (earliestIndex > 0) {
      segments.push({ type: 'text', content: remaining.slice(0, earliestIndex) });
    }

    // Add the protected segment as-is
    segments.push({ type: 'protected', content: earliest[0] });

    remaining = remaining.slice(earliestIndex + earliest[0].length);
  }

  // Apply spacing only to text segments
  return segments.map(s => {
    if (s.type === 'text') {
      return addSpacing(s.content);
    }
    return s.content;
  }).join('');
}

// Process all posts
const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
let totalChanges = 0;

for (const file of files) {
  const filepath = path.join(POSTS_DIR, file);
  const original = fs.readFileSync(filepath, 'utf-8');
  const processed = processFile(filepath);

  if (original !== processed) {
    fs.writeFileSync(filepath, processed);
    // Count changed lines
    const origLines = original.split('\n');
    const procLines = processed.split('\n');
    let changes = 0;
    for (let i = 0; i < origLines.length; i++) {
      if (origLines[i] !== procLines[i]) changes++;
    }
    console.log(`  ${file}: ${changes} lines changed`);
    totalChanges += changes;
  }
}

// Process about.md (no frontmatter with ---)
const aboutContent = fs.readFileSync(ABOUT_FILE, 'utf-8');
const aboutProcessed = processBody(aboutContent);
if (aboutContent !== aboutProcessed) {
  fs.writeFileSync(ABOUT_FILE, aboutProcessed);
  console.log('  about.md: updated');
}

console.log(`\nDone. ${totalChanges} total lines changed across ${files.length} posts.`);
