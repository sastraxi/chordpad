import { Box, Editable, EditableInput, EditablePreview, HStack, Kbd, Text, VStack } from '@chakra-ui/react'
import ChordInput from '../inputs/ChordInput'
import { useCallback, useMemo, useRef, useState } from 'react'
import TimelineItem, { ItemView } from './TimelineItem'
import { UseComboboxGetInputPropsOptions } from 'downshift'
import { SectionItem, useDefaultSongContext, useSection } from '../state/song'
import { range, remove, update } from '../util'
import SongContextEditor from './SongContextEditor'

import { isValidChord } from 'noteynotes/theory/chords'
import { getRomanNumeral } from 'noteynotes/theory/triads'
import { useGlobalScale } from '../state/global-scale'
import TimelineRow from './TimelineRow'

type PropTypes = {
  index: number
}

const SectionEditor = ({ index: sectionIndex }: PropTypes) => {
  const defaultContext = useDefaultSongContext()
  const globalScale = useGlobalScale()
  const { section, setItems, setTitle, ...contextMutators } = useSection(sectionIndex)

  const timeSignature = section.contextOverrides.timeSignature ?? defaultContext.timeSignature
  const key = section.contextOverrides.key ?? defaultContext.key

  const lineLength = globalScale.measuresPerLine * timeSignature.perMeasure
  const lineWidth = lineLength * globalScale.quarterWidth

  const updateChord = (index: number) =>
    (newChord: string | null) => setItems(update(section.items, index, { chord: newChord }))

  const removeChord = (index: number) =>
    () => setItems(remove(section.items, index))

  const addChord = (newChord: string | null) => {
    if (!newChord) return
    if (!isValidChord(newChord)) return
    setItems([
      ...section.items,
      {
        chord: newChord,
        durationBeats: timeSignature.perMeasure,
      },
    ])
  }

  /**
   * If this item needs to be split up to fit on multiple timeline rows, 
   * this returns the "view windows" we need to do it.
   */
  const getCutViews = (item: SectionItem, position: number): ItemView[] => {
    const cuts: ItemView[] = []
    let linePosition = position % lineLength
    let last = 0
    while (last < item.durationBeats) {
      const next = last + Math.min(item.durationBeats - last, lineLength - linePosition)
      cuts.push({ start: last, end: next })
      linePosition = 0
      last = next
    }
    return cuts
  }

  const chordsContainer = useRef<HTMLDivElement | null>(null)

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

  const positions = useMemo(() => {
    return section.items.reduce<Array<number>>((positions, _item, index) => {
      if (index === 0) {
        positions.push(0)
      } else {
        positions.push(section.items[index - 1].durationBeats + positions[index - 1])
      }
      return positions
    }, [])
  }, [section.items])

  const endPosition = section.items.length > 0
    ? positions[positions.length - 1] + section.items[section.items.length - 1].durationBeats
    : 0

  const numLines = Math.ceil(endPosition / lineLength)

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
      </HStack>
      <Box position="relative">
        <VStack width={`${lineWidth}px`} position="absolute" alignItems="flex-start" left={0} top={0}>
          {range(numLines).map((i) => (
            <TimelineRow
              key={i}
              length={i === numLines - 1 ? (endPosition - (lineLength * (numLines - 1))) : lineLength}
              lengthResolution={4}
              quarterWidth={globalScale.quarterWidth}
              lineHeight={globalScale.lineHeight}
              startAt={i * lineLength}
              subdivisions={4}
              timeSignature={timeSignature}
            />
          ))}
        </VStack>
        {/* FIXME: minHeight is not appropriate; fix last TimelineItem! */}
        <Box ref={chordsContainer} minHeight={`${globalScale.lineHeight}px`} width={`${lineWidth}px`} onDragOver={(e) => { e.preventDefault(); return false; }}>
          {
            /* all items that exist in state */
            section.items.map((item, index) => {
              const isValid = item.chord ? isValidChord(item.chord) : false
              const romanNumeral: string | undefined = isValid ? getRomanNumeral(key, item.chord!) : undefined
              return getCutViews(item, positions[index]).map((view, cutIndex) => {
                const isFirst = cutIndex === 0
                return (
                  <TimelineItem
                    key={`${index}.${cutIndex}`}
                    item={item}
                    view={view}
                    position={positions[index]}
                    updateItem={(updates) => setItems(update<SectionItem>(section.items, index, updates))}
                    timeSignature={timeSignature}
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
            item={{ durationBeats: timeSignature.perMeasure }}
            position={endPosition}
            timeSignature={timeSignature}
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
