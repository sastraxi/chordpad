import { useCombobox } from 'downshift'
import { Box, Input, Button, List, ListItem, UnorderedList } from '@chakra-ui/react'
import { useState } from 'react'

type PropTypes = {
  chord: string | null,
  onSelect: (chosenChord: string | null) => void
}

const ALL_CHORDS = [
  "C",
  "Cm",
  "Caug",
  "Cb5",
  "Cmaj7",
  "Cmaj9",
  "Cmmaj7",
  "Cmajb9",
  "C#",
  "C#b7",
]

const getChordsFilter = (userInput?: string) => {
  const lower = userInput?.toLowerCase()
  return (chord: string) => !lower || chord.toLowerCase().startsWith(lower)
}

const ChordInput = ({
  chord,
  onSelect,
}: PropTypes) => {
  const [chords, setChords] = useState(ALL_CHORDS)
  const {
    isOpen,
    getInputProps,
    highlightedIndex,
    getItemProps,
    getToggleButtonProps,
    getMenuProps,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      setChords(ALL_CHORDS.filter(getChordsFilter(inputValue)))
    },
    items: chords,
    itemToString: item => item ?? '',
    selectedItem: chord,
    onSelectedItemChange: ({ selectedItem }) => {
      onSelect(selectedItem ?? null)
    },
  })

  return (
    <>
      <Box>
        <Input placeholder="Chord" {...getInputProps()} />
        <Button {...getToggleButtonProps()} />
      </Box>
      <UnorderedList
          {...getMenuProps()}
      >
        {isOpen &&
          chords.map((item, index) => {
            return (
              <ListItem
                key={`${item}-${index}`}
                {...getItemProps({
                  item,
                  index,
                })}
              >
                {item}
              </ListItem>
            )
        })}
      </UnorderedList>
    </>
  )
}

export default ChordInput
