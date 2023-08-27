import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TimeSignature } from '../../types'
import { accum, sum, update } from '../../util'
import { SectionItem, SongContext, SongSection, Song, SongAndMetrics, SectionMetrics } from './types'
import { buildMetrics } from './metrics'
import { QUARTER_NOTE, bpmToMsec } from '../../util/conversions'

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
        { chord: 'C major', duration: 4 * QUARTER_NOTE },
        { chord: 'F major', duration: 4 * QUARTER_NOTE },
        { chord: 'E minor', duration: 4 * QUARTER_NOTE }
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

      const setSongAndMetrics = (updateFunc: (song: Song) => Partial<Song>) =>
        set((state) => {
          const song = { ...state.song, ...updateFunc(state.song) }
          return {
            song,
            metrics: buildMetrics(song),
          }
        })

      return {
        ...INITIAL_STATE,

        resetSong: () => set(() => INITIAL_STATE),

        setAuthor: (author: string) => setSong(() => ({ author })),
        setTitle: (title: string) => setSong(() => ({ title })),
        setDefaultContext: (updates: Partial<SongContext>) =>
          // FIXME: performance?
          setSongAndMetrics((song) => ({
            context: {
              ...song.context,
              ...updates,
            }
          })),

        setSectionItems: (index: number, items: Array<SectionItem>) =>
          // FIXME: performance?
          setSongAndMetrics((song) => ({
            sections: update(song.sections, index, { items }),
          })),

        setSectionContext: (index: number, contextOverrides: Partial<SongContext>) =>
          // FIXME: performance?
          setSongAndMetrics((song) => ({
            sections: update(song.sections, index, { contextOverrides })
          })),

        setSectionTitle: (index: number, title: string) =>
          setSong((song) => ({
            sections: update(song.sections, index, { title })
          })),

        addSection: () => setSongAndMetrics((song) => ({
          // FIXME: performance?
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
  metrics: state.metrics,
  sections: state.song.sections,
  addSection: state.addSection,
}))

type UseSection =
  ContextMutators &
  SectionMutators & {
    section: SongSection,
    metrics: SectionMetrics
  }

export const useSection = (index: number): UseSection => {
  const defaultContext = useDefaultSongContext()
  const section = useSongState(state => state.song.sections[index])
  const metrics = useSongState(state => state.metrics.sections[index])
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
    metrics,

    setBpm: setOrClear('bpm'),
    setKey: setOrClear('key'),
    setTimeSignature: setOrClear('timeSignature'),

    setItems: (items: SectionItem[]) => setSectionItems(index, items),
    setTitle: (title: string) => setSectionTitle(index, title),
  }
}
