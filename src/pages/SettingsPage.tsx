import { useRef, useState } from "react";
import { DEFAULT_SLOTS } from "../domain/types";
import { downloadJson } from "../domain/exportImport";
import { useAppData, usePlannerStore } from "../state/storeContext";

export function SettingsPage() {
  const store = usePlannerStore();
  const data = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="page">
      <p className="eyebrow">Device</p>
      <h1>Settings</h1>
      <div className="panel form-grid" style={{ marginTop: "1rem" }}>
        <label>
          <span>Week starts on</span>
          <select
            value={data.settings.weekStartsOn}
            onChange={(event) =>
              store.updateSettings({
                weekStartsOn: Number(event.target.value) === 0 ? 0 : 1,
              })
            }
          >
            <option value={1}>Monday</option>
            <option value={0}>Sunday</option>
          </select>
        </label>
        <p className="muted">
          Default meal slots are breakfast, lunch, and dinner. Add snacks or extra meals from a
          day’s plan. Reset a day to restore the default three slots.
        </p>
        <button
          className="btn"
          onClick={() => store.updateSettings({ defaultSlots: DEFAULT_SLOTS.map((slot) => ({ ...slot })) })}
        >
          Restore default meal slots
        </button>
      </div>

      <div className="panel form-grid" style={{ marginTop: "1rem" }}>
        <h2>Backup</h2>
        <p className="muted">
          Everything stays on this device. Export a JSON backup before switching phones, then
          import it to restore recipes, plans, and shopping checks.
        </p>
        <div className="actions">
          <button
            className="btn primary"
            onClick={() => {
              const payload = store.exportPayload();
              downloadJson(`meal-planner-backup-${payload.exportedAt.slice(0, 10)}.json`, payload);
              setMessage("Backup downloaded.");
            }}
          >
            Export backup
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) {
              return;
            }
            try {
              store.importJson(await file.text());
              setMessage("Backup restored. This replaced the data on this device.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Could not import that file");
            }
          }}
        />
        {message ? <p>{message}</p> : null}
      </div>
    </div>
  );
}
