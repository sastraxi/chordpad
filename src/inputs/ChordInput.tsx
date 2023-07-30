import { Box, Button, ButtonProps, Editable, EditableInput, EditablePreview, Flex, FormControl, FormLabel, Input, InputProps, ListItem, UnorderedList } from '@chakra-ui/react'
import { useCombobox } from 'downshift'
import { useRef, useState } from 'react'

type PropTypes = {
  value: string | null,
  onChange: (chosenChord: string | null) => void
  additionalInputProps?: Partial<InputProps>
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
  value,
  onChange,
  additionalInputProps = {},
}: PropTypes) => {
  const [chords, setChords] = useState(ALL_CHORDS)
  const [scratchValue, setScratchValue] = useState(value)
  const {
    isOpen,
    getInputProps,
    highlightedIndex,
    getItemProps,
    getMenuProps,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      setChords(ALL_CHORDS.filter(getChordsFilter(inputValue)))
    },
    items: chords,
    itemToString: item => item ?? '',
    selectedItem: value,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        onChange(selectedItem)
        setScratchValue(selectedItem)
      }
    },
  })

  ///////////////////////////////////////////////////

  return (
    <Flex direction="column" position="relative">
      <Editable
        isPreviewFocusable={true}
        value={scratchValue ?? undefined}
        onChange={setScratchValue}
        onSubmit={onChange}
        submitOnBlur={true}
      >
        <EditablePreview />
        <Input
          {...additionalInputProps}
          placeholder="Chord"
          {...getInputProps()}
          as={EditableInput}
        />

      </Editable>

      <UnorderedList
        position="absolute"
        zIndex="overlay"
        top="2.8em"
        marginLeft={0}
        w={80}
        {...getMenuProps()}
      >
        {isOpen &&
          <Box padding={1} boxShadow="xl" borderRadius="md" background="white">
            {
              chords.map((item, index) => {
                const selected = index === highlightedIndex
                return (
                  <ListItem
                    borderRadius="md"
                    display="block"
                    textAlign="left"
                    padding={1.5}
                    paddingLeft={3}
                    background={selected ? "gray.300" : "initial"}
                    color={selected ? "gray.900" : "gray.800"}
                    key={`${item}-${index}`}
                    {...getItemProps({
                      item,
                      index,
                    })}
                  >
                    {item}
                  </ListItem>
                )
              })
            }
          </Box>
        }
      </UnorderedList>
    </Flex>
  )
}

export default ChordInput
