import { create } from "zustand"
import { NoteLength } from "../../types"
import { createJSONStorage, persist } from "zustand/middleware"
import { bpmToMsec, timeDurationMs } from "../../util/conversions"
import {
  CombinedItem, DurationUpdate, InsertionIndex,
  SectionMetrics, SongAndMetrics, SongMetrics, Song, ItemMetrics, SectionItem
} from "./types"
import { resolveContext } from "./util"

/////////////////////////////////////////////////////////////////////

export const findItemByIndex = (
  { song, metrics }: SongAndMetrics,
  index: number,
): CombinedItem => {
  let maxIndex = 0;
  for (let i = 0; i < song.sections.length; ++i) {
    const section = song.sections[i]
    const sectionMetrics = metrics.sections[i]
    const { startIndex } = sectionMetrics

    maxIndex = startIndex + section.items.length
    if (maxIndex > index) {
      return {
        ...section.items[index - startIndex],
        ...sectionMetrics.items[index - startIndex],
      }
    }
  }
  throw new Error(`Index out of bounds: ${index} > ${maxIndex}`)
}

export const findItemByTime = (
  { song, metrics }: SongAndMetrics,
  instantMs: number,
): CombinedItem => {
  throw new Error(`Not implemented`)
}

export const findItemByPosition = (
  { song, metrics }: SongAndMetrics,
  position: NoteLength,
): CombinedItem => {
  throw new Error(`Not implemented`)
}

/////////////////////////////////////////////////////////////////////

/**
 * Builds song metrics from scratch. Used initially, but expensive.
 * Use the fix-up methods instead to modify metrics minimally when
 * making edits to the song.
 */
export const buildMetrics = (song: Song): SongMetrics => {
  const metrics: SongMetrics = {
    sections: [],
    duration: 0,
    durationMs: 0,
  }

  for (const section of song.sections) {
    const context = resolveContext(song.context, section.contextOverrides)

    const lastSection = metrics.sections[metrics.sections.length - 1]
    const sectionMetric: SectionMetrics = {
      startIndex: (lastSection?.startIndex ?? 0) + (lastSection?.items.length ?? 0),
      items: [],
      pos: (lastSection?.pos ?? 0) + (lastSection?.duration ?? 0),
      duration: 0,
      posMs: (lastSection?.posMs ?? 0) + (lastSection?.durationMs ?? 0),
      durationMs: 0,
    }

    for (const item of section.items) {
      const lastItem = sectionMetric.items[sectionMetric.items.length - 1]
      const itemMetric: ItemMetrics = {
        pos: (lastItem?.pos ?? 0) + (lastItem?.duration ?? 0),
        duration: item.duration,
        posMs: (lastItem?.posMs ?? 0) + (lastItem?.durationMs ?? 0),
        durationMs: timeDurationMs(item.duration, context.bpm, context.timeSignature),
      }
      sectionMetric.items.push(itemMetric)
      sectionMetric.duration += itemMetric.duration
      sectionMetric.durationMs += itemMetric.durationMs
    }

    metrics.sections.push(sectionMetric)
    metrics.duration += sectionMetric.duration
    metrics.durationMs += sectionMetric.durationMs
  }

  return metrics
}

