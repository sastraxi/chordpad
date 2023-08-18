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

const App = () => {
  const { sections, addSection } = useSongSections()

  // TODO: scrollIntoView for new sections

  return (
    <Box height="100vh" width="100%">
      <Flex direction="row" justifyContent="space-between">
        <Flex id="song-view" direction="column" alignItems="flex-start" display="block" p={6}>
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
        {/* <ToolWindows /> */}
      </Flex>
      <Box position="fixed" bottom={0} left={0} right={0}>
        <PlaybackBar />
      </Box>
    </Box>
  )
}

export default App
