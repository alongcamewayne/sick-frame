/**
 * Deeply compares two values for equality, similar to lodash's isEqual.
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @param seen - A WeakMap to track circular references.
 * @returns Whether the values are deeply equal.
 */
export function isEqual<T>(a: T, b: T, seen = new WeakMap<object, object>()): boolean {
	// Handle identical references and primitive comparisons
	if (a === b) return true;

	// Handle NaN comparisons
	if (Number.isNaN(a) && Number.isNaN(b)) return true;

	// Check if both values are objects (including arrays)
	if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
		return false;
	}

	// Prevent infinite loops with circular references
	if (seen.has(a) && seen.get(a) === b) return true;
	seen.set(a as object, b as object);

	// Get object keys and compare their lengths
	const keysA = Object.keys(a) as (keyof T)[];
	const keysB = Object.keys(b) as (keyof T)[];
	if (keysA.length !== keysB.length) return false;

	// Check if all keys in A exist in B and their values are deeply equal
	for (const key of keysA) {
		if (!(key in b) || !isEqual(a[key], b[key], seen)) {
			return false;
		}
	}

	return true;
}
