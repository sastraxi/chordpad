import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { NoteLength } from '../types'
import { EIGHTH_NOTE, QUARTER_NOTE } from '../util/conversions'

type GlobalScaleState = {
  quarterWidth: number
  measuresPerLine: number
  lineHeight: number
  snapDuration: NoteLength
}

const DEFAULT_STATE: GlobalScaleState = {
  quarterWidth: 40,
  measuresPerLine: 4,
  lineHeight: 100,
  snapDuration: EIGHTH_NOTE,
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
  const { quarterWidth, measuresPerLine, lineHeight, snapDuration } = useGlobalScaleInternal()
  return {
    baseWidth: quarterWidth / QUARTER_NOTE,
    quarterWidth,
    measuresPerLine,
    lineHeight,
    snapDuration,
  }
}
