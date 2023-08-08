import { Box, Editable, EditableInput, EditablePreview, Flex, Input, ListItem, UnorderedList } from '@chakra-ui/react'
import { UseComboboxGetInputPropsOptions, useCombobox } from 'downshift'
import { useState } from 'react'

import { ALL_GUITAR_CHORDS, combineChord } from 'noteynotes/theory/guitar'

type PropTypes = {
  value: string | null,
  onChange: (chosenChord: string | null) => void
  additionalInputProps?: UseComboboxGetInputPropsOptions
}

// FIXME: enharmonics are missing; "Dm" vs "D minor"; piano chords should be source-of-truth
const ALL_CHORDS = ALL_GUITAR_CHORDS.map(combineChord)

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
    <Flex direction="column" position="relative" alignItems="flex-start" w={40}>
      <Editable
        placeholder="--"
        isPreviewFocusable={true}
        value={scratchValue ?? undefined}
        onChange={setScratchValue}
        onSubmit={onChange}
        submitOnBlur={true}
        fontSize="xl"
        backgroundColor="white"
        p={0}
      >
        <EditablePreview
          color={value ? "black" : "gray.400"}
        />
        <Input
          {...getInputProps(additionalInputProps)}
          as={EditableInput}
          fontSize="xl"
          p={0}
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
          <Box
            padding={1}
            boxShadow="xl"
            borderRadius="md"
            background="white"
            maxH="400px"
            overflowY="auto"
          >
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
