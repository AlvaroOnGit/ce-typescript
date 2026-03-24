/**
 * Verifies that an array is not empty and that all its numbers are finite
 *
 * @param arr An array containing exclusively numbers
 * @returns Returns `true` if the array is valid or `false` and a description if invalid
 */
function validateArray(arr: number[]): { valid: boolean, error?: string } {
    if (arr.length === 0){
        return { valid: false, error: 'array is empty' };
    }

    const hasInvalid = arr.some((n) => !Number.isFinite(n));
    if (hasInvalid) {
        return { valid: false, error: 'array has finite values (NaN, Infinity...)' };
    }

    return { valid: true };
}

/**
 * Calculates the **arithmetic mean** of an array of numbers.
 *
 * @param numbers - Array of finite numbers.
 * @returns The mean as a `number`, or `null` if the array is invalid/empty.
 *
 * @example
 * calcularMedia([2, 4, 6])   // → 4
 * calcularMedia([])           // → null
 */
export function calcularMedia(numbers: number[]): number | null {
    const { valid } = validateArray(numbers);
    if (!valid) return null;

    const sum = numbers.reduce((acc, n) => acc + n, 0);
    return sum / numbers.length;
}