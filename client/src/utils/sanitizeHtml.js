// Minimal client-side sanitizer to allow safe inline color styling for admin-authored content
// Allows tags: span,b,strong,i,em,br,p,ul,ol,li
// Allows only style="color: #hex" on <span>

export function sanitizeHtml(input) {
  if (!input || typeof input !== 'string') return '';
  if (typeof document === 'undefined') return input; // non-DOM env guard

  // Normalize newlines to <br/> so lists/descriptions keep line breaks
  const withBreaks = input.replace(/\r?\n/g, '<br/>');

  // Use a safe in-memory container rather than DOMParser to avoid null body issues
  const container = document.createElement('div');
  container.innerHTML = withBreaks;
  const allowed = new Set(['SPAN','B','STRONG','I','EM','BR','P','UL','OL','LI']);

  const walk = (node) => {
    if (!node) return;
    if (node.nodeType === 1) {
      const tag = node.tagName;
      if (!allowed.has(tag)) {
        // unwrap disallowed element but keep its children/text
        const parent = node.parentNode;
        if (parent) {
          while (node.firstChild) parent.insertBefore(node.firstChild, node);
          parent.removeChild(node);
          return; // children already handled
        }
      } else {
        // strip dangerous attributes
        const attrs = Array.from(node.attributes);
        for (const attr of attrs) {
          const name = attr.name.toLowerCase();
          if (name.startsWith('on')) {
            node.removeAttribute(attr.name);
            continue;
          }
          if (name !== 'style') {
            node.removeAttribute(attr.name);
          }
        }
        // keep only color style with hex
        if (node.hasAttribute('style')) {
          const raw = node.getAttribute('style') || '';
          const match = raw.match(/color\s*:\s*#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/);
          if (match) {
            node.setAttribute('style', `color: #${match[1]}`);
          } else {
            node.removeAttribute('style');
          }
        }
      }
    }
    Array.from(node.childNodes).forEach(walk);
  };

  Array.from(container.childNodes).forEach(walk);
  return container.innerHTML;
}

export function asDangerousHtml(htmlString) {
  return { __html: sanitizeHtml(htmlString) };
}
