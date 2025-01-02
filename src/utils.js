export const serializeEditorContent = (editor) => {

  const traverse = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return {
        type: 'text',
        content: node.textContent,
      };
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      console.log('node here', node);
      const element = {
        type: node.tagName.toLowerCase(),
        attributes: {},
        children: []
      };
      Array.from(node.attributes).forEach((attribute) => {
        element.attributes[attribute.name] = attribute.value
      });

      element.children = Array.from(node.childNodes).map(traverse);
      return element;
    }
    return null;
  };

  return traverse(editor)
};

export const deserializeEditorContent = (json, parent) => {
  if (json.type === 'text') {
    parent.appendChild(document.createTextNode(json.content));
  } else {
    const element = document.createElement(json.type);
    Object.entries(json.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    if (json.children) {
      json.children.forEach((child) => deserializeEditorContent(child, element))
    }
    parent.appendChild(element);
  }
}