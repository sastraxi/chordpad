import { Box, Button, Divider, Flex, HStack, VStack } from '@chakra-ui/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { useSongSections } from './state/song'
import SectionEditor from './editor/SectionEditor'
import SongMetaEditor from './editor/SongMetaEditor'

import './App.css'
import PlaybackBar from './components/PlaybackBar'
import { BOTTOM_BAR_HEIGHT } from './components/constants'
import ToolWindows from './tool-windows/ToolWindows'
import TimelineRow from './editor/TimelineRow'
import Pulse from './images/Pulse'

const QUARTER_WIDTH = 40
const LINE_HEIGHT = 50
const PULSE_SIZE = 10

const App = () => {
  const { sections, addSection } = useSongSections()

  // TODO: scrollIntoView for new sections
  // TODO: refactor this into a <RhythmViewer /> component

  const EPS = 0.0001
  const PULSES = [
    1.0, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0,
    0.6, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0,
    0.6, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0,
    0.6, 0, 0, 0, 0, 0, 0.3, 0, 0.3, 0, 0.3, 0,
    1.0, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0,
    0.6, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0,
    0.6, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0,
    0.6, 0, 0, 0, 0, 0, 0.3, 0, 0.3, 0, 0.3, 0,
  ]
  const PULSE_RESOLUTION = 24

  const getPosition = (index: number) => `${index * 4 * QUARTER_WIDTH / PULSE_RESOLUTION}px`

  return (
    <Box height="100vh" width="100%">
      <Flex direction="row" justifyContent="space-between">
        <Flex id="song-view" direction="column" alignItems="flex-start" display="block" p={6}>

          {/* <TimelineRow
            length={24 * 4}
            lengthResolution={24}
            subdivisions={4}
            startAt={0}
            lineHeight={LINE_HEIGHT}
            quarterWidth={QUARTER_WIDTH}
            timeSignature={{
              noteValue: 4,
              perMeasure: 4,
            }}
          >
            {
              PULSES.map((energy, index) =>
                (energy > EPS) && (
                  <Pulse
                    width={`${PULSE_SIZE}px`}
                    height={`${LINE_HEIGHT}px`}
                    energy={energy}
                    color="black"
                    style={{ position: "absolute", left: getPosition(index), marginLeft: `-${0.5 * PULSE_SIZE}px`, zIndex: 1 }}
                  />
                )
              )
            }
          </TimelineRow> */}

          <SongMetaEditor />
          <DndProvider backend={HTML5Backend}>
            {sections.map((_, index) => <SectionEditor key={index} index={index} />)}
          </DndProvider>
          <HStack pt={4}>
            <Button size="sm" borderWidth={2} colorScheme="gray" onClick={addSection}>
              Add section
            </Button>
          </HStack>
          <Box height={BOTTOM_BAR_HEIGHT} />
        </Flex>
        <ToolWindows />
      </Flex>
      <Box position="fixed" bottom={0} left={0} right={0}>
        <PlaybackBar />
      </Box>
    </Box>
  )
}

export default App
