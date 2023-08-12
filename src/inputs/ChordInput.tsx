import { Box, Editable, EditableInput, EditablePreview, Flex, Input, ListItem, UnorderedList } from '@chakra-ui/react'
import { UseComboboxGetInputPropsOptions, useCombobox } from 'downshift'
import { useState } from 'react'

import { ALL_CHORD_NAMES, isValidChord } from 'noteynotes/theory/chords'

type PropTypes = {
  value: string | null,
  onChange: (chosenChord: string | null) => void
  onClear?: () => void
  additionalInputProps?: UseComboboxGetInputPropsOptions
}

const getChordsFilter = (userInput?: string) => {
  const lower = userInput?.replace(" ", "").toLowerCase()
  return (chord: string) => !lower || chord.toLowerCase().replace(" ", "").startsWith(lower)
}

const ChordInput = ({
  value,
  onChange,
  onClear,
  additionalInputProps = {},
}: PropTypes) => {
  const [chords, setChords] = useState<string[]>([])
  const [scratchValue, setScratchValue] = useState<string | undefined>(undefined)

  const commit = (value: string | null | undefined) => {
    const potentialValue = value?.trim()
    if (potentialValue && isValidChord(potentialValue)) {
      onChange(potentialValue)
    } else if (!potentialValue) {
      onClear?.()
    }
    setScratchValue(undefined)
  }

  const {
    isOpen,
    getInputProps,
    highlightedIndex,
    getItemProps,
    getMenuProps,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      if (!inputValue || inputValue.length < 1) setChords([])
      setChords(ALL_CHORD_NAMES.filter(getChordsFilter(inputValue)))
    },
    items: chords,
    itemToString: item => item ?? '',
    selectedItem: value,
    onSelectedItemChange: ({ selectedItem }) => {
      commit(selectedItem)
    },
    stateReducer: (state, { type, changes }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.InputBlur: {
          if (chords.length === 1) {
            // select the only chord
            return { ...changes, selectedItem: chords[0] }
          } else if (state.inputValue.trim() === '') {
            // delete this input, if configured
            // FIXME: setTimeout prevents react sadness. Better way is to queue delete with state
            setTimeout(() => onClear?.(), 0)
          }
        }
      }
      return changes
    },
  })

  ///////////////////////////////////////////////////

  // TODO: on tab or spacebar, set chord if current value is not valid
  // TODO: on escape, abandon scratch value

  const currentValue = scratchValue ?? value ?? undefined

  return (
    <Flex direction="column" position="relative" alignItems="flex-start" w={40}>
      <Editable
        placeholder="--"
        isPreviewFocusable={true}
        value={currentValue ?? ""}
        onChange={setScratchValue}
        onSubmit={commit}
        submitOnBlur={true}
        fontSize="xl"
        backgroundColor="white"
        p={0}
      >
        <EditablePreview
          color={currentValue ? "black" : "gray.400"}
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
