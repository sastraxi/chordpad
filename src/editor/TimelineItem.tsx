import { Box } from "@chakra-ui/react"
import { useDrag } from 'react-dnd'
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

  const [{ opacity }, drag, preview] = useDrag(() => ({
    type: 'box',
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  }))

  const width = `calc(${BEAT_WIDTH_PX}px * ${durationBeats})`
  const viewBox = `0 0 ${BEAT_WIDTH_PX * durationBeats} 100`

  // TODO: dragging
  // each element will also be a drop target
  // when we drop onto an element, we either show a left or a right highlight
  // depending on where the drop x is (lte 50% or greater).
  // we need to make sure the right-side of 0 looks like the left-side of 1, for example

  // TODO: resizing
  // we also need a separate drag system for resizing with live preview depending on the (x, y)
  // position of dragging the drag handle. The entirety of the section editor will be the drop
  // target, and we should spill this past the current height of the container so that
  // elements can be extended arbitrarily. Update the durationBeats value
  // iteractively so the whole page reflows properly
  // (drag handle is on the left; extra "--" at end allows this. First handle cannot be dragged)

  // TODO: resizing: ripple edit mode
  // when holding CTRL down and resizing, we'll be restricting the potential durationBeats that
  // we can explore, and also "fixing up" the neighbouring items so that only the chord in question
  // and its immediate neighbour to the left are affected. When dragging the last handle (of the
  // "--" item always present at the end of the section), we'll be unrestricted in how long we
  // can extend the previous chord.

  // TODO: rendering
  // we need to be able to render multiple boxes to split over multiple lines
  // which means that we return <>...</> and that we need to know where the breakpoints
  // are. We will need to calculate that in the SectionEditor based on current size,
  // convert to beats, and send in as a prop to all the timeline items

  // TODO: selecting
  // checkbox in top-right of item, shows on hover (or if selection is not empty)
  // allow shift-clicking to select / deselect range

  // TODO: contextual edit menu
  // when items are selected, show a menu at bottom of screen to do the following:
  // - show # items selected
  // - deselect items
  // - select all in section / song
  // - set duration in beats (default: # of beats per measure in time signature)

  return (
    <Box w={width} h="100px" position="relative" display="inline-block" ref={preview}>
      <Box position="absolute" left="10px" top="5px" ref={drag} >
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
                    <rect x={position * BEAT_WIDTH_PX} y="0" width="3" height="100" />
                    {isStartOfBar &&
                      <text x={position * BEAT_WIDTH_PX + 12} y="86" fontSize="11px">
                        {globalPosition / timeSignature.perMeasure}
                      </text>}
                  </g>
                )

              } else if (isStartOfBar) {
                // start of a bar
                return (
                  <g key={`bar-${n}`}>
                    <path
                      d={`M${position * BEAT_WIDTH_PX} 100 l0 -100`}
                      stroke="black"
                      strokeWidth="2"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />
                    <text x={position * BEAT_WIDTH_PX + 12} y="86" fontSize="11px">
                      {globalPosition / timeSignature.perMeasure}
                    </text>
                  </g>
                )

              } else if (position % 1 === 0) {
                // big ticks
                return (
                  <rect key={`tick-${n}`} x={position * BEAT_WIDTH_PX} y="92" width="1.5" height="8" opacity="0.7" />
                )

              } else {
                // small ticks
                return (
                  <rect key={`tick-${n}`} x={position * BEAT_WIDTH_PX} y="97" width="1.5" height="3" opacity="0.3" />
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
