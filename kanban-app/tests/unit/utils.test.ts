import { describe, it, expect } from "vitest";
import { calculatePosition, reorderArray, isOverdue, formatDate } from "@/lib/utils";

describe("calculatePosition", () => {
  it("retourne STEP si la liste est vide", () => {
    expect(calculatePosition([], 0)).toBe(1024);
  });

  it("insère avant le premier élément", () => {
    const items = [{ position: 1024 }];
    expect(calculatePosition(items, 0)).toBe(0);
  });

  it("insère après le dernier élément", () => {
    const items = [{ position: 1024 }, { position: 2048 }];
    expect(calculatePosition(items, 2)).toBe(3072);
  });

  it("insère entre deux éléments", () => {
    const items = [{ position: 1024 }, { position: 2048 }];
    const pos = calculatePosition(items, 1);
    expect(pos).toBeGreaterThan(1024);
    expect(pos).toBeLessThan(2048);
  });
});

describe("reorderArray", () => {
  it("déplace un élément vers l'avant", () => {
    const result = reorderArray([1, 2, 3, 4], 3, 0);
    expect(result).toEqual([4, 1, 2, 3]);
  });

  it("déplace un élément vers l'arrière", () => {
    const result = reorderArray([1, 2, 3, 4], 0, 3);
    expect(result).toEqual([2, 3, 4, 1]);
  });
});

describe("isOverdue", () => {
  it("retourne false pour null", () => {
    expect(isOverdue(null)).toBe(false);
  });

  it("retourne true pour une date passée", () => {
    expect(isOverdue("2000-01-01")).toBe(true);
  });

  it("retourne false pour une date future", () => {
    expect(isOverdue("2099-01-01")).toBe(false);
  });
});
