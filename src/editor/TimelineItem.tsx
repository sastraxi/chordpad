import { Box } from "@chakra-ui/react"
import { TimeSignature } from "../types"
import { range } from "../util"
import { useRef } from "react"
import { useSelection } from "../state/selection"
import { useGlobalScale } from "../state/global-scale"

type PropTypes = {
  sectionIndex: number
  positionBeats: number
  durationBeats: number
  timeSignature: TimeSignature
  children: React.ReactNode
  subdivisions?: number
}

const TimelineItem = ({
  sectionIndex,
  positionBeats,
  durationBeats,
  timeSignature,
  children,
  subdivisions = 4,
}: PropTypes) => {

  const { beatWidth, measuresPerLine, lineHeight } = useGlobalScale()
  const selection = useSelection()

  const width = beatWidth * durationBeats
  const beatsPerMeasure = (timeSignature.noteValue / 4) * timeSignature.perMeasure
  const lineWidth = beatWidth * beatsPerMeasure * measuresPerLine

  const dragHandle = useRef<HTMLDivElement | null>(null)

  const viewBox = `0 0 ${width} 100`

  return (
    <Box w={width} h="100px" position="relative" display="inline-block">
      <Box
        ref={dragHandle}
        position="absolute"
        left="-5px"
        top="0"
        height="100%"
        width="10px"
        cursor="col-resize"
        onDragStart={(e) => { e.stopPropagation(); console.log(e); return false; }}
      />
      <Box position="absolute" left="10px" top="5px">
        {children}
      </Box>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}>
        <g fill="#5f5f5f">
          {
            range(durationBeats * subdivisions).map((n) => {
              const position = n / subdivisions
              const globalPosition = positionBeats + position
              const isStartOfBar = globalPosition % timeSignature.perMeasure === 0

              if (n === 0) {
                // start of this item
                return (
                  <g key="item-start">
                    <rect x={position * beatWidth} y="0" width="3" height="100" />
                    {isStartOfBar &&
                      <text x={position * beatWidth + 12} y="86" fontSize="11px">
                        {globalPosition / timeSignature.perMeasure}
                      </text>}
                  </g>
                )

              } else if (isStartOfBar) {
                // start of a bar
                return (
                  <g key={`bar-${n}`}>
                    <path
                      d={`M${position * beatWidth} 100 l0 -100`}
                      stroke="black"
                      strokeWidth="2"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />
                    <text x={position * beatWidth + 12} y="86" fontSize="11px">
                      {globalPosition / timeSignature.perMeasure}
                    </text>
                  </g>
                )

              } else if (position % 1 === 0) {
                // big ticks
                return (
                  <rect key={`tick-${n}`} x={position * beatWidth} y="92" width="1.5" height="8" opacity="0.7" />
                )

              } else {
                // small ticks
                return (
                  <rect key={`tick-${n}`} x={position * beatWidth} y="97" width="1.5" height="3" opacity="0.3" />
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
