// Utility function to calculate the percentage of a number
// Utility function to calculate the percentage of a number, accepting string or number input
export const percentageOf = (part: string | number, total: string | number, precision = 2): string => {
    const partNum = typeof part === "string" ? parseFloat(part) : part;
    const totalNum = typeof total === "string" ? parseFloat(total) : total;
  
    if (totalNum === 0) return "0%";
    const percentage = (partNum / totalNum) * 100;
    return `${percentage.toFixed(precision)}%`;
  };

export const offerPercentageOf = (part: string | number, total: string | number, precision = 2): string => {
    const partNum = typeof part === "string" ? parseFloat(part) : part;
    const totalNum = typeof total === "string" ? parseFloat(total) : total;
  
    if (totalNum === 0) return "0%";
    const percentage = 100 - (partNum / totalNum) * 100;
    return `${percentage.toFixed(precision)}%`;
  };
  
  // Utility function to format a number with a specific number of decimal places, accepting string or number input
  export const formatNumber = (num: string | number, decimalPlaces = 2): string => {
    const number = typeof num === "string" ? parseFloat(num) : num;
    return number.toFixed(decimalPlaces);
  };
  
  // Utility function to round a number to the nearest multiple, accepting string or number input
  export const roundToNearest = (num: string | number, nearest: number): number => {
    const number = typeof num === "string" ? parseFloat(num) : num;
    return Math.round(number / nearest) * nearest;
  };
  
  // Utility function to format a number as ordinal (e.g., 1st, 2nd, 3rd), accepting string or number input
  export const formatOrdinal = (num: string | number): string => {
    const number = typeof num === "string" ? parseInt(num, 10) : num;
    const suffixes = ["th", "st", "nd", "rd"];
    const v = number % 100;
    return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };
  