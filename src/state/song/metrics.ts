import { create } from "zustand"
import { NoteLength } from "../../types"
import { createJSONStorage, persist } from "zustand/middleware"
import { bpmToMsec } from "../../util"
import {
  CombinedItem, DurationUpdate, InsertionIndex,
  SectionMetrics, SongAndMetrics, SongMetrics, Song, ItemMetrics, SectionItem
} from "./types"

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
    const lastSection = metrics.sections[metrics.sections.length - 1]
    const sectionMetric: SectionMetrics = {
      startIndex: (lastSection?.startIndex ?? 0) + (lastSection?.items.length ?? 0),
      items: [],
      pos: (lastSection?.pos ?? 0) + (lastSection?.duration ?? 0),
      duration: 0,
      posMs: (lastSection?.posMs ?? 0) + (lastSection?.durationMs ?? 0),
      durationMs: 0,
    }

    const beatMsec = bpmToMsec(section.contextOverrides.bpm ?? song.context.bpm)
    for (const item of section.items) {
      const lastItem = sectionMetric.items[sectionMetric.items.length - 1]
      const itemMetric: ItemMetrics = {
        pos: (lastItem?.pos ?? 0) + (lastItem?.duration ?? 0),
        duration: item.duration,
        posMs: (lastItem?.posMs ?? 0) + (lastItem?.duration ?? 0),
        durationMs: beatMsec * item.duration,
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

export const updateDurations = (
  state: SongAndMetrics,
  updates: DurationUpdate[],
): SongAndMetrics => {
  throw new Error(`Not implemented`)
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
