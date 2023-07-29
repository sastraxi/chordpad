import { Input, Box, Heading } from '@chakra-ui/react'

import './App.css'
import Editor from './editor/Editor'

const App = () => {
  return (
    <Box w="100%" display="block">
      <Heading>Chordpad</Heading>
      <Editor />
    </Box>
  )
}

export default App
