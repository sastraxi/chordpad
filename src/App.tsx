import { Box, Heading } from '@chakra-ui/react'

import './App.css'
import { useSongSections } from './state/song'
import SectionEditor from './editor/SectionEditor'

const App = () => {
  const sections = useSongSections()

  return (
    <Box w="100%" display="block">
      {sections.map((_, index) => <SectionEditor key={index} index={index} />)}
    </Box>
  )
}

export default App
