import { NoteLength, type TimeSignature } from "../types"

export const MS_TO_SEC = 0.001
export const MIN_TO_SEC = 60
export const SEC_TO_MS = 1 / MS_TO_SEC
export const MIN_TO_MS = MIN_TO_SEC * SEC_TO_MS

export const NOTE_DENOMINATOR = 48

export const WHOLE_NOTE: NoteLength = NOTE_DENOMINATOR
export const HALF_NOTE: NoteLength = NOTE_DENOMINATOR / 2
export const DOTTED_HALF_NOTE: NoteLength = HALF_NOTE * 1.5
export const HALF_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 3
export const QUARTER_NOTE: NoteLength = NOTE_DENOMINATOR / 4
export const DOTTED_QUARTER_NOTE: NoteLength = QUARTER_NOTE * 1.5
export const QUARTER_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 6
export const EIGHTH_NOTE: NoteLength = NOTE_DENOMINATOR / 8
export const DOTTED_EIGHTH_NOTE: NoteLength = EIGHTH_NOTE * 1.5
export const EIGHTH_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 12
export const SIXTEENTH_NOTE: NoteLength = NOTE_DENOMINATOR / 16
export const SIXTEENTH_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 24

export const NOTE_VALUES = {
  "Whole": WHOLE_NOTE,
  "Half": HALF_NOTE,
  "Quarter": QUARTER_NOTE,
  "Eighth": EIGHTH_NOTE,
  "Sixteenth": SIXTEENTH_NOTE,
  "Half triplet": HALF_NOTE_TRIPLET,
  "Quarter triplet": QUARTER_NOTE_TRIPLET,
  "Eighth triplet": EIGHTH_NOTE_TRIPLET,
  "Sixteenth triplet": SIXTEENTH_NOTE_TRIPLET,
  "Dotted half": DOTTED_HALF_NOTE,
  "Dotted quarter": DOTTED_QUARTER_NOTE,
  "Dotted eighth": DOTTED_EIGHTH_NOTE,
}

// export const THIRTYSECOND_NOTE: NoteLength = NOTE_DENOMINATOR / 32
// export const THIRTYSECOND_NOTE_TRIPLET: NoteLength = NOTE_DENOMINATOR / 48

export const durationToMeasures = (duration: NoteLength, timeSignature: TimeSignature): number =>
  (1 / NOTE_DENOMINATOR) * duration *
  (timeSignature.noteValue / timeSignature.perMeasure)

export const measuresToDuration = (measures: number, timeSignature: TimeSignature): NoteLength =>
  NOTE_DENOMINATOR * measures *
  (timeSignature.perMeasure / timeSignature.noteValue)

export const getBeatDuration = (timeSignature: TimeSignature): NoteLength =>
  NOTE_DENOMINATOR / timeSignature.noteValue

export const timeDurationMs = (duration: NoteLength, bpm: number, timeSignature?: TimeSignature) =>
  msecToBpm(bpm) * (duration / (timeSignature ? getBeatDuration(timeSignature) : QUARTER_NOTE))

export const msecToBpm = (durationMs: number) => (1000 / durationMs) * 60
export const bpmToMsec = (bpm: number) => (1000 / (bpm / 60))
