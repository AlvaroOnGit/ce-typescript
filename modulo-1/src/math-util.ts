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

/**
 * Calculates the **median** of an array of numbers.
 * - Odd length  → middle element of the sorted array.
 * - Even length → average of the two middle elements.
 *
 * @param numbers - Array of finite numbers.
 * @returns The median as a `number`, or `null` if the array is invalid/empty.
 *
 * @example
 * calcularMediana([3, 1, 4, 1, 5])  // → 3
 * calcularMediana([1, 2, 3, 4])     // → 2.5
 * calcularMediana([])                // → null
 */
export function calcularMediana(numbers: number[]): number | null {
    const { valid } = validateArray(numbers);
    if (!valid) return null;

    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 !== 0) {
        return sorted[mid] ?? null;
    }

    return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Removes **outliers** from an array using the **standard deviation** method.
 *
 * A value is considered an outlier if its distance from the mean exceeds
 * `threshold` standard deviations. The default `threshold = 2` corresponds
 * roughly to the 95% interval of a normal distribution.
 *
 * @param numbers   - Array of finite numbers.
 * @param threshold - Number of allowed standard deviations (> 0). Default: 2.
 * @returns A new array with outliers removed.
 *          Returns an empty array if the input is invalid or empty.
 *
 * @throws {RangeError} If `threshold` is ≤ 0.
 *
 * @example
 * filtrarAtipicos([2, 3, 4, 100], 2)   // → [2, 3, 4]  (100 is an outlier)
 * filtrarAtipicos([1, 2, 3], 2)         // → [1, 2, 3]  (no outliers)
 * filtrarAtipicos([], 2)                // → []
 */
export function filtrarAtipicos(numbers: number[], threshold: number): number[] {
    if (threshold <= 0) throw new RangeError(`Threshold must be a positive integer. Received: ${threshold}`);

    const { valid } = validateArray(numbers);
    if (!valid) return [];

    const mean = calcularMedia(numbers) as number;

    const variance =
        numbers.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) /
        numbers.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return [...numbers];

    return numbers.filter((n) => Math.abs(n - mean) <= threshold * stdDev);
}