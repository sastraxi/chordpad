import { HStack, IconButton, Text } from "@chakra-ui/react"
import { SearchIcon } from "@chakra-ui/icons"

import { BOTTOM_BAR_HEIGHT } from "./constants"

const PlaybackBar = () => {

  return (
    <HStack bg="blue.800" h={BOTTOM_BAR_HEIGHT} boxSizing="border-box" px={6} boxShadow="0px 0px 12px rgba(0, 0, 0, 0.2)">
      <IconButton
        colorScheme='blue'
        aria-label='Search database'
        icon={<SearchIcon />}
      />
    </HStack>
  )

}

export default PlaybackBar
