import React from 'react'

const useTextHighlight = () => {
  // console.log('container node', containerNode);
  const removeTextHighlights = (containerNode) => {
    if (!containerNode) return;
    const existingHighlights = containerNode.querySelectorAll('.highlight');
    existingHighlights.forEach((highlight) => highlight.remove());
  }

  const highlightText = (containerNode) => {
    const selection = window.getSelection();
    if (!containerNode || !selection) return;
    if (selection.rangeCount > 0 && containerNode.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const rects = Array.from(range.getClientRects());
        const editorRects = containerNode.getBoundingClientRect();

        // clear existing highlights
        removeTextHighlights()

        rects.forEach((rect) => {
          const hightlightNode = document.createElement('div');
          hightlightNode.className = 'highlight';
          hightlightNode.style.position = 'absolute';
          hightlightNode.style.left = `${rect.left - editorRects.left}px`;
          hightlightNode.style.top = `${rect.top - editorRects.top}px`;
          hightlightNode.style.width = `${rect.width}px`;
          hightlightNode.style.height = `${rect.height}px`;
          hightlightNode.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';

          // Ensure that the highlight is beneath the selected text
          hightlightNode.style.zIndex = '-1';

          containerNode.appendChild(hightlightNode);
        });
      }
    }
  };


  return { highlightText, removeTextHighlights }
}

export default useTextHighlight
