import { Button, Flex, SimpleGrid } from "@chakra-ui/react"

import {
  displayAccidentals,
  noteNameEquals,
  ENHARMONIC_NORMALIZE_MAP,
  MAJOR_MODES_BY_DEGREE,
} from "noteynotes/theory/common"

type PropTypes = {
  value: string
  onChange: (newKey: string) => void
}

const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const noteText = (note: string) => {
  if (note.length === 1) return note
  return displayAccidentals(
    `${(ENHARMONIC_NORMALIZE_MAP as any)[note]} / ${note}`
  )
}

const KeyInput = ({
  value,
  onChange,
}: PropTypes) => {

  const [currentNote, currentMode] = value.split(' ')

  // TODO: normalize key names we set based on circle of 5ths

  return (
    <Flex>
      <SimpleGrid columns={3}>
        {NOTES.map(note => (
          <Button
            variant={noteNameEquals(note, currentNote) ? "solid" : "ghost"}
            onClick={() => onChange(`${note} ${currentMode}`)}
            key={note}
          >
            {noteText(note)}
          </Button>
        ))}
      </SimpleGrid>
      <Flex direction="column">
        {MAJOR_MODES_BY_DEGREE.map(mode => (
          <Button
            variant={mode === currentMode ? "solid" : "ghost"}
            onClick={() => onChange(`${currentNote} ${mode}`)}
            size="sm"
            key={mode}
          >
            {mode}
          </Button>
        ))}
      </Flex>
    </Flex>
  )
}

export default KeyInput
