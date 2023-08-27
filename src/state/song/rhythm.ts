import { type Note } from 'noteynotes/theory/common'

import { NoteLength } from "../../types";
import { EIGHTH_NOTE, EIGHTH_NOTE_TRIPLET, HALF_NOTE, QUARTER_NOTE, QUARTER_NOTE_TRIPLET, WHOLE_NOTE, bpmToMsec, timeDurationMs } from "../../util/conversions";
import { Instrument, InstrumentQuality, PlayMode, Rhythm, SongContext, TimedNote } from "./types";

export const DEFAULT_PATTERN = 'x'
export const DEFAULT_STRUM_PATTERN = 'DU'
export const DEFAULT_ARP_PATTERN = '123456'
export const DEFAULT_STRUM_DELAY = 0.5

export const NON_DRUM_PLAY_MODES: PlayMode[] = [
  'chord',
  'root',
  'bass',
  'arp',
]

export const resolveInstruments = (
  instruments: Array<Instrument>,
  overrides: Record<string, Partial<InstrumentQuality>>
) => instruments.map((instrument) => ({
  ...instrument,
  ...(overrides[instrument.name] ?? {}),
}))

export const strumNotes = (
  notes: Note[],
  instrument: InstrumentQuality,
  durationToNextItem: NoteLength,
  { bpm, timeSignature }: SongContext,
): TimedNote[] => {
  // prevent strum from crossing over to next item / note
  const configuredDelayMs = (instrument.strumDelay ?? DEFAULT_STRUM_DELAY) * timeDurationMs(QUARTER_NOTE, bpm, timeSignature)
  const maxDelayMs = timeDurationMs(durationToNextItem, bpm, timeSignature) / notes.length
  const delayMs = Math.min(configuredDelayMs, maxDelayMs)
  return notes.map((note, index) => ({
    note,
    delayMs: index * delayMs,
  }))
}

/**
 * Compact initializer for a rhythm pattern.
 * @param noteValue the length of each character
 * @param pulseString e.g. x...x...x
 */
const rhy = (noteValue: NoteLength, pattern: string): Rhythm => ({
  pattern,
  noteValue,
})

export const PatternLibrary = {
  'whole': rhy(WHOLE_NOTE, 'x'),
  'half': rhy(HALF_NOTE, 'x'),
  'quarter': rhy(QUARTER_NOTE, 'x'),
  'three': rhy(QUARTER_NOTE, '..x.'),
  'eighth': rhy(EIGHTH_NOTE, 'x'),
  'quarter triplets': rhy(QUARTER_NOTE_TRIPLET, 'x'),
  'eighth triplets': rhy(EIGHTH_NOTE_TRIPLET, 'x'),
  'heartbeat': rhy(EIGHTH_NOTE, 'x..x'),
} as const

export const PATTERN_NAMES = Object.keys(PatternLibrary)
