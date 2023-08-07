import { Box, HStack, Heading } from '@chakra-ui/react'
import ChordInput from '../inputs/ChordInput'
import { useCallback, useRef } from 'react'
import TimelineItem from './TimelineItem'
import { UseComboboxGetInputPropsOptions } from 'downshift'
import TimeSignatureDisplay from '../components/TimeSignatureDisplay'
import PopoverInput from '../components/PopoverInput'
import TimeSignatureInput from '../inputs/TimeSignatureInput'
import TapBpmInput from '../inputs/TapBpmInput'
import KeyInput from '../inputs/KeyInput'
import { useDefaultSongContext, useSection } from '../state/song'
import { update } from '../util'

type PropTypes = {
  index: number
}

const SectionEditor = ({ index }: PropTypes) => {
  const defaultContext = useDefaultSongContext()
  const { section, setBpm, setKey, setTimeSignature, setItems } = useSection(index)
  const timeSignature = section.contextOverrides.timeSignature ?? defaultContext.timeSignature

  const updateChord = (index: number) => (newChord: string | null) => {
    const newItems = update(section.items, index, { chord: newChord })

    if (index === section.items.length - 1 && newChord) {
      // need empty chord at the end
      // TODO: deal with this at the UI layer, not the data layer
      newItems.push({
        chord: null,
        durationBeats: section.items[section.items.length - 1].durationBeats,
      })
    }

    setItems(newItems)
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

        if (!node) return false

        console.log(node);

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

  const inputProps: UseComboboxGetInputPropsOptions = {
    onKeyDown,
  }

  return (
    <Box>
      <HStack py={2}>
        <Heading size="md">
          Intro
        </Heading>
        <PopoverInput
          value={section.contextOverrides.key ?? defaultContext.key}
          onChange={setKey}
          displayComponent={({ value }) => <span>{value}</span>}
          editorComponent={KeyInput}
          buttonProps={{ size: "sm", w: 32 }}
        />
        <PopoverInput
          value={section.contextOverrides.bpm ?? defaultContext.bpm}
          onChange={setBpm}
          displayComponent={({ value }) => <span>𝅘𝅥 = {value}</span>}
          editorComponent={TapBpmInput}
          buttonProps={{ size: "sm", w: 16 }}
        />
        <PopoverInput
          value={timeSignature}
          onChange={setTimeSignature}
          displayComponent={TimeSignatureDisplay}
          editorComponent={TimeSignatureInput}
          closeOnChange
          buttonProps={{ size: "sm" }}
        />
      </HStack>
      <Box ref={chordsContainer} maxWidth="1200px">
        {
          section.items.map((item, index) => {
            return (
              <TimelineItem
                key={index}
                durationBeats={item.durationBeats}
                positionBeats={index * 4}
                timeSignature={timeSignature}
              >
                <span>iii</span>
                <ChordInput
                  key={index}
                  value={item.chord}
                  onChange={updateChord(index)}
                  additionalInputProps={inputProps}
                />
              </TimelineItem>
            )
          })
        }
      </Box>
    </Box>
  )
}

export default SectionEditor
