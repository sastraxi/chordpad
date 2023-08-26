import { NoteLength, type TimeSignature } from "../types"

export const MS_TO_SEC = 0.001
export const MIN_TO_SEC = 60
export const SEC_TO_MS = 1 / MS_TO_SEC
export const MIN_TO_MS = MIN_TO_SEC * SEC_TO_MS

export const NOTE_DENOMINATOR = 48
export const WHOLE_NOTE: NoteLength = NOTE_DENOMINATOR
export const HALF_NOTE: NoteLength = NOTE_DENOMINATOR / 2
export const HALF_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 3
export const QUARTER_NOTE: NoteLength = NOTE_DENOMINATOR / 4
export const QUARTER_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 6
export const EIGHTH_NOTE: NoteLength = NOTE_DENOMINATOR / 8
export const EIGHTH_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 12
export const SIXTEENTH_NOTE: NoteLength = NOTE_DENOMINATOR / 16
export const SIXTEENTH_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 24
// export const THIRTYSECOND_NOTE: NoteLength = NOTE_DENOMINATOR / 32
// export const THIRTYSECOND_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 48

export const durationToMeasures = (duration: NoteLength, timeSignature: TimeSignature): number =>
  (1 / NOTE_DENOMINATOR) * duration *
  (timeSignature.noteValue / timeSignature.perMeasure)

export const measuresToDuration = (measures: number, timeSignature: TimeSignature): NoteLength =>
  NOTE_DENOMINATOR * measures *
  (timeSignature.perMeasure / timeSignature.noteValue)
