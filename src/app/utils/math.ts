/**
 * Rounds a float number and fixes the decimals to a specified number of digits.
 * @param n
 * @param decimals by default is 0
 * @returns {Number}
 */
export function roundFloat(n, decimals = 0) {
  const rounded = (Math.round(n * 10) / 10).toFixed(decimals);
  return parseFloat(rounded);
}

/**
 * Computes the average value from a set of values
 * @param {number[]} values - array of numbers
 * @returns {number}
 */
export function average(values) {
  let result = null;
  if (typeof values.reduce === 'function' && values.length) {
    const sum = sumAll(values);
    result = sum / values.length;
  } else {
    // tslint:disable-next-line:no-console
    console.warn('Unable to compute average on param: ', values);
  }
  return roundFloat(result);
}

/**
 * Sums all values
 * @param {number[]} values
 * @returns {number}
 */
export function sumAll(values) {
  return values.reduce((a, b) => a + b);
}
