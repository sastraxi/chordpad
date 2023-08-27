import { BellIcon, ChevronRightIcon, DeleteIcon, QuestionIcon, TimeIcon } from "@chakra-ui/icons"
import { Box, Button, ButtonGroup, HStack, IconButton, Input, Select, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spacer, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { useSongInstruments } from "../state/song"
import { NOTE_VALUES } from "../util/conversions"
import { NoteLength } from "../types"
import { DEFAULT_ARP_PATTERN, DEFAULT_STRUM_DELAY, DEFAULT_STRUM_PATTERN, NON_DRUM_PLAY_MODES } from "../state/song/rhythm"
import { PlayMode } from "../state/song/types"
import { debounce } from "../util"

const NON_PATTERN_CHARS = /[^xX.]/
const DEBOUNCE_MS = 250

const InstrumentsEditor = ({
  onClose
}: {
  onClose: () => void
}) => {
  const { instruments, updateInstrument } = useSongInstruments()

  const onPatternChange = (instrumentIndex: number, candidatePattern: string) => {
    const newPattern = candidatePattern.replace(NON_PATTERN_CHARS, '')
    const pattern = newPattern.length === 0 ? undefined : newPattern
    return updateInstrument(instrumentIndex, {
      pattern: {
        ...instruments[instrumentIndex].pattern,
        pattern,
      }
    })
  }

  const onPatternNoteValueChange = (instrumentIndex: number, noteValue: NoteLength) =>
    updateInstrument(instrumentIndex, {
      pattern: {
        ...instruments[instrumentIndex].pattern,
        noteValue,
      }
    })

  const onPlayModeChange = (instrumentIndex: number, playMode: PlayMode) =>
    updateInstrument(instrumentIndex, { playMode })

  const topRow = { pt: 4, border: "none" }
  const bottomRow = { pt: 0, pb: 4 }

  return (
    <Table size="sm" w="100%">
      <Thead>
        <Tr>
          <Th></Th>
          <Th pb={2} verticalAlign="bottom">volume</Th>
          <Th pb={2} verticalAlign="bottom">legato</Th>
          <Th pb={2} verticalAlign="bottom">strum / timing / arp / pattern</Th>
        </Tr>
      </Thead>

      <Tbody>
        {instruments.map((instrument, index) => {
          return (
            <>
              {/* main row */}
              <Tr key={`${instrument.name}-main`}>
                <Td {...topRow} w="100%">
                  <HStack>
                    <ButtonGroup size="xs" isAttached>
                      <IconButton
                        colorScheme='blackAlpha'
                        aria-label='Delete'
                        icon={<DeleteIcon />}
                      />
                      <IconButton
                        colorScheme='blackAlpha'
                        aria-label='Mute / un-mute'
                        icon={<QuestionIcon />}
                      />
                    </ButtonGroup>
                    <Text fontSize="xl" lineHeight={1.2} ml={2}>
                      {instrument.name}
                    </Text>
                    <IconButton
                      size="xs"
                      mr={4}
                      isRound
                      colorScheme="gray"
                      aria-label='Redo'
                      icon={<ChevronRightIcon />}
                    />
                  </HStack>
                </Td>
                <Td {...topRow}>
                  <Slider
                    value={50}
                    min={0}
                    max={100}
                    colorScheme="blackAlpha"
                    w={24}
                  >
                    <SliderTrack bg="red.100">
                      <SliderFilledTrack bg='tomato' />
                    </SliderTrack>
                    <SliderThumb boxSize={6}>
                      <Box color='tomato' as={BellIcon} />
                    </SliderThumb>
                  </Slider>
                </Td>
                <Td {...topRow}>
                  <Slider
                    value={80}
                    min={0}
                    max={100}
                    colorScheme="blackAlpha"
                    w={24}
                  >
                    <SliderTrack bg="blue.100">
                      <SliderFilledTrack bg='LightSkyBlue' />
                    </SliderTrack>
                    <SliderThumb boxSize={6}>
                      <Box color='DodgerBlue' as={BellIcon} />
                    </SliderThumb>
                  </Slider>
                </Td>
                <Td {...topRow}>
                  {
                    instrument.playMode !== 'drum' &&
                    <HStack>
                      <Select
                        w={20}
                        size="xs"
                        value={instrument.playMode}
                        isDisabled={false}
                        onChange={e => onPlayModeChange(index, e.target.value as PlayMode)}
                      >
                        {NON_DRUM_PLAY_MODES.map((playMode) => (
                          <option value={playMode} key={playMode}>{playMode}</option>
                        ))}
                      </Select>
                      {instrument.playMode === 'chord' &&
                        <Input inputMode="text" value={instrument.strumPattern} placeholder={DEFAULT_STRUM_PATTERN} size="xs" w={24} />
                      }
                      {instrument.playMode === 'arp' &&
                        <Input inputMode="text" value={instrument.arpPattern} placeholder={DEFAULT_ARP_PATTERN} size="xs" w={24} />
                      }
                      {instrument.playMode === 'chord' &&
                        <Slider
                          min={0}
                          max={1}
                          w={20}
                          step={0.01}
                          value={instrument.strumDelay ?? DEFAULT_STRUM_DELAY}
                          onChange={debounce(value => updateInstrument(index, { strumDelay: value }), DEBOUNCE_MS)}
                          colorScheme="blackAlpha"
                        >
                          {/* FIXME: need scratch value for debounced update */}
                          <SliderTrack bg="blue.100">
                            <SliderFilledTrack bg='LightSkyBlue' />
                          </SliderTrack>
                          <SliderThumb boxSize="18px" background="DodgerBlue" boxShadow="0px 1px 2px rgba(0, 0, 0, 0.8)">
                            <Box color="white" as={TimeIcon} />
                          </SliderThumb>
                        </Slider>
                      }
                    </HStack>
                  }
                </Td>
              </Tr >

              {/* pattern row */}
              <Tr key={`${instrument.name}-pattern`}>
                <Td {...bottomRow} />
                <Td {...bottomRow} colSpan={3}>
                  <HStack>
                    <Select
                      w={32}
                      size="xs"
                      value={instrument.pattern.noteValue}
                      onChange={e => onPatternNoteValueChange(index, +e.target.value)}
                    >
                      {Object.entries(NOTE_VALUES).map(([name, value]) => (
                        <option value={value} key={name}>{name}</option>
                      ))}
                    </Select>
                    <Input
                      w={72}
                      type="text"
                      size="xs"
                      fontFamily="monospace"
                      placeholder="Pattern"
                      value={instrument.pattern.pattern}
                      onChange={e => onPatternChange(index, e.target.value)}
                    />
                  </HStack>
                </Td>
              </Tr >
            </>
          )
        })}

        <Tr>
          <Td colSpan={4} px={2} py={4} border="none">
            <HStack>
              <Button colorScheme="blue">Add instrument</Button>
              <Spacer />
              <Button onClick={onClose}>Close</Button>
            </HStack>
          </Td>
        </Tr>
      </Tbody>
    </Table >
  )

}

export default InstrumentsEditor