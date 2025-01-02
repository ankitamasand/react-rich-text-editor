import { useRef } from 'react'

const useDebounce = (callback, delay) => {
  let timerId = useRef();

  const cancel = () => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
  }

  const debounce = (...args) => {
   cancel();
    timerId.current = setTimeout(() => {
      callback(...args)
    }, delay);
  }; 

  return { debounce, cancel };
}

export default useDebounce
