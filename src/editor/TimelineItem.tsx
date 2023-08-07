import { Box } from "@chakra-ui/react"
import { TimeSignature } from "../types"
import { range } from "../util"

type PropTypes = {
  positionBeats: number
  durationBeats: number
  timeSignature: TimeSignature
  children: React.ReactNode
  subdivisions?: number
}

const BEAT_WIDTH_PX = 60

const TimelineItem = ({
  positionBeats,
  durationBeats,
  timeSignature,
  children,
  subdivisions = 4
}: PropTypes) => {

  const width = `calc(${BEAT_WIDTH_PX}px * ${durationBeats})`
  const viewBox = `0 0 ${BEAT_WIDTH_PX * durationBeats} 100`

  return (
    <Box w={width} h="100px" position="relative" display="inline-block">
      <Box position="absolute" left="10px" top="5px">
        {children}
      </Box>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}>
        <g fill="#5f5f5f">
          {
            range(durationBeats * subdivisions).map((n) => {
              const position = n / subdivisions
              const globalPosition = positionBeats + position
              if (globalPosition % timeSignature.perMeasure === 0) {
                return (
                  <>
                    <rect x={position * BEAT_WIDTH_PX} y="0" width="2" height="100" />
                    <text x={position * BEAT_WIDTH_PX + 12} y="86" fontSize="11px">
                      {globalPosition / timeSignature.perMeasure}
                    </text>
                  </>
                )
              } else if (position % 1 === 0) {
                return (
                  <rect x={position * BEAT_WIDTH_PX} y="92" width="1.5" height="8" opacity="0.7" />
                )
              } else {
                return (
                  <rect x={position * BEAT_WIDTH_PX} y="97" width="1.5" height="3" opacity="0.3" />
                )
              }
            })
          }
        </g>
      </svg>
    </Box >
  )

}

export default TimelineItem
