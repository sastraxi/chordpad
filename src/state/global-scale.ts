import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type GlobalScaleState = {
  quarterWidth: number
  measuresPerLine: number
  lineHeight: number
}

const DEFAULT_STATE: GlobalScaleState = {
  quarterWidth: 60,
  measuresPerLine: 4,
  lineHeight: 100,
}

//////////////////////////////////////////////////////////

type GlobalScaleStateAndMutators = GlobalScaleState & {
  reset: () => void
}

export const useGlobalScale = create<GlobalScaleStateAndMutators>()(
  (set) => ({
    ...DEFAULT_STATE,
    reset: () => set(() => DEFAULT_STATE),
  }),
)
