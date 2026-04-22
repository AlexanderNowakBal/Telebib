import { describe, it, expect } from "vitest";
import { CreateCardSchema, CreateBoardSchema, MoveCardSchema } from "@/lib/validation/schemas";

describe("CreateCardSchema", () => {
  it("rejette une carte sans titre", () => {
    const result = CreateCardSchema.safeParse({
      boardId: "00000000-0000-0000-0000-000000000001",
      columnId: "00000000-0000-0000-0000-000000000002",
      title: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined();
    }
  });

  it("accepte une carte avec titre uniquement", () => {
    const result = CreateCardSchema.safeParse({
      boardId: "00000000-0000-0000-0000-000000000001",
      columnId: "00000000-0000-0000-0000-000000000002",
      title: "Préparer la démo",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("medium");
      expect(result.data.description).toBe("");
    }
  });

  it("rejette une priorité invalide", () => {
    const result = CreateCardSchema.safeParse({
      boardId: "00000000-0000-0000-0000-000000000001",
      columnId: "00000000-0000-0000-0000-000000000002",
      title: "Test",
      priority: "critical",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateBoardSchema", () => {
  it("valide un board basique", () => {
    const result = CreateBoardSchema.safeParse({
      workspaceId: "00000000-0000-0000-0000-000000000001",
      name: "Mon Board",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.template).toBe("basic");
    }
  });

  it("rejette un nom vide", () => {
    const result = CreateBoardSchema.safeParse({
      workspaceId: "00000000-0000-0000-0000-000000000001",
      name: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("MoveCardSchema", () => {
  it("valide un move correct", () => {
    const result = MoveCardSchema.safeParse({
      toColumnId: "00000000-0000-0000-0000-000000000003",
      toIndex: 2,
      expectedVersion: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejette un index négatif", () => {
    const result = MoveCardSchema.safeParse({
      toColumnId: "00000000-0000-0000-0000-000000000003",
      toIndex: -1,
      expectedVersion: 3,
    });
    expect(result.success).toBe(false);
  });
});
