import { serializeEditorContent } from "../utils";

const useStorage = () => {

  const getLastSavedContent = () => {
    return localStorage.getItem('editorJSON');
  }

  const saveContent = (node) => {
    if (node) {
      const content = serializeEditorContent(node);
      localStorage.setItem('editorJSON', JSON.stringify(content));
      alert('content saved in JSON format');
    }
  };
  
  return { getLastSavedContent, saveContent };
}

export default useStorage
