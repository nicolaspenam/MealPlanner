import { APP_DATA_VERSION, emptyAppData, type AppData, type ExportPayload } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function serializeExport(data: AppData, now = new Date()): ExportPayload {
  return {
    version: APP_DATA_VERSION,
    exportedAt: now.toISOString(),
    data,
  };
}

export function parseImport(raw: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("That file is not valid JSON");
  }

  const payload = isRecord(parsed) ? parsed : null;
  if (!payload) {
    throw new Error("Import file is missing planner data");
  }

  const nested = isRecord(payload.data) ? payload.data : payload;
  const fallback = emptyAppData();
  const imported: AppData = {
    version: typeof nested.version === "number" ? nested.version : APP_DATA_VERSION,
    recipes: requireArray(nested.recipes, fallback.recipes),
    cookBatches: requireArray(nested.cookBatches, fallback.cookBatches),
    mealEntries: requireArray(nested.mealEntries, fallback.mealEntries),
    daySlotOverrides: requireArray(nested.daySlotOverrides, fallback.daySlotOverrides),
    settings: {
      ...fallback.settings,
      ...(isRecord(nested.settings) ? nested.settings : {}),
    },
    shoppingChecks: requireArray(nested.shoppingChecks, fallback.shoppingChecks),
  };

  if (!imported.settings.defaultSlots?.length) {
    imported.settings.defaultSlots = fallback.settings.defaultSlots;
  }
  if (imported.settings.weekStartsOn !== 0 && imported.settings.weekStartsOn !== 1) {
    imported.settings.weekStartsOn = 1;
  }
  if (imported.settings.weekView !== "calendar") {
    imported.settings.weekView = "list";
  }
  return imported;
}

export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
