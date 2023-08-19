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

const useGlobalScaleInternal = create<GlobalScaleStateAndMutators>()(
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

export const useGlobalScale = () => {
  const { quarterWidth, measuresPerLine, lineHeight } = useGlobalScaleInternal()
  return {
    quarterWidth,
    measuresPerLine,
    lineHeight,
  }
}
