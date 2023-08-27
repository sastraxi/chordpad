import { Box, BoxProps } from "@chakra-ui/react"
import { NoteLength } from "../types"
import { useCallback, useRef, useState } from "react"
import { useGlobalScale } from "../state/global-scale"

import './TimelineItem.css'
import { BaseTimelineItem, SongContext } from "../state/song/types"
import { measuresToDuration } from "../util/conversions"

const ROW_GAP_PX = 8

type Coordinate = {
  x: number
  y: number
}

/**
 * Render only part of this timeline item?
 */
export type ItemView = {
  start?: NoteLength
  end?: NoteLength
}

type PropTypes = {
  item: BaseTimelineItem,
  /**
   * The position of this item in the section, disregarding the view.
   */
  posWithinSection: NoteLength
  view?: ItemView
  context: SongContext
  updateItem?: (updates: Partial<BaseTimelineItem>) => void
  children: React.ReactNode
  additionalBoxProps?: BoxProps
}

const TimelineItem = ({
  item,
  posWithinSection,
  view = {},
  context,
  updateItem,
  children,
  additionalBoxProps = {},
}: PropTypes) => {
  const { baseWidth, measuresPerLine, lineHeight, snapDuration } = useGlobalScale()

  const [dragAnchor, setDragAnchor] = useState<Coordinate | undefined>(undefined)

  const end = view.end ?? item.duration
  const start = view.start ?? 0
  const viewedDuration = end - start
  const hasStart = start === 0
  const hasEnd = end === item.duration

  const width = baseWidth * viewedDuration
  const beatsPerLine = measuresToDuration(measuresPerLine, context.timeSignature)

  const minDelta = snapDuration - item.duration
  const snapWidth = snapDuration * baseWidth

  const offsetToDelta = useCallback((offset: Coordinate): number => {
    const dy = Math.floor(offset.y / (lineHeight + ROW_GAP_PX))
    const dx = Math.floor(0.5 + offset.x / snapWidth) * snapDuration
    return Math.max(dy * beatsPerLine + dx, minDelta)
  }, [lineHeight, baseWidth, beatsPerLine, minDelta])

  const viewStartPosition = posWithinSection + start
  const deltaToOffset = useCallback((delta: number, fromPosition: number): Coordinate => {
    let dx = delta + (fromPosition - viewStartPosition)  // from start of this view
    let dy = 0
    while (dx < 0) { dy -= 1; dx += beatsPerLine }
    while (dx > beatsPerLine) { dy += 1; dx -= beatsPerLine }
    return {
      x: dx * baseWidth - 0.5,
      y: dy * (lineHeight + ROW_GAP_PX),
    }
  }, [lineHeight, snapWidth, beatsPerLine, viewStartPosition])

  // FIXME: preview handle is snapping to deltas of +/- snapDuration, rather than lengths

  // the preview handle is at the end of the element
  const [previewLengthDelta, setPreviewLengthDelta] = useState(0)
  const previewHandleOffset = deltaToOffset(previewLengthDelta, posWithinSection + item.duration)

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
    const duration = item.duration + delta

    setPreviewLengthDelta(0)
    updateItem?.({ duration })
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
