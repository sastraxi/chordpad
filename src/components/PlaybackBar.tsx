import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, RepeatClockIcon } from "@chakra-ui/icons"
import { Box, Colors, HStack, IconButton, Slider, SliderFilledTrack, SliderThumb, SliderTrack, VStack } from "@chakra-ui/react"

import { BOTTOM_BAR_HEIGHT } from "./constants"
import { useSongPlaybackInfo } from "../state/song"
import { sum } from "../util"
import { useMemo } from "react"

const SECTION_COLOURS: string = [
  "yellow",
  "orange",
]

const PlaybackBar = () => {
  const playbackInfo = useSongPlaybackInfo()
  const totalTimeMs = sum(playbackInfo.sections.map(s => s.totalLengthMs))

  const positions = useMemo(() => {
    return playbackInfo.sections.reduce<Array<number>>((positions, _item, index) => {
      if (index === 0) {
        positions.push(0)
      } else {
        positions.push(playbackInfo.sections[index - 1].totalLengthMs + positions[index - 1])
      }
      return positions
    }, [])
  }, [playbackInfo.sections])

  return (
    <HStack bg="blue.800" h={BOTTOM_BAR_HEIGHT} boxSizing="border-box" px={6} boxShadow="0px 0px 12px rgba(0, 0, 0, 0.2)">
      <IconButton
        colorScheme='blue'
        aria-label='Undo'
        icon={<ChevronLeftIcon />}
      />
      <IconButton
        colorScheme='blue'
        isDisabled
        aria-label='Redo'
        icon={<ChevronRightIcon />}
      />
      <Box w={4} />
      <IconButton
        colorScheme='blue'
        aria-label='Play / Pause'
        icon={<ArrowRightIcon />}
      />
      <IconButton
        colorScheme='blue'
        aria-label='Undo'
        icon={<RepeatClockIcon />}
      />
      <VStack w="full" marginLeft={4}>
        <Slider aria-label='slider-ex-4' min={0} max={50000} step={1}>
          <SliderTrack bg='red.100'>
            <SliderFilledTrack bg='tomato' />
          </SliderTrack>
          <SliderThumb boxSize={6} boxShadow="0px 0px 10px rgba(0, 0, 0, 0.4)">
            <Box />
          </SliderThumb>
        </Slider>
        <Box w="full" h={4}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${totalTimeMs} 100`} style={{ userSelect: "none" }}>
            {
              playbackInfo.sections.map((section, i) => (
                <g key={`section-${i}`}>
                  <rect
                    x={positions[i]}
                    y="0"
                    width={section.totalLengthMs}
                    height={100}
                    fill={SECTION_COLOURS[i % SECTION_COLOURS.length]}
                  />
                  <text x={positions[i]} y="30" fontSize="11px">
                    {section.title}
                  </text>
                </g>
              ))
            }
          </svg>
        </Box>
      </VStack>
    </HStack>
  )

}

export default PlaybackBar
