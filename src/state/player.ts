import { create } from 'zustand'
import { MIDISoundPlayer } from 'midi-sounds-react'
import { SongState } from './song'
import { SectionItem, SongContext, SongSection } from './song/types'
import { bpmToMsec } from '../util'

import { getFrettings, frettingToVexChord } from 'noteynotes/instrument/guitar'
import { Midi } from 'tonal'
import { MS_TO_SEC } from '../util/conversions'

/**
 * How often should we buffer music, and update the playback cursor in our state?
 * This affects most of the UI, but not playback or any cursors in <TimelineRow />.
 */
const PLAYBACK_TICK_INTERVAL_MS = 100

/**
 * Always keep at least this much music filled up
 * in the playback buffer.
 */
const QUEUE_AHEAD_MS = 1500

let tickInterval: number | undefined = undefined

type PlaybackItem = {
  section: number
  item: number

  /**
   * When, in "song time", does this item start?
   */
  startsAtMs: number
}

export type PlaybackState = {
  /**
   * When, in "performance time", did playback start?
   * If undefined, we are not currently playing.
   */
  startedAtMs: number

  /**
   * Where did the cursor start (in "song time") when playback began?
   */
  cursorStartMs: number

  /**
   * To what point in "song time" (non-inclusive) have we
   * queued up sounds in our audio player?
   */
  queuedToMs?: number

  /**
   * What is the item we're currently iterating over in the song?
   * If null, that means we've gone past the end of the song.
   */
  currentIndex: PlaybackItem | null

  /**
   * If MIDI playback is available, what was the browser's AudioContext
   * currentTime when playback began?
   */
  audioContextStartSec?: number

}

export const calcCursorMs = (playback: PlaybackState): number => {
  const deltaFromStartMs = performance.now() - playback.startedAtMs
  return playback.cursorStartMs + deltaFromStartMs
}

const newPlayback = (
  cursorStartMs: number,
  midiSounds?: MIDISoundPlayer
): PlaybackState => ({
  cursorStartMs,
  startedAtMs: performance.now(),
  audioContextStartSec: midiSounds?.contextTime(),
  queuedToMs: undefined,  // sentinel value; nothing queued
  currentIndex: { section: 0, item: 0, startsAtMs: 0 },
})

type Range = {
  from: number
  to: number
}

/**
 * Which sounds should we queue next?
 */
const nextQueueRange = (playback: PlaybackState): Range => {
  const from = playback.queuedToMs ?? playback.cursorStartMs
  const to = from + QUEUE_AHEAD_MS
  return { from, to }
}

// TODO: we haven't done anything to re-buffer when the song changes.

const STRUM_DELAY_SEC = 0.08
const NOTE_LENGTH_SEC = 0.5
const TWANGY_GUITAR = 276

const queue = (item: SectionItem, atSec: number, midiSounds: MIDISoundPlayer) => {
  if (item.chord) {
    const fretting = getFrettings(item.chord)[0]
    if (fretting) {
      const chord = frettingToVexChord(fretting)
      chord.notes.forEach((note, i) => {
        midiSounds.playChordAt(
          atSec + i * STRUM_DELAY_SEC,
          TWANGY_GUITAR,
          [Midi.toMidi(note)],
          NOTE_LENGTH_SEC,
        )
      })
    }
  }
}

const buffer = (
  playbackState: PlaybackState,
  rangeMs: Range,
  sections: SongSection[],
  defaultContext: SongContext,
  midiSounds: MIDISoundPlayer,
): Partial<PlaybackState> => {
  const { audioContextStartSec, queuedToMs } = playbackState
  let currentIndex = playbackState.currentIndex

  // reached end of playback; nothing to do
  if (currentIndex === null) return {}

  let section: SongSection | undefined = sections[currentIndex.section]
  let item: SectionItem | undefined = section?.items[currentIndex.item]

  const getCurrentDuration = () => {
    if (!section || !item) throw new Error('Cannot get duration for an item that does not exist')
    const bpm = section.contextOverrides.bpm ?? defaultContext.bpm
    return bpmToMsec(bpm) * item.duration
  }

  if (queuedToMs === undefined) {
    // queue the first chord
    const atSec = (audioContextStartSec ?? 0) + currentIndex.startsAtMs * MS_TO_SEC
    queue(item, atSec, midiSounds)
  }

  while (item && section && currentIndex.startsAtMs + item.duration < rangeMs.to) {
    if (currentIndex.item === section.items.length - 1) {
      currentIndex.item = 0
      currentIndex.section += 1
    } else {
      currentIndex.item += 1
    }
    currentIndex.startsAtMs += getCurrentDuration()

    if (currentIndex.section >= sections.length) {
      currentIndex = null
      break
    }

    // update to our current index
    section = sections[currentIndex.section]
    item = section?.items[currentIndex.item]

    const atSec = (audioContextStartSec ?? 0) + currentIndex.startsAtMs * MS_TO_SEC
    queue(item, atSec, midiSounds)
  }

  return {
    ...playbackState,
    currentIndex: currentIndex,
    queuedToMs: rangeMs.to,
  }
}

