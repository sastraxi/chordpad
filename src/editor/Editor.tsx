import { Box } from '@chakra-ui/react'
import ChordInput from '../inputs/ChordInput'
import { useState } from 'react'

const Editor = () => {
  const [currentChord, setCurrentChord] = useState<string | null>(null)

  /*
    spacebar: always "accept best suggestion"
    
  */

  return (
    <Box w={80}>
      <ChordInput value={currentChord} onChange={setCurrentChord} />
      <ChordInput value="Bb7" onChange={setCurrentChord} />
    </Box>
  )
}

export default Editor
