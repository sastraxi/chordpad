import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, RepeatClockIcon } from "@chakra-ui/icons"
import { Box, Button, HStack, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Slider, SliderFilledTrack, SliderThumb, SliderTrack, VStack, useDimensions, useDisclosure } from "@chakra-ui/react"

import { useMemo, useRef } from "react"
import { SongPlaybackSection, useSongPlaybackInfo } from "../state/song"
import { sum } from "../util"
import { BOTTOM_BAR_HEIGHT } from "./constants"
import InstrumentsEditor from "../editor/InstrumentsEditor"
import { useIsPlaying, usePlayerState } from "../state/player"

const SECTION_COLOURS: Array<string> = [
  "yellow",
  "orange",
]

const MiniMap = ({
  width,
  height,
  totalTimeMs,
  positions,
  sections,
}: {
  width: number
  height: number
  totalTimeMs: number
  positions: Array<number>
  sections: Array<SongPlaybackSection>
}) => {
  const scaleFactor = width / totalTimeMs
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ userSelect: "none" }}
    >
      {
        sections.map((section, i) => {
          const x = positions[i] * scaleFactor
          return (
            <g key={`section-${i}`}>
              <rect
                x={x}
                y="0"
                width={section.totalLengthMs}
                height={height}
                fill={SECTION_COLOURS[i % SECTION_COLOURS.length]}
              />
              <text x={x + 2} y="12" fontSize="11px">
                {section.name}
              </text>
            </g>
          )
        })
      }
    </svg>
  )
}

const PlaybackBar = () => {
  const playbackInfo = useSongPlaybackInfo()
  const { play, pause, reset, cursorMs } = usePlayerState()
  const isPlaying = useIsPlaying()
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


  const { isOpen, onOpen, onClose } = useDisclosure()
  const elementRef = useRef<HTMLDivElement | null>(null)
  const dimensions = useDimensions(elementRef, true)
  return (
    <HStack bg="blue.800" h={BOTTOM_BAR_HEIGHT} boxSizing="border-box" px={6} boxShadow="0px 0px 12px rgba(0, 0, 0, 0.2)">
      <IconButton
        isDisabled
        colorScheme='blue'
        aria-label='Undo'
        icon={<ChevronLeftIcon />}
      />
      <IconButton
        isDisabled
        colorScheme='blue'
        aria-label='Redo'
        icon={<ChevronRightIcon />}
      />
      <Box w={4} />
      <IconButton
        colorScheme='blue'
        aria-label='Play / Pause'
        onClick={isPlaying ? pause : play}
        icon={<ArrowRightIcon />}
      />
      <IconButton
        colorScheme='blue'
        aria-label='Rewind to start'
        onClick={reset}
        icon={<RepeatClockIcon />}
      />
      <VStack w="full" mx={4}>
        <Slider
          focusThumbOnChange={false}
          aria-label='slider-ex-4'
          min={0}
          max={totalTimeMs}
          value={cursorMs}
          step={1}
        >
          <SliderTrack bg='red.100'>
            <SliderFilledTrack bg='tomato' />
          </SliderTrack>
          <SliderThumb boxSize={6} boxShadow="0px 0px 10px rgba(0, 0, 0, 0.4)">
            <Box />
          </SliderThumb>
        </Slider>
        <Box w="full" h={4} ref={elementRef}>
          {dimensions && <MiniMap
            width={dimensions.contentBox.width}
            height={dimensions.contentBox.height}
            positions={positions}
            totalTimeMs={totalTimeMs}
            sections={playbackInfo.sections}
          />}
        </Box>
      </VStack>
      <Button onClick={onOpen}>...</Button>

      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size="4xl" preserveScrollBarGap>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader pt={6} mb={-4}>Instruments</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflow="hidden" mt={-8}>
            <InstrumentsEditor onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </HStack >
  )

}

export default PlaybackBar
