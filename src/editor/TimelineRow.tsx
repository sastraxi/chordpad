import { useMemo } from "react"
import { Box } from "@chakra-ui/react"

import { range } from "../util"
import { PlaybackState, calcCursorMs } from "../state/player"
import { EIGHTH_NOTE, QUARTER_NOTE, SIXTEENTH_NOTE, measuresToDuration, timeDurationMs } from "../util/conversions"

import './TimelineRow.css'
import { BaseTimelineItem, SongContext } from "../state/song/types"
import { useGlobalScale } from "../state/global-scale"

const SvgPlaybackCursor = ({
  playback,
  context,
  measure,
  rowLength,
  lineHeight,
}: {
  playback: PlaybackState
  context: SongContext
  measure: BaseTimelineItem
  rowLength: number
  lineHeight: number
}) => {
  const rowLengthMs = timeDurationMs(rowLength, context.bpm, context.timeSignature)
  const style = useMemo(
    () => {
      const cursorMs = calcCursorMs(playback)
      const delayMs = measure.posMs - cursorMs
      return {
        "--timeline-playback-start": "0",
        "--timeline-playback-end": "100%",
        "--timeline-playback-duration": `${rowLengthMs}ms`,
        "--timeline-playback-display": "initial",
        "--timeline-playback-delay": `${delayMs}ms`,
      } as React.CSSProperties
    },
    [rowLengthMs, measure.posMs, playback.startedAtMs, playback.cursorStartMs])

  return (
    <g fill="red" style={style}>
      <rect
        className="play-cursor"
        x={0}
        y={0}
        width={2.5}
        opacity="0.6"
        height={lineHeight}
      />
    </g>
  )
}

const TICK_GRID = SIXTEENTH_NOTE

const TimelineRow = ({
  measure,
  context,
  playback,
  lineHeight,
  children,
  rulerOpacity = 1.0,
  rulerText = true,
}: {
  measure: BaseTimelineItem,
  context?: SongContext,
  playback?: PlaybackState
  lineHeight?: number
  children?: React.ReactNode
  rulerOpacity?: number
  rulerText?: boolean
}) => {
  const { baseWidth, lineHeight: globalLineHeight } = useGlobalScale()
  const height = lineHeight ?? globalLineHeight
  const rowWidth = baseWidth * measure.duration
  return (
    <Box position="relative" width={`${rowWidth}px`} height={`${height}px`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`-1 0 ${rowWidth + 1} ${height}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          userSelect: "none",
        }}
      >
        {playback && context && <SvgPlaybackCursor
          playback={playback}
          context={context}
          measure={measure}
          rowLength={measure.duration}
          lineHeight={height}
        />}
        <g fill="#5f5f5f" opacity={rulerOpacity}>
          {
            range(measure.duration / TICK_GRID).map((n) => {
              const position = n * TICK_GRID
              const globalPosition = measure.pos + position
              const measureDuration = context ? measuresToDuration(1, context.timeSignature) : undefined
              const isStartOfBar = context ? globalPosition % measureDuration! === 0 : false
              if (isStartOfBar) {
                // start of a bar
                return (
                  <g key={`bar-${n}`}>
                    <path
                      d={`M${position * baseWidth} 100 l0 -100`}
                      stroke="black"
                      strokeWidth="2"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />
                    {rulerText && context &&
                      <text x={position * baseWidth + 12} y={height - 14} fontSize="11px">
                        {globalPosition / measureDuration!}
                      </text>
                    }
                  </g>
                )

              } else if (position % QUARTER_NOTE === 0) {
                // big ticks
                return (
                  <rect
                    key={`tick-${n}`}
                    x={position * baseWidth}
                    y={height - 8}
                    width="1.5"
                    height="8"
                    opacity="0.7"
                  />
                )

              } else {
                // small ticks
                return (
                  <rect
                    key={`tick-${n}`}
                    x={position * baseWidth}
                    y={height - 3}
                    width="1.5"
                    height="3"
                    opacity="0.3"
                  />
                )
              }
            })
          }
        </g>
      </svg>
      <Box transform="translateX(0px)">
        {children}
      </Box>
    </Box>
  )
}

export default TimelineRow
