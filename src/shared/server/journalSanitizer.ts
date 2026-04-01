const ALLOWED_TAGS = new Set([
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'u',
  'ul',
  'hr',
]);

const DANGEROUS_BLOCK_TAGS = [
  'button',
  'canvas',
  'embed',
  'form',
  'iframe',
  'input',
  'link',
  'math',
  'meta',
  'object',
  'script',
  'select',
  'style',
  'svg',
  'textarea',
];

const DANGEROUS_SINGLE_TAGS = [
  'audio',
  'img',
  'source',
  'track',
  'video',
];

function stripDangerousBlocks(html: string) {
  return DANGEROUS_BLOCK_TAGS.reduce((result, tag) => {
    const pattern = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    return result.replace(pattern, '');
  }, html);
}

function stripDangerousSingles(html: string) {
  return DANGEROUS_SINGLE_TAGS.reduce((result, tag) => {
    const pattern = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    return result.replace(pattern, '');
  }, html);
}

export function sanitizeJournalHtml(value: string | null | undefined) {
  if (!value) return '';

  const withoutComments = value.replace(/<!--[\s\S]*?-->/g, '');
  const withoutBlocks = stripDangerousBlocks(withoutComments);
  const withoutSingles = stripDangerousSingles(withoutBlocks);

  return withoutSingles.replace(/<\/?([a-z0-9-]+)(?:\s[^>]*)?>/gi, (fullMatch, rawTag) => {
    const tag = String(rawTag).toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      return '';
    }

    return fullMatch.startsWith('</') ? `</${tag}>` : `<${tag}>`;
  });
}
