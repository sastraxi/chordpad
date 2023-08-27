import {
  Box, Button, Flex, Input, Slider,
  SliderFilledTrack, SliderThumb, SliderTrack
} from "@chakra-ui/react"
import { useState } from "react"
import { bpmToMsec, msecToBpm } from "../util/conversions"

type PropTypes = {
  value: number
  onChange: (newBpm: number) => void
  tapButtonText?: string
  min?: number
  max?: number
}

/**
 * How many taps (maximum) will we base our BPM guess on?
 */
const TAP_MEMORY_MAX = 5

/**
 * What is the smallest number of taps we'll guess based on?
 */
const TAP_MEMORY_MIN = 3

/**
 * No matter what, cancel BPM estimation if the user ever
 * waits this long between tap.
 */
const DEFAULT_TAP_ABORT_MS = 2500

const constrain = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const guessBpm = (tapsMs: number[]) => {
  if (tapsMs.length <= 1) throw new Error("Need at least 2 taps to guess BPM")
  return Math.floor(
    msecToBpm(
      (tapsMs[tapsMs.length - 1] - tapsMs[0])
      / (tapsMs.length - 1)
    )
  )
}

const TapBpmInput = ({
  value,
  onChange,
  min = 30,
  max = 240,
  tapButtonText = 'Tap 𝅘𝅥',
}: PropTypes) => {

  const [tapMemoryMs, setTapMemoryMs] = useState<number[]>([])
  const [tapAbortTimeout, setTapAbortTimeout] = useState<number>()

  const recordTap = () => {
    clearTimeout(tapAbortTimeout)

    const taps = [...tapMemoryMs, performance.now()].slice(
      Math.max(0, (tapMemoryMs.length + 1) - TAP_MEMORY_MAX),
    )

    setTapMemoryMs(taps)

    let abortMs = DEFAULT_TAP_ABORT_MS
    if (taps.length >= TAP_MEMORY_MIN) {
      const guessedBpm = constrain(guessBpm(taps), min, max)
      onChange(guessedBpm)
      abortMs = 1.6 * bpmToMsec(guessedBpm)
    }

    // after a while, reset our tap memory
    setTapAbortTimeout(
      setTimeout(() => {
        setTapMemoryMs([])
      }, abortMs)
    )
  }


  return (
    <>
      <Flex>
        <Input
          type="number"
          value={value}
          onChange={
            (event) => event.target.value &&
              onChange(parseInt(event.target.value, 10))
          }
        />
        <Button onClick={recordTap}>{tapButtonText}</Button>
      </Flex>
      <Box>
        <Slider
          value={value}
          min={min}
          max={max}
          onChange={onChange}

        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
    </>
  )
}

export default TapBpmInput
