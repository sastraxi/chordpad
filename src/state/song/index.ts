import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TimeSignature } from '../../types'
import { accum, bpmToMsec, sum, update } from '../../util'
import { SectionItem, SongContext, SongSection, Song, SongAndMetrics } from './types'
import { buildMetrics } from './metrics'

const DEFAULT_SONG: Song = {
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
        { chord: 'C major', duration: 4 },
        { chord: 'F major', duration: 4 },
        { chord: 'E minor', duration: 4 }
      ]
    }
  ]
}

const INITIAL_STATE: SongAndMetrics = {
  song: DEFAULT_SONG,
  metrics: buildMetrics(DEFAULT_SONG),
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

type SongStateAndMutators = SongAndMetrics & {
  resetSong: () => void
  setDefaultContext: (contextOverrides: Partial<SongContext>) => void
  setAuthor: (author: string) => void
  setTitle: (author: string) => void

  addSection: () => void
  setSectionItems: (index: number, items: Array<SectionItem>) => void
  setSectionContext: (index: number, contextOverrides: Partial<SongContext>) => void
  setSectionTitle: (index: number, title: string) => void
}

export const SongState = create<SongStateAndMutators>()(
  persist(
    (set) => {
      const setSong = (updateFunc: (song: Song) => Partial<Song>) =>
        set(({ song }) => ({ song: { ...song, ...updateFunc(song) } }))

      return {
        ...INITIAL_STATE,

        resetSong: () => set(() => INITIAL_STATE),

        setAuthor: (author: string) => setSong(() => ({ author })),
        setTitle: (title: string) => setSong(() => ({ title })),
        setDefaultContext: (updates: Partial<SongContext>) =>
          // FIXME: needs to fix-up metrics
          setSong((song) => ({
            context: {
              ...song.context,
              ...updates,
            }
          })),

        setSectionItems: (index: number, items: Array<SectionItem>) =>
          // FIXME: needs to fix-up metrics
          setSong((song) => ({
            sections: update(song.sections, index, { items }),
          })),

        setSectionContext: (index: number, contextOverrides: Partial<SongContext>) =>
          // FIXME: needs to fix-up metrics
          setSong((song) => ({
            sections: update(song.sections, index, { contextOverrides })
          })),

        setSectionTitle: (index: number, title: string) =>
          setSong((song) => ({
            sections: update(song.sections, index, { title })
          })),

        addSection: () => setSong((song) => ({
          // FIXME: needs to fix-up metrics
          sections: [...song.sections, {
            contextOverrides: {},
            rhythmOverrides: new Map(),
            items: [],
          }]
        }))
      }
    },
    {
      name: 'chordpad-song',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

const useSongState = SongState

export const useResetSong = () => useSongState(state => state.resetSong)

//////////////////////////////////////////////////////////

export const useSongMeta = () => useSongState(state => ({
  title: state.song.title,
  setTitle: state.setTitle,
  author: state.song.author,
  setAuthor: state.setAuthor,
}))

//////////////////////////////////////////////////////////\

export const useDefaultSongContext = () => useSongState(state => state.song.context)
export const useMutateDefaultSongContext = (): ContextMutators => useSongState(state => {
  const updateDefaultContext = <T extends keyof SongContext>(key: T) => (value: SongContext[T] | null) => {
    if (value === null) throw new Error(`Cannot set ${key} of the default context to null`)
    state.setDefaultContext({
      ...state.song.context,
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
  sections: state.song.sections,
  addSection: state.addSection,
}))

type UseSection = ContextMutators & SectionMutators & { section: SongSection }

export const useSection = (index: number): UseSection => {
  const defaultContext = useDefaultSongContext()
  const section = useSongState(state => state.song.sections[index])
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

export type SongPlaybackSection = {
  name: string
  /**
   * In beats.
   */
  totalLength: number
  totalLengthMs: number
  subdivisionsMs: Array<number>
}

type TimelineBounds = {
  sections: Array<SongPlaybackSection>
  positions: Array<number>
  positionsMs: Array<number>
  totalLengthMs: number
}

export const useTimelineBounds = (): TimelineBounds => {
  const defaultContext = useDefaultSongContext()
  const sections = useSongState(state => state.song.sections)

  const playbackSections = sections.map((section, index): SongPlaybackSection => {
    const bpm = section.contextOverrides.bpm ?? defaultContext.bpm
    const lengths = section.items.map((item) => item.duration)
    return {
      name: section.title ?? `Section ${index + 1}`,
      totalLengthMs: sum(lengths) * bpmToMsec(bpm),
      totalLength: sum(lengths),
      subdivisionsMs: lengths,
    }
  })

  return {
    sections: playbackSections,
    positions: accum(playbackSections.map(s => s.totalLength)),
    positionsMs: accum(playbackSections.map(s => s.totalLengthMs)),
    totalLengthMs: sum(playbackSections.map(s => s.totalLengthMs)),
  }
}
