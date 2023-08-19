import { useMemo } from "react"
import { Box } from "@chakra-ui/react"

import { type TimeSignature } from "../types"
import { range } from "../util"
import { PlaybackState, calcCursorMs } from "../state/player"
import { MIN_TO_MS } from "../util/conversions"

import './TimelineRow.css'

const SvgPlaybackCursor = ({
  rowStartMs,
  playback,
  rowLengthBeats,
  bpm,
  lineHeight
}: {
  playback: PlaybackState
  rowStartMs: number
  rowLengthBeats: number
  bpm: number
  lineHeight: number
}) => {
  const rowLengthMs = (rowLengthBeats / bpm) * MIN_TO_MS
  const style = useMemo(
    () => {
      const cursorMs = calcCursorMs(playback)
      const delayMs = rowStartMs - cursorMs
      return {
        "--timeline-playback-start": "0",
        "--timeline-playback-end": "100%",
        "--timeline-playback-duration": `${rowLengthMs}ms`,
        "--timeline-playback-display": "initial",
        "--timeline-playback-delay": `${delayMs}ms`,
      } as React.CSSProperties
    },
    [rowLengthMs, rowStartMs, playback.startedAtMs, playback.cursorStartMs])

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

const TimelineRow = ({
  startAt,
  startAtMs,
  length,
  lengthResolution,
  subdivisions,
  children,
  timeSignature,
  lineHeight,
  quarterWidth,
  playback,
  bpm,
  rulerOpacity = 1.0,
  rulerText = true,
}: {
  startAt: number,  // measures
  length: number,
  lengthResolution: number,  // e.g. quarter = 4, eighth = 8, ... 
  subdivisions: number,
  timeSignature: TimeSignature
  lineHeight: number
  quarterWidth: number
  rulerOpacity?: number
  rulerText?: boolean
  startAtMs?: number,
  playback?: PlaybackState
  bpm?: number
  children?: React.ReactNode
}) => {
  const rowLength = length / lengthResolution
  const rowWidth = quarterWidth * 4 * rowLength
  return (
    <Box position="relative" width={`${rowWidth}px`} height={`${lineHeight}px`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`-1 0 ${rowWidth + 1} ${lineHeight}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          userSelect: "none",
        }}
      >
        {playback && bpm && startAtMs !== undefined && <SvgPlaybackCursor
          playback={playback}
          rowLengthBeats={rowLength * 4}
          lineHeight={lineHeight}
          bpm={bpm}
          rowStartMs={startAtMs}
        />}
        <g fill="#5f5f5f" opacity={rulerOpacity}>
          {
            range(length * subdivisions).map((n) => {
              const position = n / subdivisions
              const globalPosition = startAt + position
              const isStartOfBar = globalPosition % timeSignature.perMeasure === 0

              if (isStartOfBar) {
                // start of a bar
                return (
                  <g key={`bar-${n}`}>
                    <path
                      d={`M${position * quarterWidth} 100 l0 -100`}
                      stroke="black"
                      strokeWidth="2"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />
                    {rulerText &&
                      <text x={position * quarterWidth + 12} y={lineHeight - 14} fontSize="11px">
                        {globalPosition / timeSignature.perMeasure}
                      </text>
                    }
                  </g>
                )

              } else if (position % 1 === 0) {
                // big ticks
                return (
                  <rect
                    key={`tick-${n}`}
                    x={position * quarterWidth}
                    y={lineHeight - 8}
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
                    x={position * quarterWidth}
                    y={lineHeight - 3}
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
