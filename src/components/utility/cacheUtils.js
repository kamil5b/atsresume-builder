const CACHE_KEY = 'atsresume_data';

export const saveToCache = (resumeData) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(resumeData));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to save to cache:', error);
    return false;
  }
};

export const loadFromCache = () => {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  } catch (error) {
    console.error('Failed to load from cache:', error);
    return null;
  }
};

export const clearCache = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
};
