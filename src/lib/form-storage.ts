export function createFormStorage(key: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function saveFormData(data: Record<string, any>) {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving form data for ${key}:`, error);
    }
  }

  function loadFormData() {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading form data for ${key}:`, error);
      return null;
    }
  }

  function clearFormData() {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing form data for ${key}:`, error);
    }
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveData: (data: Record<string, any>) => saveFormData(data),
    loadSavedData: () => loadFormData(),
    clearData: () => clearFormData(),
  };
}
