import React from 'react'
import "./styles.css";

const Menu = ({ onInsert, onClose, position }) => {
  return (
    <div className='hover-menu' style={{ left: position.left, top: position.top }}>
      <button
        className='hover-menu-option'
        onClick={() => { onInsert('h1'); onClose(); }}
      >
        Heading 1
      </button>
      <button
        className='hover-menu-option'
        onClick={() => { onInsert('h2'); onClose(); }}
      >
        Heading 2
      </button>
      <button
        className='hover-menu-option'
        onClick={() => { onInsert('h3'); onClose(); }}
      >
        Heading 3
      </button>
      <button
        className='hover-menu-option'
        onClick={() => { onInsert('ol'); onClose(); }}
      >
        Ordered List
      </button>
      <button
        className='hover-menu-option'
        onClick={() => { onInsert('ul'); onClose(); }}
      >
        Unordered List
      </button>
    </div>
  )
}

export default Menu
