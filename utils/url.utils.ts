export function createQueryParams(params: Record<string, any>): string {
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid parameters provided for query string creation');
  }
    const searchParams = new URLSearchParams();
  
    // Loop through each key-value pair and append to URLSearchParams
    Object.keys(params).forEach(key => {
      const value = params[key];
      // Handle array and object values by converting them to JSON string
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else if (typeof value === 'object' && value !== null) {
        searchParams.append(key, JSON.stringify(value)); // Convert objects to JSON string
      } else {
        searchParams.append(key, value as string);
      }
    });
  
    // Return the query string
    return searchParams.toString();
  }
  