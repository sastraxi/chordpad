import { NoteLength, TimeSignature } from "../../types"
import { type Note } from 'noteynotes/theory/common'

export type Rhythm = {
  noteValue: NoteLength

  /**
   * Which positions represent the start of notes?
   * x represents a regular beat, X represents an accented beat, . represents a rest.
   * See DEFAULT_PATTERN for what we do in the absence of this value.
   */
  pattern?: string
}

/**
 * Defines how we generate notes from a chord name.
 */
export type InstrumentType =
  | 'guitar'
  | 'piano'
  | 'drum'

/**
 * When we play a note, what exactly should we play?
 */
export type PlayMode =
  | 'chord'
  | 'root'
  | 'bass'
  | 'arp'   // cycle through a list of notes
  | 'drum'

export type InstrumentIdentity = {
  name: string
  type: InstrumentType

  /**
   * Which instrument number in react-midi-sounds should we use to generate sound?
   * Drum numbers: https://surikov.github.io/midi-sounds-react-examples/examples/midi-sounds-example4/build/
   * Non-drum numbers: https://surikov.github.io/midi-sounds-react-examples/examples/midi-sounds-example3/build/
   */
  patchNumber: number
}

export type InstrumentQuality = {
  muted: boolean

  pattern: Rhythm

  playMode: PlayMode

  /**
   * From 0..1.
   */
  volume: number

  /**
   * From 0..1, with lower values being more stacatto.
   */
  noteLength: number

  /**
   * D: down, d: down (faster)
   * U: up, u: up (faster)
  * 123456: just this note
   */
  strumPattern?: string

  /**
   * From 0..1, with lower values being shorter delays between
   * different strummed notes and "0" representing 0ms. "1" represents
   * a quarter note in the given BPM. The delay will be shortened (if
   * necessary) so that all notes fit into 
   */
  strumDelay?: number

  /**
   * What order will notes be played in an arpeggio?
   * 1 represents the lowest note (either bass or root), and it goes up from there.
   * e.g. "123456"
   */
  arpPattern?: string
}

export type Instrument = InstrumentIdentity & InstrumentQuality

export type SongContext = {
  key: string
  bpm: number
  timeSignature: TimeSignature
  swingRatio?: number
}

export type SectionItem = {
  chord: string | null
  duration: NoteLength
}

export type SongSection = {
  title?: string
  contextOverrides: Partial<SongContext>
  instrumentOverrides: Record<string, Partial<InstrumentQuality>>
  items: Array<SectionItem>
}

export type Song = {
  title?: string
  author?: string
  context: SongContext
  instruments: Array<Instrument>
  sections: Array<SongSection>
}

export type Timing = {
  posMs: number
  durationMs: number
}

export type Measure = {
  pos: NoteLength
  duration: NoteLength
}

export type BaseTimelineItem = Timing & Measure

export type ItemMetrics = Timing & Measure
export type SectionMetrics = Timing & Measure & {
  /**
   * Helpful lookup to show which items live in this section.
   *  
   */
  startIndex: number
  items: Array<ItemMetrics>
}

export type SongMetrics = {
  sections: Array<SectionMetrics>
  duration: NoteLength
  durationMs: number
}

export type CombinedItem = ItemMetrics & SectionItem

export type SongAndMetrics = {
  song: Song,
  metrics: SongMetrics,
}

export type DurationUpdate = {
  index: number
  duration: NoteLength
}

/**
 * When placing an item on a section boundary, just using the global item index
 * doesn't tell us which section to place something (either start of the latter,
 * or end of the former). We need to know both the section + item indices.
 */
export type InsertionIndex = {
  section: number,
  item: number,
}

export type TimedNote = {
  note: Note,
  delayMs: number,
}
