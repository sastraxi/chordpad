import { Box, BoxProps } from "@chakra-ui/react"
import { TimeSignature } from "../types"
import { range } from "../util"
import { useRef, useState } from "react"
import { useSelection } from "../state/selection"
import { useGlobalScale } from "../state/global-scale"
import { BaseTimelineItem } from "../state/song"

import './TimelineItem.css'

const constrain = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val))

type Coordinate = {
  x: number
  y: number
}

type PropTypes = {
  item: BaseTimelineItem
  updateItem?: (updates: Partial<BaseTimelineItem>) => void
  timeSignature: TimeSignature
  children: React.ReactNode
  additionalBoxProps?: BoxProps
}

const TimelineItem = ({
  item,
  updateItem,
  timeSignature,
  children,
  additionalBoxProps = {},
}: PropTypes) => {
  const { quarterWidth, measuresPerLine, lineHeight } = useGlobalScale()

  const [dragAnchor, setDragAnchor] = useState<Coordinate | undefined>(undefined)
  const [scratchDuration, setScratchDuration] = useState(item.durationBeats)

  const width = quarterWidth * scratchDuration
  const beatsPerMeasure = (timeSignature.noteValue / 4) * timeSignature.perMeasure
  const beatsPerLine = beatsPerMeasure * measuresPerLine

  const minDelta = 1 - item.durationBeats
  const maxDelta = Number.MAX_SAFE_INTEGER

  ////////////////////////////////////////////////////////

  const container = useRef<HTMLDivElement | null>(null)

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
    const dx = Math.floor(0.5 + offset.x / quarterWidth)
    const delta = constrain(dy * beatsPerLine + dx, minDelta, maxDelta)

    const durationBeats = item.durationBeats + delta
    setScratchDuration(durationBeats)

    return false
  }

  const onDragEnd: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()

    const offset = getDragOffset({ x: e.clientX, y: e.clientY })
    const dy = Math.floor(offset.y / lineHeight)
    const dx = Math.floor(0.5 + offset.x / quarterWidth)
    const delta = constrain(dy * beatsPerLine + dx, minDelta, maxDelta)

    const durationBeats = item.durationBeats + delta
    setScratchDuration(durationBeats)
    updateItem?.({ durationBeats })
    setDragAnchor(undefined)

    return false
  }

  ////////////////////////////////////////////////////////

  return (
    <Box
      className="timelineItem"
      ref={container}
      w={`${width}px`}
      h={`${lineHeight}px`}
      position="relative"
      display="inline-block"
      cursor="pointer"
      {...additionalBoxProps}
    >
      {updateItem &&
        <>
          <Box
            position="absolute"
            right="-6px"
            top="0"
            height="100%"
            width="10px"
            cursor="col-resize"
            backgroundColor="transparent"
            opacity="0.3"
            zIndex="99"
            draggable="true"
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrag={onDrag}
          />
          <Box
            zIndex={99}
            className="dragHandle"
            position="absolute"
            right="-3px"
            top="0"
            height="100%"
            width="2px"
            backgroundColor="blue.400"
            boxShadow="0px 0px 3px rgba(15, 25, 150, 0.6)"
          />
        </>
      }

      <Box position="absolute" left="10px" top="5px">
        {children}
      </Box>

      {/* start-of-item "handle" */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} 100`} style={{ userSelect: "none" }}>
        <g fill="#5f5f5f">
          <rect x="0" y="0" width="3" height="100" />
        </g>
      </svg>
    </Box >
  )

}

export default TimelineItem
