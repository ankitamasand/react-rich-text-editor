const useInsert = () => {

  const insertElement = (type) => {
    let newElement;
    switch(type) {
      case 'h1':
        newElement = document.createElement('h1');
        newElement.innerText = 'New H1 Element';
        break;
      case 'h2':
        newElement = document.createElement('h2');
        newElement.innerText = 'New H2 Element';
        break;
      case 'h3':
        newElement = document.createElement('h3');
        newElement.innerText = 'New H3 Element';
        break;
      case 'ol':
        newElement = document.createElement('ol');
        const orderedListItem = document.createElement('li');
        orderedListItem.innerText = 'New Ordered List Item';
        newElement.appendChild(orderedListItem);
        break;
      case 'ul':
        newElement = document.createElement('ul');
        const unOrderedListItem = document.createElement('ul');
        unOrderedListItem.innerText = 'New Unordered List Item';
        newElement.appendChild(unOrderedListItem);
        break;
      default:
        return;
    }

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(newElement)

      const rangeWithNewElement = document.createRange();
      rangeWithNewElement.setStart(newElement, newElement.childNodes.length > 0 ? newElement.childNodes.length : 0); // sets the starting point of the range to the end of the new element's content
      rangeWithNewElement.collapse(true); //collapse to the end of the element

      selection.removeAllRanges();
      selection.addRange(rangeWithNewElement);
    }
  }

  return insertElement;
}

export default useInsert
