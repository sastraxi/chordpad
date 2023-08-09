import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type ItemIndex = {
  section: number
  item: number
}

type SelectionState = {
  start: ItemIndex | undefined
  end: ItemIndex | undefined
}

const DEFAULT_SELECTION: SelectionState = {
  start: undefined,
  end: undefined,
}

//////////////////////////////////////////////////////////

type SelectionStateAndMutators = SelectionState & {
  clear: () => void
  setStart: (start: ItemIndex | undefined) => void
  setEnd: (start: ItemIndex | undefined) => void
}

export const useSelection = create<SelectionStateAndMutators>()(
  persist(
    (set) => ({
      ...DEFAULT_SELECTION,
      clear: () => set(() => DEFAULT_SELECTION),
      setStart: (start: ItemIndex | undefined) => set(() => ({ start })),
      setEnd: (end: ItemIndex | undefined) => set(() => ({ end })),
    }),
    {
      name: 'chordpad-selection',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
