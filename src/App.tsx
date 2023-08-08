import { Box, Button, HStack } from '@chakra-ui/react'

import './App.css'
import { useSongSections } from './state/song'
import SectionEditor from './editor/SectionEditor'
import SongMetaEditor from './editor/SongMetaEditor'


import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const App = () => {
  const { sections, addSection } = useSongSections()

  return (
    <Box w="100%" display="block">
      <SongMetaEditor />
      <DndProvider backend={HTML5Backend}>
        {sections.map((_, index) => <SectionEditor key={index} index={index} />)}
      </DndProvider>
      <HStack py={4}>
        <Button size="sm" colorScheme="gray" onClick={addSection}>
          Add section
        </Button>
      </HStack>
    </Box>
  )
}

export default App
