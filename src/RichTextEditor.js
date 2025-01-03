import React, { useEffect, useRef, useState } from 'react'
import "./styles.css";
import Menu from './components/Menu/Menu';
import { calculateCursorPosition, deserializeEditorContent } from './utils';
import useResizeAndDragImage from './hooks/useResizeAndDragImage';
import useTextHighlight from './hooks/useTextHighlight';
import useStorage from './hooks/useStorage';
import useInsert from './hooks/useInsert';
import { hydrateEditorContent } from './services/editorService';

const RichTextEditor = () => {
  const editorRef = useRef(null);
  const [urlInputVisible, setUrlInputVisible] = useState(false);
  const [imgInputVisible, setImgInputVisible] = useState(false);
  const [url, setUrl] = useState('');
  const [imgInput, setImgInput] = useState('');
  const savedSelection = useRef(null); // because this needs to be preserved across renders
  const fileInputRef = useRef();
  const urlInputRef = useRef();
  const [selectedImage, setSelectedImage] = useState(null);
  const ImageHandles = useResizeAndDragImage(selectedImage, setSelectedImage, editorRef.current);
  const { highlightText, removeTextHighlights } = useTextHighlight();
  const { getLastSavedContent, saveContent } = useStorage();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const insertElement = useInsert(editorRef.current);

  const handleImageClick = (e) => {
    e.target.classList.add('selected');
    setSelectedImage(e.target);
  }

  const loadContentFromStorage = () => {
    const lastSavedContent = getLastSavedContent();
    if (lastSavedContent && editorRef.current) {
      editorRef.current.innerHTML = '';
      const contentJSON = JSON.parse(lastSavedContent);
      if (contentJSON.children) {
        contentJSON.children.forEach((child) => {
          deserializeEditorContent(child, editorRef.current);
        });
      }
      hydrateEditorContent(editorRef.current, {
        clickHandlers: {
          imageOnClick: handleImageClick,
        }
      });
    }
  }

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    loadContentFromStorage();
  }, []);

  useEffect(() => {
    if (urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [urlInputVisible])

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (savedSelection.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelection.current);
    }
  };


  const applyFormatting = (tag) => {
    restoreSelection();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // check if the selected content is already wrapped with the desired tag
      const parentNode = range.commonAncestorContainer.parentNode;
      if (parentNode.nodeName === tag.toUpperCase()) {
        // if already formatted, upwrap it
        const textNode = document.createTextNode(parentNode.textContent);
        parentNode.parentNode.replaceChild(textNode, parentNode);
      } else {
        const formatNode = document.createElement(tag);
        const selectedContent = range.extractContents();
        formatNode.appendChild(selectedContent);
        range.insertNode(formatNode);
      }
    }
    selection.collapseToEnd();
  };

  const showBlockElementsMenu = () => {
    setIsMenuVisible(true);
    const { left, top } = calculateCursorPosition();
    setMenuPosition({ left, top });
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // e.preventDefault();
      // setIsMenuVisible(true);
      // const { left, top } = calculateCursorPosition();
      // setMenuPosition({ left, top });
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        applyFormatting('strong');
      } else if (e.key === 'i') {
        e.preventDefault();
        applyFormatting('em');
      } else if (e.key === 'u') {
        e.preventDefault();
        applyFormatting('u');
      } 
    }
  };

  const applyHyperLink = () => {
    if (!url) return;

    restoreSelection();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.extractContents();

      // create an <a> element
      const anchorNode = document.createElement('a');
      anchorNode.href = url;
      anchorNode.target = '_blank';
      anchorNode.rel = 'noopener noreferrer';
      anchorNode.appendChild(selectedText);
      
      range.insertNode(anchorNode);
      const newRange = document.createRange();
      newRange.setStartAfter(anchorNode);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    setUrl('');
    setUrlInputVisible(false);
  };

  const insertImage = () => {
    if (imgInput) {
      restoreSelection();
      const imageNode = document.createElement('img');
      imageNode.src = imgInput;
      imageNode.style.maxWidth = '100%';
      imageNode.style.height = 'auto';
      imageNode.style.cursor = 'pointer';
      imageNode.onClick = handleImageClick;

      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(imageNode);
        selection.removeAllRanges();
      }
      setImgInput('');
      setImgInputVisible(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageNode = document.createElement('img')
        imageNode.src = event.target.result;
        imageNode.alt = file.name;
        imageNode.style.width = '100%';
        imageNode.style.height = 'auto';
        imageNode.onclick = handleImageClick;

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.insertNode(imageNode);
          selection.removeAllRanges();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearEditor = () => {
    editorRef.current.innerHTML = '';
  };

  return (
    <div className='wrapper'>
      <div className='toolbar'>
        <button onClick={() => applyFormatting('strong')}><strong>B</strong></button>
        <button onClick={() => applyFormatting('em')}><em>I</em></button>
        <button onClick={() => applyFormatting('u')}><u>U</u></button>
        <button 
          onClick={() => {
            setUrlInputVisible(!urlInputVisible)
          }}
          onMouseDown={saveSelection}
        >
          Link
        </button>
        {/* <button 
          onClick={() => setImgInputVisible(!imgInputVisible)}
          onMouseDown={saveSelection}
        >
          Insert Image URL
        </button> */}
        <button onClick={triggerFileInput}>
          Upload Image
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept='image/*'
            onChange={handleFileChange}
          />
        </button>
        <button onClick={showBlockElementsMenu}>Menu</button>
        <div className='actions'>
          <button onClick={() => saveContent(editorRef.current)}>Save</button>
          <button onClick={loadContentFromStorage}>Load Content</button>
          <button onClick={clearEditor}>Clear All</button>
        </div>
      </div>

      {urlInputVisible && (
        <form className='url-input'>
          <input
            ref={urlInputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='Enter URL'
            tabIndex={0}
          />
          <button onClick={applyHyperLink} type="submit">Apply Link</button>
        </form>
      )}

      {imgInputVisible && (
        <div className='img-input'>
          <input
            type="text"
            value={imgInput}
            onChange={(e) => setImgInput(e.target.value)}
            placeholder='Enter Url'
          />
          <button onClick={insertImage}>Insert Image</button>
        </div>
      )}
      <div className='editor-content'>
        <div
          tabIndex="0"
          contentEditable
          ref={editorRef}
          id='editor'
          onKeyDown={handleKeyDown}
          onMouseUp={() => highlightText(editorRef.current)}
          onBlur={() => removeTextHighlights(editorRef.current)}
        />
        {ImageHandles}
        {isMenuVisible && (
          <Menu 
            onInsert={insertElement}
            onClose={() => setIsMenuVisible(false)}
            position={menuPosition}
          />
        )}
      </div>
      
      
    </div>
  )
}

export default RichTextEditor
