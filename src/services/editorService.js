export const hydrateEditorContent = (node, options) => {
  if (!node) return;
  if (node.tagName === 'IMG') {
    node.onclick = options.clickHandlers.imageOnClick;
  }
  Array.from(node.childNodes).forEach((child) => hydrateEditorContent(child, options));
}