import { Box } from "@chakra-ui/react"
import { ItemIndex, TimeSignature } from "../types"
import { range } from "../util"
import { useRef, useState } from "react"
import { useSelection } from "../state/selection"
import { useGlobalScale } from "../state/global-scale"
import { useSectionItem } from "../state/song"

const constrain = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val))

type Coordinate = {
  x: number
  y: number
}

type PropTypes = {
  coordinate: ItemIndex
  positionBeats: number
  timeSignature: TimeSignature
  children: React.ReactNode
  subdivisions?: number
}

const TimelineItem = ({
  coordinate,
  positionBeats,
  timeSignature,
  children,
  subdivisions = 4,
}: PropTypes) => {

  const { beatWidth, measuresPerLine, lineHeight } = useGlobalScale()
  const { item, updateItem } = useSectionItem(coordinate)

  const [dragAnchor, setDragAnchor] = useState<Coordinate | undefined>(undefined)
  const [scratchDuration, setScratchDuration] = useState(item.durationBeats)

  const width = beatWidth * scratchDuration
  const beatsPerMeasure = (timeSignature.noteValue / 4) * timeSignature.perMeasure
  const beatsPerLine = beatsPerMeasure * measuresPerLine

  const minDelta = 1 - item.durationBeats
  const maxDelta = Number.MAX_SAFE_INTEGER

  ////////////////////////////////////////////////////////

  const container = useRef<HTMLDivElement | null>(null)

  const ignore: React.MouseEventHandler<HTMLDivElement> = (e) => e.preventDefault()

  const onDragStart: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    setDragAnchor({
      x: container.current?.getBoundingClientRect().right ?? 0,
      y: container.current?.getBoundingClientRect().top ?? 0,
    })
    return false
  }

  const getDragOffset = (current: Coordinate) => ({
    x: current.x - (dragAnchor?.x ?? 0),
    y: current.y - (dragAnchor?.y ?? 0),
  })

  const onDrag: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()

    const offset = getDragOffset({ x: e.clientX, y: e.clientY })
    const dy = Math.floor(offset.y / lineHeight)
    const dx = Math.floor(0.5 + offset.x / beatWidth)
    const delta = constrain(dy * beatsPerLine + dx, minDelta, maxDelta)

    const durationBeats = item.durationBeats + delta
    setScratchDuration(durationBeats)

    return false
  }

  const onDragEnd: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()

    const offset = getDragOffset({ x: e.clientX, y: e.clientY })
    const dy = Math.floor(offset.y / lineHeight)
    const dx = Math.floor(0.5 + offset.x / beatWidth)
    const delta = constrain(dy * beatsPerLine + dx, minDelta, maxDelta)

    const durationBeats = item.durationBeats + delta
    setScratchDuration(durationBeats)
    updateItem({ durationBeats })
    setDragAnchor(undefined)

    return false
  }

  ////////////////////////////////////////////////////////

  const viewBox = `0 0 ${width} 100`

  return (
    <Box ref={container} w={`${width}px`} h={`${lineHeight}px`} position="relative" display="inline-block">
      <Box
        position="absolute"
        right="-6px"
        top="0"
        height="100%"
        width="10px"
        cursor="col-resize"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrag={onDrag}
        backgroundColor="transparent"
        opacity="0.3"
        zIndex="99"
        draggable="true"
      />
      <Box position="absolute" left="10px" top="5px">
        {children}
      </Box>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}>
        <g fill="#5f5f5f">
          {
            range(scratchDuration * subdivisions).map((n) => {
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
