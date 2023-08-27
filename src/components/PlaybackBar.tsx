import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, RepeatClockIcon } from "@chakra-ui/icons"
import { Box, Button, HStack, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Slider, SliderFilledTrack, SliderThumb, SliderTrack, VStack, useDimensions, useDisclosure } from "@chakra-ui/react"

import { useRef } from "react"
import InstrumentsEditor from "../editor/InstrumentsEditor"
import { useIsPlaying, usePlayerState } from "../state/player"
import { BOTTOM_BAR_HEIGHT } from "./constants"
import { SongMetrics, SongSection } from "../state/song/types"
import { useSongSections } from "../state/song"

const SECTION_COLOURS: Array<string> = [
  "yellow",
  "orange",
]

const MiniMap = ({
  width,
  height,
  metrics,
  sections,
}: {
  width: number
  height: number
  metrics: SongMetrics
  sections: Array<SongSection>
}) => {
  const scaleFactor = width / metrics.durationMs
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ userSelect: "none" }}
    >
      {
        metrics.sections.map(({ posMs, durationMs }, i) => {
          const x = posMs * scaleFactor
          return (
            <g key={`section-${i}`}>
              <rect
                x={x}
                y="0"
                width={durationMs}
                height={height}
                fill={SECTION_COLOURS[i % SECTION_COLOURS.length]}
              />
              <text x={x + 2} y="12" fontSize="11px">
                {sections[i].title ?? `Section ${i + 1}`}
              </text>
            </g>
          )
        })
      }
    </svg>
  )
}

const PlaybackBar = () => {
  const { metrics, sections } = useSongSections()
  const { play, pause, reset, cursorMs } = usePlayerState()
  const isPlaying = useIsPlaying()

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
          max={metrics.durationMs}
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
            metrics={metrics}
            sections={sections}
          />}
        </Box>
      </VStack>
      <Button onClick={onOpen}>...</Button>
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size="4xl" preserveScrollBarGap>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader pt={6} mb={-4}>Instruments</ModalHeader>
          <ModalBody overflow="hidden" mt={-8}>
            <InstrumentsEditor onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </HStack >
  )

}

export default PlaybackBar
