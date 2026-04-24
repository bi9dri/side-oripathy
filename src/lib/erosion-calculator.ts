export const MAX_TERMS = 60;

export function computePerDieProbabilities(danger: number, tolerance: number) {
	let successOnly = 0;
	let rerollOnly = 0;
	let both = 0;

	for (let v = 1; v <= 10; v++) {
		const isSuccess = v <= danger;
		const isReroll = v >= tolerance;
		if (isSuccess && isReroll) {
			both++;
		} else if (isSuccess) {
			successOnly++;
		} else if (isReroll) {
			rerollOnly++;
		}
	}

	return {
		p_s: successOnly / 10,
		p_r: rerollOnly / 10,
		p_sr: both / 10,
		p_n: (10 - successOnly - rerollOnly - both) / 10,
	};
}

export function singleDieDist(danger: number, tolerance: number): number[] {
	const { p_s, p_r, p_sr, p_n } = computePerDieProbabilities(danger, tolerance);
	const dist = Array.from<number>({ length: MAX_TERMS }).fill(0);
	const denom = 1 - p_r;

	dist[0] = p_n / denom;

	if (p_sr === 0) {
		if (MAX_TERMS > 1) {
			dist[1] = p_s / denom;
		}
	} else {
		const alpha = p_sr / denom;
		const coeff = (p_n * alpha + p_s) / denom;
		let alphaPow = 1;
		for (let m = 1; m < MAX_TERMS; m++) {
			dist[m] = alphaPow * coeff;
			alphaPow *= alpha;
			if (alphaPow < 1e-12) {
				break;
			}
		}
	}

	return dist;
}

export function polyMultiply(a: number[], b: number[]): number[] {
	const len = Math.min(a.length + b.length - 1, MAX_TERMS);
	const result = Array.from<number>({ length: len }).fill(0);
	for (let i = 0; i < a.length; i++) {
		if (a[i] === 0) {
			continue;
		}
		for (let j = 0; j < b.length && i + j < MAX_TERMS; j++) {
			result[i + j] += a[i] * b[j];
		}
	}
	return result;
}

export function polyPow(a: number[], n: number): number[] {
	if (n === 0) {
		return [1];
	}
	if (n === 1) {
		return a;
	}
	const half = polyPow(a, Math.floor(n / 2));
	const squared = polyMultiply(half, half);
	return n % 2 === 0 ? squared : polyMultiply(squared, a);
}

export function calcDistribution(erosionLevel: number, tolerance: number, danger: number) {
	const numDice = Math.floor(erosionLevel / 5) + 1;
	const singleDist = singleDieDist(danger, tolerance);
	const totalDist = polyPow(singleDist, numDice);

	let expectedValue = 0;
	for (let i = 0; i < totalDist.length; i++) {
		expectedValue += i * totalDist[i];
	}

	return { dist: totalDist, numDice, expectedValue };
}
