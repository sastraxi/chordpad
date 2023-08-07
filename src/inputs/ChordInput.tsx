import { Box, Button, ButtonProps, Editable, EditableInput, EditablePreview, Flex, FormControl, FormLabel, Input, InputProps, ListItem, UnorderedList } from '@chakra-ui/react'
import { UseComboboxGetInputPropsOptions, useCombobox } from 'downshift'
import { useRef, useState } from 'react'

type PropTypes = {
  value: string | null,
  onChange: (chosenChord: string | null) => void
  additionalInputProps?: UseComboboxGetInputPropsOptions
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

  // TODO: on tab or spacebar, set chord if current value is not valid
  // TODO: on escape, abandon scratch value

  return (
    <Flex direction="column" position="relative" alignItems="flex-start" w={40} h={20}>
      <Editable
        placeholder="--"
        isPreviewFocusable={true}
        value={scratchValue ?? undefined}
        onChange={setScratchValue}
        onSubmit={onChange}
        submitOnBlur={true}
      >
        <EditablePreview
          color={value ? "black" : "gray.400"}
        />
        <Input
          placeholder="Chord"
          {...getInputProps(additionalInputProps)}
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
