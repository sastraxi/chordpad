import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type GlobalScaleState = {
  beatWidth: number
  measuresPerLine: number
  lineHeight: number
}

const DEFAULT_STATE: GlobalScaleState = {
  beatWidth: 60,
  measuresPerLine: 4,
  lineHeight: 100,
}

//////////////////////////////////////////////////////////

type GlobalScaleStateAndMutators = GlobalScaleState & {
  reset: () => void
}

export const useGlobalScale = create<GlobalScaleStateAndMutators>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      reset: () => set(() => DEFAULT_STATE),
    }),
    {
      name: 'chordpad-global-scale',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