type PlayerState = {
  playback: PlaybackState | undefined
  midiSounds?: MIDISoundPlayer
  cursorMs: number
  repeat: boolean
}

const DEFAULT_STATE: PlayerState = {
  playback: undefined,
  cursorMs: 0,
  repeat: false,
}

//////////////////////////////////////////////////////////

type PlayerStateAndMutators = PlayerState & {
  reset: () => void
  seek: (toMs: number) => void
  play: () => void
  pause: () => void
  setPlayer: (player: MIDISoundPlayer) => void
}

const PlayerState = create<PlayerStateAndMutators>()(
  (set) => {

    /**
     * Both advances the playback cursor as well as buffers upcoming sounds.
     */
    const tickPlayback = (state: PlayerState): Partial<PlayerState> => {
      const { playback } = state
      if (!playback) throw new Error("Cannot update playback cursor when not playing!")

      const cursorMs = calcCursorMs(playback)
      if (cursorMs + QUEUE_AHEAD_MS < (playback.queuedToMs ?? 0)) {
        return { cursorMs }
      } else {
        const range = nextQueueRange(playback)
        const { sections, context } = SongState.getState().song
        const bufferChanges = state.midiSounds
          ? buffer(playback, range, sections, context, state.midiSounds)
          : { queuedToMs: range.to }

        return {
          cursorMs,
          playback: {
            ...playback,
            ...bufferChanges,
          }
        }
      }
    }

    return {
      ...DEFAULT_STATE,
      reset: () => set((state) => {
        if (state.playback) {
          clearInterval(tickInterval)
          state.midiSounds?.cancelQueue()
        }
        return DEFAULT_STATE
      }),
      seek: (toMs: number) => set((state) => {
        if (!state.playback) return { cursorMs: toMs }

        // we're currently playing, so we need to clear the current audio
        // queue and re-buffer starting from the new playback position.
        clearInterval(tickInterval)
        state.midiSounds?.cancelQueue()

        // update playback both continuously and immediately
        tickInterval = setInterval(() => set(tickPlayback), PLAYBACK_TICK_INTERVAL_MS)
        return tickPlayback({
          ...state,
          playback: newPlayback(toMs, state.midiSounds),
        })
      }),
      play: () => set((state) => {
        if (state.playback) return {}

        // update playback both continuously and immediately
        tickInterval = setInterval(() => set(tickPlayback), PLAYBACK_TICK_INTERVAL_MS)
        return tickPlayback({
          ...state,
          playback: newPlayback(state.cursorMs, state.midiSounds),
        })
      }),
      pause: () => set((state) => {
        if (state.playback) {
          clearInterval(tickInterval)
          state.midiSounds?.cancelQueue()
        }
        return {
          playback: undefined
        }
      }),
      setPlayer: (midiSounds: MIDISoundPlayer) => set(() => {
        midiSounds.setEchoLevel(0.1)
        midiSounds.setMasterVolume(0.45)
        midiSounds.cacheInstrument(TWANGY_GUITAR)
        return { midiSounds }
      })
    }
  },
)

export const usePlayerState = PlayerState

export const useIsPlaying = () => {
  const { playback } = usePlayerState()
  return playback !== undefined
}

export const useSetPlayer = () => {
  const { setPlayer } = usePlayerState()
  return setPlayer
}

export const usePlayback = () => {
  const { playback } = usePlayerState()
  return playback
}
