import { Box, Editable, EditableInput, EditablePreview, HStack, Kbd } from '@chakra-ui/react'
import ChordInput from '../inputs/ChordInput'
import { useCallback, useMemo, useRef, useState } from 'react'
import TimelineItem from './TimelineItem'
import { UseComboboxGetInputPropsOptions } from 'downshift'
import { SectionItem, useDefaultSongContext, useSection } from '../state/song'
import { remove, update } from '../util'
import SongContextEditor from './SongContextEditor'

import { isValidChord } from 'noteynotes/theory/chords'
import { getRomanNumeral } from 'noteynotes/theory/triads'

type PropTypes = {
  index: number
}

const SectionEditor = ({ index: sectionIndex }: PropTypes) => {
  const defaultContext = useDefaultSongContext()
  const { section, setItems, setTitle, ...contextMutators } = useSection(sectionIndex)

  const timeSignature = section.contextOverrides.timeSignature ?? defaultContext.timeSignature
  const key = section.contextOverrides.key ?? defaultContext.key

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
      <Box ref={chordsContainer} maxWidth="1200px" onDragOver={(e) => { e.preventDefault(); return false; }}>
        {
          /* all items that exist in state */
          section.items.map((item, index) => {
            const isValid = item.chord ? isValidChord(item.chord) : false
            const romanNumeral: string | undefined = isValid ? getRomanNumeral(key, item.chord!) : undefined
            return (
              <TimelineItem
                key={index}
                item={item}
                updateItem={(updates) => setItems(update<SectionItem>(section.items, index, updates))}
                positionBeats={positions[index]}
                timeSignature={timeSignature}
              >
                <Kbd userSelect="none" opacity={item.chord ? 1 : 0} colorScheme="gray" fontSize="sm" pt={1}>
                  {romanNumeral}
                </Kbd>
                <ChordInput
                  key={index}
                  value={item.chord}
                  onChange={updateChord(index)}
                  onClear={removeChord(index)}
                  additionalInputProps={inputProps}
                />
              </TimelineItem>
            )
          })
        }
        {/* a "new item" that is saved as a new SectionItem when successfully edited */}
        <TimelineItem
          item={{ durationBeats: timeSignature.perMeasure }}
          positionBeats={endPosition}
          timeSignature={timeSignature}
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
  )
}

export default SectionEditor