// TODO: pull out core algorithm into its own function and have parameters that
// allow for all types of non-BPM edits to take place.
// BPM updates should have their own algorithm (simpler)
export const updateDurations = (
  state: SongAndMetrics,
  updates: DurationUpdate[],
): SongAndMetrics => {
  // make sure updates are in-order
  updates.sort((a, b) => {
    if (a.index === b.index) throw new Error('Passed two duration updates for the same item!')
    return a.index - b.index
  })

  const song: Song = { ...state.song, sections: [] }
  const metrics: SongMetrics = { ...state.metrics, sections: [] }

  let sectionIndex = 0, itemIndex = 0
  let posDelta = 0, posMsDelta = 0

  const hasDelta = () => posDelta !== 0 && posMsDelta !== 0
  const cloneSection = (upperBoundExclusive?: number) => {
    const oldSection = state.metrics.sections[sectionIndex]
    if (itemIndex === 0) {
      metrics.sections[sectionIndex] = {
        ...oldSection,
        pos: oldSection.pos + posDelta,
        posMs: oldSection.posMs + posMsDelta,
        items: []
      }
    }
    const section = metrics.sections[sectionIndex]
    for (; itemIndex < (upperBoundExclusive ?? oldSection.items.length); itemIndex += 1) {
      const oldItem = oldSection.items[itemIndex]
      section.items[itemIndex] = hasDelta() ? {
        ...oldItem,
        pos: oldItem.pos + posDelta,
        posMs: oldItem.posMs + posMsDelta,
      } : oldItem
    }
  }
  const getSectionContext = () =>
    resolveContext(state.song.context, state.song.sections[sectionIndex].contextOverrides)

  for (const update of updates) {
    while (update.index > state.metrics.sections[sectionIndex].startIndex + state.metrics.sections[sectionIndex].items.length) {

      if (!hasDelta() && itemIndex === 0) {
        // early-out; no changes to make and we need to skip an entire section
        metrics.sections[sectionIndex] = state.metrics.sections[sectionIndex]
      } else {
        // advance to next section, might have to fix-up metrics as we go
        cloneSection()
      }

      sectionIndex += 1
      itemIndex = 0
    }

    // sought item is now in the current section as denoted by sectionIndex
    // fix up all items up to this one
    const thisIndex = update.index - state.metrics.sections[sectionIndex].startIndex

    // advance to our item, might have to fix-up metrics as we go
    cloneSection(thisIndex)
    itemIndex = thisIndex

    // (always) fix up this item, apply duration update, update posDelta + posMsDelta
    const context = getSectionContext()
    const oldItem = state.metrics.sections[sectionIndex].items[itemIndex]
    const newItem = hasDelta() ? {
      ...oldItem,
      pos: oldItem.pos + posDelta,
      posMs: oldItem.posMs + posMsDelta,
      duration: update.duration,
      durationMs: timeDurationMs(update.duration, context.bpm, context.timeSignature),
    } : oldItem
    metrics.sections[sectionIndex].items.push(newItem)
    posDelta += (newItem.duration - oldItem.duration)
    posMsDelta += (newItem.durationMs - oldItem.durationMs)

    // advance to next item
    if (itemIndex === state.metrics.sections[sectionIndex].items.length - 1) {
      sectionIndex += 1
      itemIndex = 0
    } else {
      itemIndex += 1
    }
  }

  // fix up all of the items after our updates are complete
  while (sectionIndex < state.metrics.sections.length) {

    if (!hasDelta() && itemIndex === 0) {
      // early-out; no changes to make and we need to skip an entire section
      metrics.sections[sectionIndex] = state.metrics.sections[sectionIndex]
    } else {
      // advance to next section, might have to fix-up metrics as we go
      cloneSection()
    }

    sectionIndex += 1
    itemIndex = 0
  }

  return { song, metrics }
}

export const moveItems = (
  state: SongAndMetrics,
  startIndex: number,
  numItems: number,
  to: InsertionIndex,
): SongAndMetrics => {
  throw new Error(`Not implemented`)
}

export const insertItems = (
  state: SongAndMetrics,
  items: SectionItem[],
  at: InsertionIndex,
): SongAndMetrics => {
  throw new Error(`Not implemented`)
}

export const deleteItems = (
  state: SongAndMetrics,
  startIndex: number,
  numItems: number,
): SongAndMetrics => {
  throw new Error(`Not implemented`)
}

export const changeSongBpm = (
  state: SongAndMetrics,
  bpm: number,
): SongAndMetrics => {
  throw new Error(`Not implemented`)
}

export const changeSectionBpm = (
  state: SongAndMetrics,
  sectionIndex: number,
  bpm: number,
): SongAndMetrics => {
  throw new Error(`Not implemented`)
}
