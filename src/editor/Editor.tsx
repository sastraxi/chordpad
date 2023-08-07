import { Box, Flex, InputProps } from '@chakra-ui/react'
import ChordInput from '../inputs/ChordInput'
import { useCallback, useRef, useState } from 'react'
import TimelineItem from './TimelineItem'
import { UseComboboxGetInputPropsOptions } from 'downshift'

const Editor = () => {
  const [chords, setChords] = useState<Array<string | null>>(["C", "Cmaj7", "Fm", null])
  const updateChord = (index: number) =>
    (newChord: string | null) => {

      const newChordArray = [
        ...chords.slice(0, index),
        newChord,
        ...chords.slice(index + 1),
      ]

      if (index === chords.length - 1 && newChord) {
        // need empty chord at the end
        newChordArray.push(null)
      }

      setChords(newChordArray)
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
      <Box ref={chordsContainer} maxWidth="1200px">
        {
          chords.map((chord, index) => {
            return (
              <TimelineItem
                key={index}
                durationBeats={4}
                positionBeats={index * 4}
                timeSignature={{ noteValue: 4, perMeasure: 4 }}
              >
                <span>iii</span>
                <ChordInput
                  key={index}
                  value={chord}
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

export default Editor
