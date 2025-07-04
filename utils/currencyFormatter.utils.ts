import { t } from "i18next";

export function currencyFormatter(
  amount: string | number,
  decimalPlaces: number = 0, // Number of decimal places to show
  currencyCode: string = t("SAR") // Default currency
): string {
  const value = typeof amount === "number" ? amount : parseFloat(amount);

  // Format the number without currency first
  const formattedValue = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);

  // Append the currency code manually at the end
  return `${formattedValue} ${currencyCode}`;
}
