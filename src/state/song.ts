import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TimeSignature } from '../types'
import { replace, update } from '../util'

export type Rhythm = {
  /**
   * How many pulses fit into a bar, e.g.
   *  - whole notes = 1,
   *  - quarter notes = 4,
   *  - eighth notes = 8,
   *  - eighth note triplets = 12,
   *  - sixteenth notes = 16,
   *  - sixteenth note triplets = 24,
   *    etc.
   */
  noteValue: number

  /**
   * Which positions represent the start of notes?
   */
  pulses: Array<boolean>
}

export type InstrumentName =
  'bass' | 'piano' | 'electric guitar' | 'acoustic guitar' |
  'kick' | 'snare' | 'hi hat' | 'crash'

export type SongContext = {
  key: string
  bpm: number
  timeSignature: TimeSignature
  swingRatio?: number
}

/**
 * Null to override and disable an instrument in a section.
 */
export type SongRhythm = Map<InstrumentName, Rhythm | null>

export type SectionItem = {
  chord: string | null,
  durationBeats: number,
}

export type SongSection = {
  title?: string
  contextOverrides: Partial<SongContext>
  rhythmOverrides: SongRhythm
  items: Array<SectionItem>
}

export type SongState = {
  title?: string
  author?: string
  context: SongContext
  sections: Array<SongSection>
}

const DEFAULT_SONG: SongState = {
  context: {
    bpm: 120,
    key: 'C major',
    timeSignature: { perMeasure: 4, noteValue: 4 },
  },
  sections: [
    {
      title: 'Intro',
      rhythmOverrides: new Map(),
      contextOverrides: {},
      items: [
        { chord: 'C major', durationBeats: 4 },
        { chord: 'F major', durationBeats: 4 },
        { chord: 'E minor', durationBeats: 4 }
      ]
    }
  ]
}

type ContextMutators = {
  setBpm: (bpm: number | null) => void
  setKey: (key: string | null) => void
  setTimeSignature: (timeSignature: TimeSignature | null) => void
}

type SectionMutators = {
  setItems: (items: SectionItem[]) => void
}

type SongStateAndMutators = SongState & {
  resetSong: () => void
  setSectionItems: (index: number, items: Array<SectionItem>) => void
  setSectionContext: (index: number, contextOverrides: Partial<SongContext>) => void
}

export const useSongState = create<SongStateAndMutators>()(
  persist(
    (set) => ({
      ...DEFAULT_SONG,

      resetSong: () => set(() => DEFAULT_SONG),

      setSectionItems: (index: number, items: Array<SectionItem>) =>
        set((state) => ({
          sections: update(state.sections, index, { items })
        })),

      setSectionContext: (index: number, contextOverrides: Partial<SongContext>) =>
        set((state) => ({
          sections: update(state.sections, index, { contextOverrides })
        })),

    }),
    {
      name: 'chordpad-song',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export const useDefaultSongContext = () => useSongState(state => state.context)
export const useSongSections = () => useSongState(state => state.sections)
export const useResetSong = () => useSongState(state => state.resetSong)

type UseSection = ContextMutators & SectionMutators & { section: SongSection }

export const useSection = (index: number): UseSection => {
  const defaultContext = useDefaultSongContext()
  const section = useSongState(state => state.sections[index])
  const setSectionItems = useSongState(state => state.setSectionItems)
  const setSectionContext = useSongState(state => state.setSectionContext)
  const setItems = (items: SectionItem[]) => setSectionItems(index, items)
  const setContext = (context: Partial<SongContext>) => setSectionContext(index, context)

  const setOrClear = <T extends keyof SongContext>(key: T) => (value: SongContext[T] | null) => {
    if (value === null || value === defaultContext[key]) {
      const context = { ...section.contextOverrides }
      delete context[key]
      setContext(context)
    } else {
      setContext({
        ...section.contextOverrides,
        [key]: value,
      })
    }
  }

  return {
    section,

    setBpm: setOrClear('bpm'),
    setKey: setOrClear('key'),
    setTimeSignature: setOrClear('timeSignature'),

    setItems,
  }
}
