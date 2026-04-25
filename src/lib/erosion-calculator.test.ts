import { describe, expect, test } from "bun:test";
import {
	MAX_TERMS,
	calcDistribution,
	computePerDieProbabilities,
	polyMultiply,
	polyPow,
	singleDieDist,
} from "./erosion-calculator";

describe("computePerDieProbabilities", () => {
	test("danger=5, tolerance=8 — no overlap between success and reroll", () => {
		const r = computePerDieProbabilities(5, 8);
		expect(r.p_s).toBeCloseTo(0.5);
		expect(r.p_r).toBeCloseTo(0.3);
		expect(r.p_sr).toBeCloseTo(0);
		expect(r.p_n).toBeCloseTo(0.2);
	});

	test("danger=3, tolerance=6 — no overlap", () => {
		const r = computePerDieProbabilities(3, 6);
		expect(r.p_s).toBeCloseTo(0.3);
		expect(r.p_r).toBeCloseTo(0.5);
		expect(r.p_sr).toBeCloseTo(0);
		expect(r.p_n).toBeCloseTo(0.2);
	});

	test("probabilities sum to 1", () => {
		const r = computePerDieProbabilities(5, 4);
		expect(r.p_s + r.p_r + r.p_sr + r.p_n).toBeCloseTo(1);
	});

	test("danger=10, tolerance=1 — all values are both success and reroll", () => {
		const r = computePerDieProbabilities(10, 1);
		expect(r.p_sr).toBeCloseTo(1);
		expect(r.p_s).toBeCloseTo(0);
		expect(r.p_r).toBeCloseTo(0);
		expect(r.p_n).toBeCloseTo(0);
	});

	test("danger=0 — no success possible", () => {
		const r = computePerDieProbabilities(0, 8);
		expect(r.p_s).toBeCloseTo(0);
		expect(r.p_sr).toBeCloseTo(0);
	});
});

describe("polyMultiply", () => {
	test("[1] * [1] = [1]", () => {
		expect(polyMultiply([1], [1])).toEqual([1]);
	});

	test("[1,1] * [1,1] = [1,2,1]", () => {
		const result = polyMultiply([1, 1], [1, 1]);
		expect(result[0]).toBeCloseTo(1);
		expect(result[1]).toBeCloseTo(2);
		expect(result[2]).toBeCloseTo(1);
	});

	test("result length is min(a.length + b.length - 1, MAX_TERMS)", () => {
		const a = Array(30).fill(0.1);
		const b = Array(40).fill(0.1);
		const result = polyMultiply(a, b);
		expect(result.length).toBe(Math.min(30 + 40 - 1, MAX_TERMS));
	});
});

describe("polyPow", () => {
	test("any polynomial^0 = [1]", () => {
		expect(polyPow([0.5, 0.5], 0)).toEqual([1]);
	});

	test("p^1 = p", () => {
		const p = [0.3, 0.7];
		expect(polyPow(p, 1)).toEqual(p);
	});

	test("p^2 matches polyMultiply(p, p)", () => {
		const p = [0.3, 0.7];
		const squared = polyMultiply(p, p);
		const viaPow = polyPow(p, 2);
		for (let i = 0; i < squared.length; i++) {
			expect(viaPow[i]).toBeCloseTo(squared[i]);
		}
	});

	test("sum of valid distribution raised to n is still ~1", () => {
		const p = [0.3, 0.5, 0.2];
		const result = polyPow(p, 3);
		const sum = result.reduce((a, b) => a + b, 0);
		expect(sum).toBeCloseTo(1);
	});
});

describe("singleDieDist", () => {
	test("returns array of length MAX_TERMS", () => {
		expect(singleDieDist(3, 8).length).toBe(MAX_TERMS);
	});

	test("probabilities sum to approximately 1", () => {
		const dist = singleDieDist(3, 8);
		const sum = dist.reduce((a, b) => a + b, 0);
		expect(sum).toBeCloseTo(1, 3);
	});

	test("P(0) is in [0, 1)", () => {
		const dist = singleDieDist(5, 8);
		expect(dist[0]).toBeGreaterThanOrEqual(0);
		expect(dist[0]).toBeLessThan(1);
	});

	test("sum stays ~1 when tolerance is out of range (no reroll possible)", () => {
		const dist = singleDieDist(10, 11);
		const sum = dist.reduce((a, b) => a + b, 0);
		expect(sum).toBeCloseTo(1, 3);
	});

	test("p_sr > 0 branch: dist sum ≈ 1 and dist[0] = 0 (danger=7, tolerance=5)", () => {
		const dist = singleDieDist(7, 5);
		const sum = dist.reduce((a, b) => a + b, 0);
		expect(sum).toBeCloseTo(1, 3);
		expect(dist[0]).toBeCloseTo(0, 10);
		expect(dist[1]).toBeCloseTo(4 / 7, 5);
	});
});

describe("calcDistribution", () => {
	test("numDice = floor(erosionLevel/5) + 1", () => {
		expect(calcDistribution(0, 6, 3).numDice).toBe(1);
		expect(calcDistribution(5, 6, 3).numDice).toBe(2);
		expect(calcDistribution(24, 6, 3).numDice).toBe(5);
		expect(calcDistribution(25, 6, 3).numDice).toBe(6);
	});

	test("dist sums to approximately 1", () => {
		const { dist } = calcDistribution(0, 6, 3);
		const sum = dist.reduce((a, b) => a + b, 0);
		expect(sum).toBeCloseTo(1, 3);
	});

	test("expectedValue is positive when danger > 0", () => {
		const { expectedValue } = calcDistribution(0, 6, 3);
		expect(expectedValue).toBeGreaterThan(0);
	});

	test("expectedValue increases as danger increases", () => {
		const low = calcDistribution(10, 6, 2).expectedValue;
		const high = calcDistribution(10, 6, 8).expectedValue;
		expect(high).toBeGreaterThan(low);
	});

	test("expectedValue increases as erosionLevel increases", () => {
		const few = calcDistribution(0, 6, 3).expectedValue;
		const many = calcDistribution(50, 6, 3).expectedValue;
		expect(many).toBeGreaterThan(few);
	});

	test("expectedValue matches manual sum(i * dist[i])", () => {
		const { dist, expectedValue } = calcDistribution(5, 6, 4);
		let manual = 0;
		for (let i = 0; i < dist.length; i++) manual += i * dist[i];
		expect(expectedValue).toBeCloseTo(manual, 8);
	});

	test("expectedValue is 0 when danger=0 (no successes possible)", () => {
		expect(calcDistribution(0, 8, 0).expectedValue).toBe(0);
	});
});
