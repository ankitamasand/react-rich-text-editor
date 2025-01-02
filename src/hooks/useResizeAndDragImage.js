import React, { useState, useEffect } from 'react'
import '../styles.css';
import useDebounce from './useDebounce';

const DIRECTIONS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

const CURSORS = {
  'top-left': 'nw-resize',
  'top-right': 'ne-resize',
  'bottom-left': 'sw-resize',
  'bottom-right': 'se-resize',
};

const useResizeAndDragImage = (selectedImage, setSelectedImage, container) => {
  const [resizeData, setResizeData] = useState(null);
  const [dragData, setDragData] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [isActionsDialogOpen, setIsActionsDialogOpen] = useState(false);
  const [imageEditMode, setImageEditMode] = useState(null);

  useEffect(() => {
    if (!selectedImage) return;
    setIsActionsDialogOpen(prev => !prev);
  }, [selectedImage]);

  const handleMouseMove = (e) => {
    if (resizeData) {
      const {
        initialX,
        initialY,
        initialHeight,
        initialWidth,
        direction,
        shiftKey
      } = resizeData;

      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;

      if (direction?.includes('right')) {
        newWidth += deltaX;
      }

      if (direction.includes('bottom')) {
        newHeight += deltaY;
      }

      if (direction.includes('left')) {
        newWidth -= deltaX;
      }

      if (direction.includes('top')) {
        newHeight -= deltaY;
      }

      if (shiftKey) {
        const aspectRatio = initialWidth / initialHeight;
        if (newWidth / newHeight > aspectRatio) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      selectedImage.style.width = `${newWidth}px`;
      selectedImage.style.height = `${newHeight}px`;

    }

    if (dragData) {
      const {
        initialX,
        initialY,
        initialLeft,
        initialTop
      } = dragData;
      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;

      selectedImage.style.position = "absolute";
      selectedImage.style.left = `${initialLeft + deltaX}px`;
      selectedImage.style.top = `${initialTop + deltaY}px`;
    }

    if (cropData) {
      const {
        initialX,
        initialY,
        cropBox
      } = cropData;
      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;
      const newCropBox = {
        left: cropBox.left,
        top: cropBox.top,
        width: Math.max(10, cropBox.width + deltaX),
        height: Math.max(10, cropBox.height + deltaY)
      };
      
      setCropData((prev) => ({
        ...prev,
        cropBox: newCropBox,
      }));
    }
  };

  const { debounce: debouncedMouseMove } = useDebounce(handleMouseMove, 10);

  const applyCrop = (e) => {
    if (cropData && selectedImage) {
      const { cropBox } = cropData;
  
      // Apply the final crop using clip-path
      selectedImage.style.clipPath = `inset(${cropBox.top}px ${
        selectedImage.offsetWidth - cropBox.width
      }px ${selectedImage.offsetHeight - cropBox.height}px ${cropBox.left}px)`;
      setImageEditMode(null);
    }
  }

  const handleMouseUp = (e) => {
    if (e.target.nodeName === 'BUTTON' || imageEditMode === 'CROP') return;
    setResizeData(null);
    setSelectedImage(null);
    setImageEditMode(null);
    setDragData(null);
    setCropData(null);
  }

  useEffect(() => {
    document.addEventListener('mousemove', debouncedMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', debouncedMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }


  }, [selectedImage, dragData, resizeData, cropData]);

  const startResizing = (e, direction) => {
    console.log('resize event', direction);
    if (selectedImage) {
      e.preventDefault();
      setResizeData({
        initialX: e.clientX,
        initialY: e.clientY,
        initialWidth: selectedImage.offsetWidth,
        initialHeight: selectedImage.offsetHeight,
        direction,
        shiftKey: e.shiftKey, // capturing shift key for maintaining aspect ratio of the image
      })
    }
  }

  const startDragging = (e) => {
    if (selectedImage) {
      e.preventDefault();
      setDragData({
        initialX: e.clientX,
        initialY: e.clientY,
        initialLeft: selectedImage.offsetLeft,
        initialTop: selectedImage.offsetTop,
      })
    }
  }

  const startCropping = (e) => {
    if (selectedImage) {
      e.preventDefault();
      const containerRect = container.getBoundingClientRect();
      const selectedImageRect = selectedImage.getBoundingClientRect();
      setCropData({
        initaiX: e.clientX,
        initialY: e.clientY,
        cropBox: {
          left: selectedImageRect.left - containerRect.left,
          top: selectedImageRect.top - containerRect.top,
          width: selectedImageRect.width,
          height: selectedImageRect.height,
        }
      });
    }
  };

  const { debounce: debouncedCrop } = useDebounce(startCropping, 10);

  const handleImageAction = (action) => {
    setIsActionsDialogOpen(false);
    selectedImage.classList.remove('selected');
    setImageEditMode(action);
  }

  return (
    <>
      {isActionsDialogOpen && selectedImage && (
         <div 
          className='image-actions-dialog'
          style={{
            top: selectedImage.offsetTop + 20,
            left: selectedImage.offsetWidth / 2,
            
          }}
        >
          <button onClick={() => handleImageAction('RESIZE_DRAG')}>Drag</button>
          <button onClick={() => handleImageAction('RESIZE_DRAG')}>Resize</button>
          <button onClick={() => handleImageAction('CROP')}>Crop</button>
        </div>
      )}
      {imageEditMode === 'RESIZE_DRAG' && selectedImage && (
        <div
          className='resize-box'
          style={{
            position: 'absolute',
            top: selectedImage.offsetTop - 4,
            left: selectedImage.offsetLeft - 4,
            width: selectedImage.width + 8,
            height: selectedImage.height + 8,
            border: '2px dashed #007bff',

          }}
        >
        {DIRECTIONS.map((direction) => {
          return (
            <div
              key={direction}
              onMouseDown={(e) => startResizing(e, direction)}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                backgroundColor: '#007bff',
                cursor: `${CURSORS[direction]}`,
                [direction.split('-')[0]]: '-5px',
                [direction.split('-')[1]]: '-5px'
              }}
            />

          )
        })}

        <div
          onMouseDown={(e) => startDragging(e)}
          style={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            cursor: 'grab',
            bottom: '-10px',
            right: '-10px',
            borderRadius: '50%'
          }}
        />
      </div>
      )}
      {imageEditMode === 'CROP' && selectedImage && (
        <div
          onMouseDown={debouncedCrop}
          style={{
            position: 'absolute',
            top: cropData?.cropBox?.top || selectedImage.offsetTop - 4,
            left: cropData?.cropBox?.left || selectedImage.offsetLeft - 4,
            width: cropData?.cropBox?.width || selectedImage.offsetWidth + 8,
            height: cropData?.cropBox?.height || selectedImage.offsetHeight + 8,
            border: '2px solid #FF0000',
            cursor: 'crosshair',
          }}
        >
          <button onClick={applyCrop}>Apply</button>
        </div>
      )}
    </>
  );
}

export default useResizeAndDragImage
