import { Box } from "@chakra-ui/react"
import { TimeSignature } from "../inputs/TimeSignatureInput"

type PropTypes = {
  positionBeats: number
  durationBeats: number
  timeSignature: TimeSignature
  children: React.ReactNode
}

const BEAT_WIDTH_PX = 60

const range = n => Array.from({ length: n }, (value, key) => key)

const TimelineChord = ({
  positionBeats,
  durationBeats,
  timeSignature,
  children,
}: PropTypes) => {

  const width = `calc(${BEAT_WIDTH_PX}px * ${durationBeats})`
  const viewBox = `0 0 ${BEAT_WIDTH_PX * durationBeats} 100`

  return (
    <Box w={width} h="100px" position="relative">
      <Box position="absolute" left="10px" top="5px">
        {children}
      </Box>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}>
        <g fill="#5f5f5f">
          {
            range(durationBeats).map((n) => {
              const globalPosition = positionBeats + n
              if (globalPosition % timeSignature.perMeasure === 0) {
                return (
                  <>
                    <rect x={n * BEAT_WIDTH_PX} y="0" width="2" height="100" />
                    <text x={n * BEAT_WIDTH_PX + 10} y="90">
                      {globalPosition / timeSignature.perMeasure}
                    </text>
                  </>
                )
              } else {
                return (
                  <rect x={n * BEAT_WIDTH_PX} y="95" width="2" height="5" />
                )
              }
            })
          }
        </g>
      </svg>
    </Box >
  )

}

export default TimelineChord
