import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TimeSignature } from '../types'

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
  updateItem: (index: number, replacements: Partial<SectionItem>) => void
  replaceItem: (index: number, item: SectionItem) => void
  insertItems: (index: number, items: SectionItem[]) => void
  removeItems: (fromIndexInclusive: number, endIndexExclusive?: number) => void
}

type SongStateAndMutators = SongState & {
  resetSong: () => void
  setSectionItems: (index: number, items: Array<SectionItem>) => void
  setSectionContext: (index: number, context: Partial<SongContext>) => void
}

export const useSongState = create<SongStateAndMutators>()(
  persist(
    (set) => ({
      ...DEFAULT_SONG,
      resetSong: () => set(() => ({
        ...DEFAULT_SONG,
      })),
      setSectionItems: (index: number, items: Array<SectionItem>) => set((state) => {
        return {
          sections: [
            ...state.sections.slice(0, index),
            {
              ...state.sections[index],
              items,
            },
            ...state.sections.slice(index + 1),
          ]
        }
      }),
      setSectionContext: (index: number, context: Partial<SongContext>) => set((state) => {
        return {
          sections: [
            ...state.sections.slice(0, index),
            {
              ...state.sections[index],
              contextOverrides: context,
            },
            ...state.sections.slice(index + 1),
          ]
        }
      }),
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
  const section = useSongState(state => state.sections[index])
  const setSectionItems = useSongState(state => state.setSectionItems)
  const setSectionContext = useSongState(state => state.setSectionContext)
  const setItems = (items: SectionItem[]) => setSectionItems(index, items)
  const setContext = (context: Partial<SongContext>) => setSectionContext(index, context)

  return {
    section,

    setBpm: (bpm: number | null) => {
      if (bpm === null) {
        const context = { ...section.contextOverrides }
        delete context["bpm"]
        setContext(context)
      } else {
        setContext({
          ...section.contextOverrides,
          bpm,
        })
      }
    },

    setKey: (key: string | null) => {
      if (key === null) {
        const context = { ...section.contextOverrides }
        delete context["key"]
        setContext(context)
      } else {
        setContext({
          ...section.contextOverrides,
          key,
        })
      }
    },

    setTimeSignature: (timeSignature: TimeSignature | null) => {
      if (timeSignature === null) {
        const context = { ...section.contextOverrides }
        delete context["timeSignature"]
        setContext(context)
      } else {
        setContext({
          ...section.contextOverrides,
          timeSignature,
        })
      }
    },

    updateItem: (index: number, replacements: Partial<SectionItem>) =>
      setItems([
        ...section.items.slice(0, index),
        { ...section.items[index], ...replacements },
        ...section.items.slice(index + 1),
      ]),

    replaceItem: (index: number, item: SectionItem) =>
      setItems([
        ...section.items.slice(0, index),
        item,
        ...section.items.slice(index + 1),
      ]),

    insertItems: (index: number, items: SectionItem[]) =>
      setItems([
        ...section.items.slice(0, index),
        ...items,
        ...section.items.slice(index),
      ]),

    removeItems: (fromIndexInclusive: number, endIndexExclusive?: number) =>
      setItems([
        ...section.items.slice(0, fromIndexInclusive),
        ...section.items.slice(endIndexExclusive ?? section.items.length)
      ])
  }
}
