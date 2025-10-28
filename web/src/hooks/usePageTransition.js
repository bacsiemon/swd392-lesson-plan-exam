import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTransition = (minLoadingTime = 800) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loader on route change
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [location.pathname, minLoadingTime]);

  return isLoading;
};

export default usePageTransition;
