import { Box, Button, Flex, HStack } from '@chakra-ui/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { useSongSections } from './state/song'
import SectionEditor from './editor/SectionEditor'
import SongMetaEditor from './editor/SongMetaEditor'

import './App.css'
import PlaybackBar from './components/PlaybackBar'
import { BOTTOM_BAR_HEIGHT } from './components/constants'

const App = () => {
  const { sections, addSection } = useSongSections()

  // TODO: scrollIntoView for new sections
  return (
    <Box height="100vh">
      <Flex direction="column" alignItems="flex-start" display="block" p={6}>
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
      <Box position="fixed" bottom={0} left={0} right={0}>
        <PlaybackBar />
      </Box>
    </Box>
  )
}

export default App
