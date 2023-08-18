import { Box, BoxProps } from "@chakra-ui/react"
import { TimeSignature } from "../types"
import { useCallback, useRef, useState } from "react"
import { useGlobalScale } from "../state/global-scale"
import { BaseTimelineItem } from "../state/song"

import './TimelineItem.css'

type Coordinate = {
  x: number
  y: number
}

/**
 * Render only part of this timeline item?
 */
export type ItemView = {
  start?: number
  end?: number
}

type PropTypes = {
  item: BaseTimelineItem
  updateItem?: (updates: Partial<BaseTimelineItem>) => void
  timeSignature: TimeSignature
  children: React.ReactNode
  additionalBoxProps?: BoxProps

  /**
   * The position of this item in the section,
   * disregarding the view.
   */
  position: number
  view?: ItemView
}

const TimelineItem = ({
  item,
  position,
  view = {},
  timeSignature,
  updateItem,
  children,
  additionalBoxProps = {},
}: PropTypes) => {
  const { quarterWidth, measuresPerLine, lineHeight } = useGlobalScale()

  const [dragAnchor, setDragAnchor] = useState<Coordinate | undefined>(undefined)

  const end = view.end ?? item.durationBeats
  const start = view.start ?? 0
  const viewedDuration = end - start
  const hasStart = start === 0
  const hasEnd = end === item.durationBeats

  const width = quarterWidth * viewedDuration
  const beatsPerMeasure = (timeSignature.noteValue / 4) * timeSignature.perMeasure
  const beatsPerLine = beatsPerMeasure * measuresPerLine

  const minDelta = 1 - item.durationBeats

  const offsetToDelta = useCallback((offset: Coordinate): number => {
    const dy = Math.floor(offset.y / lineHeight)
    const dx = Math.floor(0.5 + offset.x / quarterWidth)
    return Math.max(dy * beatsPerLine + dx, minDelta)
  }, [lineHeight, quarterWidth, beatsPerLine, minDelta])

  const viewStartPosition = position + start
  const deltaToOffset = useCallback((delta: number, fromPosition: number): Coordinate => {
    let dx = delta + (fromPosition - viewStartPosition)  // from start of this view
    let dy = 0
    while (dx < 0) { dy -= 1; dx += beatsPerLine }
    while (dx > beatsPerLine) { dy += 1; dx -= beatsPerLine }
    return {
      x: dx * quarterWidth - 0.5,
      y: dy * lineHeight,
    }
  }, [lineHeight, quarterWidth, beatsPerLine, viewStartPosition])

  // the preview handle is at the end of the element
  const [previewLengthDelta, setPreviewLengthDelta] = useState(0)
  const previewHandleOffset = deltaToOffset(previewLengthDelta, position + item.durationBeats)

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

  const getDragOffset = useCallback((current: Coordinate) => ({
    x: current.x - (dragAnchor?.x ?? 0),
    y: current.y - (dragAnchor?.y ?? 0),
  }), [dragAnchor])

  const onDrag: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()

    const offset = getDragOffset({ x: e.clientX, y: e.clientY })
    setPreviewLengthDelta(offsetToDelta(offset))

    return false
  }

  const onDragEnd: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()

    const offset = getDragOffset({ x: e.clientX, y: e.clientY })
    const delta = offsetToDelta(offset)
    const durationBeats = item.durationBeats + delta

    setPreviewLengthDelta(0)
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
      overflow="visible"
      {...additionalBoxProps}
    >
      {updateItem && hasEnd &&
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
      }

      {previewLengthDelta !== 0 &&
        <Box
          zIndex={99}
          className="dragHandle"
          position="absolute"
          left={`${previewHandleOffset.x}px`}
          top={`${previewHandleOffset.y}px`}
          height="100%"
          width="2px"
          backgroundColor="blue.400"
          boxShadow="0px 0px 3px rgba(15, 25, 150, 0.6)"
        />
      }

      <Box position="absolute" left="10px" top="5px">
        {children}
      </Box>

      {/* start-of-item "handle" */}
      {hasStart &&
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} 100`} style={{ userSelect: "none" }}>
          <g fill="#5f5f5f">
            <rect x="0" y="0" width="3" height="100" />
          </g>
        </svg>}
    </Box >
  )

}

export default TimelineItem
