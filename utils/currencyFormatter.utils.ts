
export function currencyFormatter(
  amount: string | number,
  decimalPlaces: number = 2, // Number of decimal places to show
  countryCode: string = "IN", // Default country code
  currencyCode: string = "INR", // Default currency
): string {
    const value = typeof amount === "number" ? amount : parseFloat(amount);
  
    return new Intl.NumberFormat(`en-${countryCode}`, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value);
  }
