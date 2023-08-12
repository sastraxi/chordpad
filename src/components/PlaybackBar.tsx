import { HStack, Text } from "@chakra-ui/react"
import { BOTTOM_BAR_HEIGHT } from "./constants"

const PlaybackBar = () => {

  return (
    <HStack bg="blue.800" h={BOTTOM_BAR_HEIGHT} boxSizing="border-box" px={6}>
      <Text color="whiteAlpha.900">Playback bar</Text>
    </HStack>
  )

}

export default PlaybackBar
