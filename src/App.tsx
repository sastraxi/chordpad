import { Box, Heading, Divider } from '@chakra-ui/react'

import './App.css'
import Editor from './editor/Editor'
import TapBpmInput from './inputs/TapBpmInput'
import { useState } from 'react'

import { HELLO_WORLD } from 'noteynotes'
import { WORLD } from 'noteynotes/hello'
import HelloWorldDefault from 'noteynotes/hello/world'

const App = () => {
  const [bpm, setBpm] = useState<number>(120)
  return (
    <Box w="100%" display="block">
      <Heading>Chordpad</Heading>
      <Editor />
      <Divider />
      <Box>
        <TapBpmInput value={bpm} onChange={setBpm} />
        {HELLO_WORLD} {WORLD} {HelloWorldDefault}
      </Box>
    </Box>
  )
}

export default App
