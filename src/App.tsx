import { Box, Button, Flex, HStack } from '@chakra-ui/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { useSongSections } from './state/song'
import SectionEditor from './editor/SectionEditor'
import SongMetaEditor from './editor/SongMetaEditor'

import './App.css'

const App = () => {
  const { sections, addSection } = useSongSections()

  return (
    <Flex direction="column" alignItems="flex-start" display="block">
      <SongMetaEditor />
      <DndProvider backend={HTML5Backend}>
        {sections.map((_, index) => <SectionEditor key={index} index={index} />)}
      </DndProvider>
      <HStack py={4}>
        <Button size="sm" colorScheme="gray" onClick={addSection}>
          Add section
        </Button>
      </HStack>
    </Flex>
  )
}

export default App
