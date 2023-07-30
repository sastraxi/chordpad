import { Box, Heading, Divider } from '@chakra-ui/react'

import './App.css'
import Editor from './editor/Editor'
import TapBpmInput from './inputs/TapBpmInput'
import { useState } from 'react'
import KeyInput from './inputs/KeyInput'

const App = () => {
  const [bpm, setBpm] = useState<number>(120)
  const [key, setKey] = useState<string>("C major")
  return (
    <Box w="100%" display="block">
      <Heading>Chordpad</Heading>
      <Editor />
      <Divider />
      <Box>
        <TapBpmInput value={bpm} onChange={setBpm} />
        <KeyInput value={key} onChange={setKey} />
      </Box>
    </Box>
  )
}

export default App
