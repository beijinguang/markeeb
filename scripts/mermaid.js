'use strict';

const MERMAID_BLOCK = /(\s*)(`{3,})\s*mermaid\s*\n([\s\S]+?)\s*\2(?=\n|$)/g;

hexo.extend.filter.register('before_post_render', (data) => {
  if (!hexo.config.mermaid?.enable || !data.content) return data;

  data.content = data.content.replace(
    MERMAID_BLOCK,
    (_, spacing, __, diagram) => `${spacing}<pre class="mermaid">${diagram.trim()}</pre>`,
  );

  return data;
}, 9);

hexo.extend.filter.register('after_render:html', (html) => {
  if (!hexo.config.mermaid?.enable || !html.includes('<pre class="mermaid">')) return html;

  const script = hexo.config.mermaid.script;
  const theme = hexo.config.mermaid.theme || 'default';
  const loader = [
    '<script type="module">',
    `  import mermaid from ${JSON.stringify(script)};`,
    `  mermaid.initialize({ startOnLoad: true, theme: ${JSON.stringify(theme)} });`,
    '</script>',
  ].join('\n');

  return html.includes('</body>')
    ? html.replace('</body>', `${loader}\n</body>`)
    : `${html}\n${loader}`;
});
