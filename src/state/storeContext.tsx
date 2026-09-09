import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { AppData } from "../domain/types";
import { PlannerStore } from "../storage/store";
import { browserStorage } from "../storage/storage";

const StoreContext = createContext<PlannerStore | null>(null);

export const plannerStore = new PlannerStore(browserStorage);

export function StoreProvider({
  store = plannerStore,
  children,
}: {
  store?: PlannerStore;
  children: ReactNode;
}) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function usePlannerStore(): PlannerStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("usePlannerStore must be used within StoreProvider");
  }
  return store;
}

export function useAppData(): AppData {
  const store = usePlannerStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

export function useResolvedRecipes(includeArchived = false) {
  const store = usePlannerStore();
  const data = useAppData();
  return useMemo(
    () => store.recipes(includeArchived),
    [store, data, includeArchived],
  );
}
