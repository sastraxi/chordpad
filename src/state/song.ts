import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ItemIndex, TimeSignature } from '../types'
import { bpmToMsec, replace, sum, update } from '../util'

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

export type BaseTimelineItem = {
  durationBeats: number,
}

export type SectionItem = BaseTimelineItem & {
  chord: string | null,
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
  title: 'My song',
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

//////////////////////////////////////////////////////////

export type ContextMutators = {
  setBpm: (bpm: number | null) => void
  setKey: (key: string | null) => void
  setTimeSignature: (timeSignature: TimeSignature | null) => void
}

type SectionMutators = {
  setItems: (items: SectionItem[]) => void
  setTitle: (title: string) => void
}

type SongStateAndMutators = SongState & {
  resetSong: () => void
  setDefaultContext: (contextOverrides: Partial<SongContext>) => void
  setAuthor: (author: string) => void
  setTitle: (author: string) => void

  addSection: () => void
  setSectionItems: (index: number, items: Array<SectionItem>) => void
  setSectionContext: (index: number, contextOverrides: Partial<SongContext>) => void
  setSectionTitle: (index: number, title: string) => void
}

export const useSongState = create<SongStateAndMutators>()(
  persist(
    (set) => ({
      ...DEFAULT_SONG,

      resetSong: () => set(() => DEFAULT_SONG),

      setAuthor: (author: string) => set(() => ({ author })),
      setTitle: (title: string) => set(() => ({ title })),
      setDefaultContext: (contextOverrides: Partial<SongContext>) =>
        set((state) => ({
          context: {
            ...state.context,
            ...contextOverrides,
          }
        })),

      setSectionItems: (index: number, items: Array<SectionItem>) =>
        set((state) => ({
          sections: update(state.sections, index, { items })
        })),

      setSectionContext: (index: number, contextOverrides: Partial<SongContext>) =>
        set((state) => ({
          sections: update(state.sections, index, { contextOverrides })
        })),

      setSectionTitle: (index: number, title: string) =>
        set((state) => ({
          sections: update(state.sections, index, { title })
        })),

      addSection: () => set((state) => ({
        sections: [...state.sections, {
          contextOverrides: {},
          rhythmOverrides: new Map(),
          items: [],
        }]
      }))

    }),
    {
      name: 'chordpad-song',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export const useResetSong = () => useSongState(state => state.resetSong)

//////////////////////////////////////////////////////////

export const useSongMeta = () => useSongState(state => ({
  title: state.title,
  setTitle: state.setTitle,
  author: state.author,
  setAuthor: state.setAuthor,
}))

//////////////////////////////////////////////////////////\

export const useDefaultSongContext = () => useSongState(state => state.context)
export const useMutateDefaultSongContext = (): ContextMutators => useSongState(state => {
  const updateDefaultContext = <T extends keyof SongContext>(key: T) => (value: SongContext[T] | null) => {
    if (value === null) throw new Error(`Cannot set ${key} of the default context to null`)
    state.setDefaultContext({
      ...state.context,
      [key]: value,
    })
  }

  return {
    setBpm: updateDefaultContext('bpm'),
    setKey: updateDefaultContext('key'),
    setTimeSignature: updateDefaultContext('timeSignature'),
  }
})


//////////////////////////////////////////////////////////

export const useSongSections = () => useSongState(state => ({
  sections: state.sections,
  addSection: state.addSection,
}))

type UseSection = ContextMutators & SectionMutators & { section: SongSection }

export const useSection = (index: number): UseSection => {
  const defaultContext = useDefaultSongContext()
  const section = useSongState(state => state.sections[index])
  const setSectionItems = useSongState(state => state.setSectionItems)
  const setSectionContext = useSongState(state => state.setSectionContext)
  const setSectionTitle = useSongState(state => state.setSectionTitle)

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

    setItems: (items: SectionItem[]) => setSectionItems(index, items),
    setTitle: (title: string) => setSectionTitle(index, title),
  }
}

export const useSectionItem = ({ section: sectionIndex, item: itemIndex }: ItemIndex) => {
  const sectionItems = useSongState(state => state.sections[sectionIndex].items)
  const setSectionItems = useSongState(state => state.setSectionItems)
  const updateItem = (updates: Partial<SectionItem>) => setSectionItems(
    sectionIndex,
    update(sectionItems, itemIndex, updates),
  )
  return {
    item: sectionItems[itemIndex],
    updateItem,
  }
}

export type SongPlaybackSection = {
  name: string
  totalLengthMs: number
  subdivisionsMs: Array<number>
}

type SongPlaybackInfo = {
  sections: Array<SongPlaybackSection>
}

export const useSongPlaybackInfo = (): SongPlaybackInfo => {
  const defaultContext = useDefaultSongContext()
  const sections = useSongState(state => state.sections)

  const playbackSections = sections.map((section, index): SongPlaybackSection => {
    const bpm = section.contextOverrides.bpm ?? defaultContext.bpm
    const lengths = section.items.map((item) => bpmToMsec(bpm) * item.durationBeats)
    return {
      name: section.title ?? `Section ${index + 1}`,
      totalLengthMs: sum(lengths),
      subdivisionsMs: lengths,
    }
  }).filter(
    section => section.totalLengthMs > 0
  )

  return {
    sections: playbackSections
  }
}
