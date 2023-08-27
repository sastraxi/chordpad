import { Box, Editable, EditableInput, EditablePreview, HStack, IconButton, Kbd, Text, VStack } from '@chakra-ui/react'
import ChordInput from '../inputs/ChordInput'
import { useCallback, useRef, useState } from 'react'
import TimelineItem, { ItemView } from './TimelineItem'
import { UseComboboxGetInputPropsOptions } from 'downshift'
import { useDefaultSongContext, useSection } from '../state/song'
import { range, remove, update } from '../util'
import SongContextEditor from './SongContextEditor'

import { isValidChord } from 'noteynotes/theory/chords'
import { getRomanNumeral } from 'noteynotes/theory/triads'
import { useGlobalScale } from '../state/global-scale'
import TimelineRow from './TimelineRow'
import { usePlayback } from '../state/player'
import { BaseTimelineItem, ItemMetrics, SectionItem } from '../state/song/types'
import { measuresToDuration, timeDurationMs } from '../util/conversions'
import { resolveContext } from '../state/song/util'
import { DeleteIcon } from '@chakra-ui/icons'

type PropTypes = {
  index: number
}

const SectionEditor = ({
  index: sectionIndex,
}: PropTypes) => {
  const defaultContext = useDefaultSongContext()
  const globalScale = useGlobalScale()
  const playback = usePlayback()
  const {
    metrics: sectionMetrics,
    section,
    setItems,
    setTitle,
    delete: deleteSection,
    ...contextMutators
  } = useSection(sectionIndex)

  const context = resolveContext(defaultContext, section.contextOverrides)

  const lineDuration = measuresToDuration(globalScale.measuresPerLine, context.timeSignature)
  const lineWidth = globalScale.baseWidth * lineDuration

  const updateChord = (index: number) =>
    (newChord: string | null) => setItems(update(section.items, index, { chord: newChord }))

  const removeChord = (index: number) =>
    () => setItems(remove(section.items, index))

  /**
   * The initial metrics of the new item at the end of the section.
   */
  const scratchItem: BaseTimelineItem = {
    pos: sectionMetrics.pos + sectionMetrics.duration,
    posMs: sectionMetrics.posMs + sectionMetrics.durationMs,
    duration: measuresToDuration(1, context.timeSignature),
    durationMs: timeDurationMs(measuresToDuration(1, context.timeSignature), context.bpm, context.timeSignature),
  }

  const addChord = (newChord: string | null) => {
    if (!newChord) return
    if (!isValidChord(newChord)) return
    setItems([
      ...section.items,
      {
        chord: newChord,
        duration: scratchItem.duration,
      },
    ])
  }

  const chordsContainer = useRef<HTMLDivElement | null>(null)

  /**
   * Makes the chord inputs together feel more like a text editor
   * by shifting focus to the input so many spaces to the left/right.
   * @param chordInput where do we start from?
   * @param delta direction + magnitude of movement
   */
  const navigate = (chordInput: HTMLInputElement, delta: number) => {
    if (!chordsContainer.current) throw new Error("Chords container is not mounted!")

    let node: HTMLDivElement | null = chordInput
    while (node?.parentNode) {
      if (node.parentNode === chordsContainer.current) {
        // figure out what index the current node is of its parents elements
        // let i = 0
        // while ((node = node.previousSibling) != null) { i += 1 }

        for (let i = 0; i < Math.abs(delta); ++i) {
          if (delta < 0) node = (node?.previousSibling ?? null) as HTMLDivElement | null
          if (delta > 0) node = (node?.nextSibling ?? null) as HTMLDivElement | null
          if (!node) break
        }

        if (!node) return false;

        // go back down to the actual input
        (node.querySelector(".chakra-editable__preview") as HTMLSpanElement).focus()
        // TODO: refactor to not use chakra editable; just show input
        // TODO: set selection range as appropriate on newly-focused input
        return true
      } else {
        node = node.parentNode as HTMLDivElement
      }
    }
    throw new Error('Given child element is not in the chords container!')
  }
  const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLInputElement>>((e) => {
    const target = e.target as HTMLInputElement
    if (e.key === 'ArrowLeft' && target.selectionStart === 0) {
      navigate(target, -1)
    } else if (e.key === 'ArrowRight' && target.selectionStart === target.value.length) {
      navigate(target, 1)
    }
  }, [])

  const [scratchTitle, setScratchTitle] = useState<string | undefined>(undefined)
  const inputProps: UseComboboxGetInputPropsOptions = {
    onKeyDown,
  }

  const endPosition = sectionMetrics.items.length === 0 ? 0 :
    sectionMetrics.items[sectionMetrics.items.length - 1].pos +
    sectionMetrics.items[sectionMetrics.items.length - 1].duration

  const numLines = Math.ceil(endPosition / lineDuration)

  /**
   * If this item needs to be split up to fit on multiple timeline rows, 
   * this returns the "view windows" we need to do it.
   */
  const getCutViews = (metrics: ItemMetrics): ItemView[] => {
    const cuts: ItemView[] = []
    let linePosition = metrics.pos % lineDuration
    let last = 0
    while (last < metrics.duration) {
      const next = last + Math.min(metrics.duration - last, lineDuration - linePosition)
      cuts.push({ start: last, end: next })
      linePosition = 0
      last = next
    }
    return cuts
  }

  return (
    <Box>
      <HStack py={2}>
        <Editable
          isPreviewFocusable={true}
          placeholder="New section"
          value={scratchTitle ?? section.title}
          onChange={setScratchTitle}
          onSubmit={title => { setTitle(title); setScratchTitle(undefined) }}
          submitOnBlur={true}
          fontSize="2xl"
          minW={40}
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
        <SongContextEditor
          context={defaultContext}
          overrides={section.contextOverrides}
          mutators={contextMutators}
        />
        <IconButton
          borderWidth={2}
          size="sm"
          variant="ghost"
          aria-label="Delete this section"
          title="Delete this section"
          icon={<DeleteIcon />}
          onClick={deleteSection}
        />
      </HStack>
      <Box position="relative">
        <VStack width={`${lineWidth}px`} position="absolute" alignItems="flex-start" left={0} top={0}>
          {range(numLines).map((i) => {
            const duration = i === numLines - 1 ? (endPosition - (lineDuration * (numLines - 1))) : lineDuration
            return (
              <TimelineRow
                key={i}
                context={context}
                playback={playback}
                measure={{
                  pos: sectionMetrics.pos + i * lineDuration,
                  posMs: sectionMetrics.posMs + timeDurationMs(i * lineDuration, context.bpm, context.timeSignature),
                  duration,
                  durationMs: timeDurationMs(duration, context.bpm, context.timeSignature),
                }}
              />
            )
          })}
        </VStack>
        {/* FIXME: minHeight is not appropriate; fix last TimelineItem! */}
        <Box ref={chordsContainer} minHeight={`${globalScale.lineHeight}px`} width={`${lineWidth}px`} onDragOver={(e) => { e.preventDefault(); return false; }}>
          {
            /* all items that exist in state */
            section.items.map((item, index) => {
              const isValid = item.chord ? isValidChord(item.chord) : false
              const romanNumeral: string | undefined = isValid ? getRomanNumeral(context.key, item.chord!) : undefined
              return getCutViews(sectionMetrics.items[index]).map((view, cutIndex) => {
                const isFirst = cutIndex === 0
                return (
                  <TimelineItem
                    item={sectionMetrics.items[index]}
                    posWithinSection={sectionMetrics.items[index].pos - sectionMetrics.pos}
                    view={view}
                    context={context}
                    updateItem={(updates) => setItems(update<SectionItem>(section.items, index, updates))}
                    key={`${index}.${cutIndex}`}
                  >
                    <Kbd userSelect="none" opacity={item.chord ? 1 : 0} colorScheme="gray" fontSize="sm" pt={1}>
                      {romanNumeral}
                    </Kbd>
                    {isFirst && <ChordInput
                      key={index}
                      value={item.chord}
                      onChange={updateChord(index)}
                      onClear={removeChord(index)}
                      additionalInputProps={inputProps}
                    />}
                    {!isFirst && <Text size="md">{item.chord}</Text>}
                  </TimelineItem>
                )
              })
            })
          }
          {/* a "new item" that is saved as a new SectionItem when successfully edited */}
          <TimelineItem
            item={scratchItem}
            posWithinSection={sectionMetrics.duration}
            context={context}
            additionalBoxProps={{
              position: "absolute",
            }}
          >
            <Kbd opacity={0} colorScheme="gray" fontSize="sm" pt={1} />
            <ChordInput
              value={null}
              onChange={addChord}
              additionalInputProps={inputProps}
            />
          </TimelineItem>
        </Box>
      </Box>
    </Box>
  )
}

export default SectionEditor
