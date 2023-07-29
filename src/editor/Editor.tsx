import { Box } from '@chakra-ui/react'
import ChordInput from './ChordInput'

const Editor = () => {
  return (
    <Box w={80}>
      <ChordInput chord={null} onSelect={console.log} />
    </Box>
  )
}

export default Editor
