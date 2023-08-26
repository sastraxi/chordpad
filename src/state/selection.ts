import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type SelectionState = {
  start: number | undefined
  end: number | undefined
}

const DEFAULT_SELECTION: SelectionState = {
  start: undefined,
  end: undefined,
}

//////////////////////////////////////////////////////////

type SelectionStateAndMutators = SelectionState & {
  clear: () => void
  setStart: (start: number | undefined) => void
  setEnd: (start: number | undefined) => void
}

export const useSelection = create<SelectionStateAndMutators>()(
  persist(
    (set) => ({
      ...DEFAULT_SELECTION,
      clear: () => set(() => DEFAULT_SELECTION),
      setStart: (start: number | undefined) => set(() => ({ start })),
      setEnd: (end: number | undefined) => set(() => ({ end })),
    }),
    {
      name: 'chordpad-selection',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
