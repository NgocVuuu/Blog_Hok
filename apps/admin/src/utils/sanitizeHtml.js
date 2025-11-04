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
        // keep only color style (safe subset): hex, rgb/rgba, or specific named colors; normalize names to hex
        if (node.hasAttribute('style')) {
          const raw = node.getAttribute('style') || '';
          const hex = raw.match(/color\s*:\s*#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/);
          const rgb = raw.match(/color\s*:\s*(rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|0?\.\d+|1))?\s*\))/i);
          const named = raw.match(/color\s*:\s*(orange|green|purple)\b/i);
          if (hex) {
            let val = hex[1];
            // Special-case shorthand brand mappings
            if (val.length === 3 && val.toLowerCase() === 'ff7') {
              // Use brand orange identical to Physical icons
              node.setAttribute('style', 'color: #ff7a00');
              return;
            }
            if (val.length === 3) {
              // Expand #rgb to #rrggbb
              val = val.split('').map(ch => ch + ch).join('');
            }
            node.setAttribute('style', `color: #${val}`);
          } else if (rgb) {
            node.setAttribute('style', `color: ${rgb[1]}`);
          } else if (named) {
            const map = {
              orange: '#ff7a00',
              green: '#43a047',
              purple: '#7b2ff2'
            };
            const key = named[1].toLowerCase();
            node.setAttribute('style', `color: ${map[key] || '#000'}`);
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
