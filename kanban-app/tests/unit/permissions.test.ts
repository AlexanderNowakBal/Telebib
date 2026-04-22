import { describe, it, expect } from "vitest";
import {
  canManageBoard,
  canEditCard,
  canManageColumns,
  canManageLabels,
  canManageMembers,
  canDeleteWorkspace,
  canChangeRoles,
} from "@/lib/permissions";
import type { Role } from "@/lib/types/domain";

const ALL_ROLES: Role[] = ["owner", "admin", "member", "viewer"];

describe("canManageColumns", () => {
  it("autorise owner et admin", () => {
    expect(canManageColumns("owner")).toBe(true);
    expect(canManageColumns("admin")).toBe(true);
  });

  it("refuse member et viewer", () => {
    expect(canManageColumns("member")).toBe(false);
    expect(canManageColumns("viewer")).toBe(false);
  });
});

describe("canEditCard", () => {
  it("autorise owner, admin et member", () => {
    expect(canEditCard("owner")).toBe(true);
    expect(canEditCard("admin")).toBe(true);
    expect(canEditCard("member")).toBe(true);
  });

  it("refuse viewer", () => {
    expect(canEditCard("viewer")).toBe(false);
  });
});

describe("canManageBoard", () => {
  it("autorise owner et admin uniquement", () => {
    expect(canManageBoard("owner")).toBe(true);
    expect(canManageBoard("admin")).toBe(true);
    expect(canManageBoard("member")).toBe(false);
    expect(canManageBoard("viewer")).toBe(false);
  });
});

describe("canManageLabels", () => {
  it("autorise owner, admin et member", () => {
    expect(canManageLabels("owner")).toBe(true);
    expect(canManageLabels("admin")).toBe(true);
    expect(canManageLabels("member")).toBe(true);
    expect(canManageLabels("viewer")).toBe(false);
  });
});

describe("canManageMembers", () => {
  it("autorise owner et admin", () => {
    expect(canManageMembers("owner")).toBe(true);
    expect(canManageMembers("admin")).toBe(true);
    expect(canManageMembers("member")).toBe(false);
    expect(canManageMembers("viewer")).toBe(false);
  });
});

describe("canDeleteWorkspace", () => {
  it("seul owner peut supprimer le workspace", () => {
    expect(canDeleteWorkspace("owner")).toBe(true);
    for (const role of ["admin", "member", "viewer"] as Role[]) {
      expect(canDeleteWorkspace(role)).toBe(false);
    }
  });
});

describe("canChangeRoles", () => {
  it("seul owner peut changer les rôles", () => {
    expect(canChangeRoles("owner")).toBe(true);
    for (const role of ["admin", "member", "viewer"] as Role[]) {
      expect(canChangeRoles(role)).toBe(false);
    }
  });
});
