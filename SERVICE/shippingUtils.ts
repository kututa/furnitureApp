/**
 * Calculate random shipping cost
 * @param subtotal - The subtotal amount before shipping
 * @returns Random shipping cost between 0 and half of subtotal
 */
export const calculateRandomShipping = (subtotal: number): number => {
  if (subtotal <= 0) return 0;
  const maxShipping = subtotal / 2;
  const randomShipping = Math.random() * maxShipping;
  return Math.round(randomShipping); // Round to nearest whole number
};
