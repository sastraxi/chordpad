import { Flex } from "@chakra-ui/react"
import { TimeSignature } from "../types"

type PropTypes = {
  value: TimeSignature
}

const TimeSignatureDisplay = ({ value }: PropTypes) => {
  return (
    <Flex flexDir="column" fontFamily="BravuraText" fontWeight="bold" lineHeight="0.8">
      <span>{value.perMeasure}</span>
      <span>{value.noteValue}</span>
    </Flex>
  )
}

export default TimeSignatureDisplay
