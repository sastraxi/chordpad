import { BellIcon, ChevronRightIcon, DeleteIcon, EditIcon, QuestionIcon, TimeIcon } from "@chakra-ui/icons"
import { Box, Button, ButtonGroup, Checkbox, HStack, IconButton, Select, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spacer, Table, Td, Text, Th, Tr } from "@chakra-ui/react"
import { useState } from "react"
import TimelineRow from "./TimelineRow"
import Pulse from "../images/Pulse"

type Instrument = {
  name: string
  pulses: number[]
  pulseResolution: number
}

const QUARTER_WIDTH = 40
const LINE_HEIGHT = 30

const EPS = 0.0001
const PULSES = [
  1.0, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0,
  0.6, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0,
  0.6, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0,
  0.6, 0, 0, 0, 0, 0, 0.3, 0, 0.3, 0, 0.3, 0,
]
const PULSE_RESOLUTION = 24

const InstrumentsEditor = ({
  onClose
}: {
  onClose: () => void
}) => {
  const [instruments, setInstruments] = useState<Array<Instrument>>([
    {
      name: "Acoustic",
      pulses: [0.5, 0, 0, 0],
      pulseResolution: 4,
    },
    {
      name: "Electric Guitar",
      pulses: PULSES,
      pulseResolution: PULSE_RESOLUTION,
    }
  ])

  const topRow = { pt: 4, border: "none" }
  const bottomRow = { pt: 0, pb: 4 }

  return (
    <Table size="sm" w="100%">
      <Tr>
        <Th></Th>
        <Th>volume</Th>
        <Th>legato</Th>
        <Th>strum + timing</Th>
      </Tr>

      {instruments.map(({ name, pulses, pulseResolution }) => {
        const getPosition = (index: number) => `${index * 4 * QUARTER_WIDTH / pulseResolution}px`
        return (
          <>
            {/* main row */}
            <Tr>
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
                    {name}
                  </Text>
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
                <HStack>
                  <Checkbox isChecked />
                  <Select placeholder="Pattern" size="xs" w={24}>
                    <option value='option1'>123456</option>
                    <option value='option2'>123436</option>
                  </Select>

                  <IconButton
                    size="xs"
                    colorScheme="gray"
                    aria-label='Change'
                    title='Change '
                    icon={<TimeIcon />}
                  />
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
                    <SliderThumb boxSize="18px" background="DodgerBlue" boxShadow="0px 1px 2px rgba(0, 0, 0, 0.8)">
                      <Box color="white" as={TimeIcon} />
                    </SliderThumb>
                  </Slider>
                </HStack>
              </Td>
            </Tr>

            {/* pattern row */}
            <Tr>
              <Td {...bottomRow}>
                <HStack pl={4}>
                  <Text verticalAlign="top" mt={-2} fontSize="30px" color="blackAlpha.600">⦦</Text>
                  <ButtonGroup size="xs" isAttached>
                    <IconButton
                      colorScheme='red'
                      aria-label='Reset to default pattern'
                      icon={<DeleteIcon />}
                    />
                    <IconButton
                      colorScheme='blue'
                      aria-label='Modify...'
                      icon={<EditIcon />}
                    />
                  </ButtonGroup>
                  <Text textTransform="uppercase" fontSize="xs" color="blackAlpha.500">rhythm</Text>
                </HStack>
              </Td>
              <Td {...bottomRow} colSpan={3}>
                <HStack>
                  <IconButton
                    size="xs"
                    mr={4}
                    isRound
                    colorScheme="gray"
                    aria-label='Redo'
                    icon={<ChevronRightIcon />}
                  />
                  <TimelineRow
                    length={pulses.length}
                    lengthResolution={pulseResolution}
                    subdivisions={4}
                    startAt={0}
                    lineHeight={LINE_HEIGHT}
                    quarterWidth={QUARTER_WIDTH}
                    timeSignature={{
                      noteValue: 4,
                      perMeasure: 4,
                    }}
                    rulerOpacity={0.5}
                    rulerText={false}
                  >
                    {
                      pulses.map((energy, index) =>
                        (energy > EPS) && (
                          <Pulse
                            width={`9px`}
                            height={`${LINE_HEIGHT}px`}
                            energy={energy}
                            color="black"
                            style={{ position: "absolute", left: getPosition(index), marginLeft: `-3px`, zIndex: 1 }}
                          />
                        )
                      )
                    }
                  </TimelineRow>
                </HStack>
              </Td>
            </Tr >
          </>
        )
      })

      }

      <Tr>
        <Td colSpan={4} px={2} py={4} border="none">
          <HStack>
            <Button colorScheme="blue">Add new instrument</Button>
            <Spacer />
            <Button onClick={onClose}>Close</Button>
          </HStack>
        </Td>
      </Tr>
    </Table >
  )

}

export default InstrumentsEditor