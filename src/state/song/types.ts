import { NoteLength, TimeSignature } from "../../types"

export type Rhythm = {
  noteValue: NoteLength

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
  chord: string | null
  duration: NoteLength
}

export type SongSection = {
  title?: string
  contextOverrides: Partial<SongContext>
  rhythmOverrides: SongRhythm
  items: Array<SectionItem>
}

export type Song = {
  title?: string
  author?: string
  context: SongContext
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
