import { Box, Button, SimpleGrid } from "@chakra-ui/react"
import { TimeSignature } from "../types"
import TimeSignatureDisplay from "../components/TimeSignatureDisplay"

type PropTypes = {
  value: TimeSignature
  onChange: (value: TimeSignature) => void
}

const SIGNATURES: Array<TimeSignature> = [
  { perMeasure: 4, noteValue: 4 },
  { perMeasure: 3, noteValue: 4 },
  { perMeasure: 6, noteValue: 8 },
  { perMeasure: 5, noteValue: 4 },
  { perMeasure: 6, noteValue: 4 },
  { perMeasure: 7, noteValue: 4 },
]

const timeSignatureEquals = (a: TimeSignature, b: TimeSignature) =>
  a.noteValue === b.noteValue && a.perMeasure === b.perMeasure

const TimeSignatureInput = ({ value, onChange }: PropTypes) => {
  return (
    <Box>
      <SimpleGrid columns={3}>
        {SIGNATURES.map(sig => (
          <Button
            variant={timeSignatureEquals(sig, value) ? "solid" : "ghost"}
            onClick={() => onChange(sig)}
            key={`${sig.perMeasure}/${sig.noteValue}`}
          >
            <TimeSignatureDisplay value={sig} />
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default TimeSignatureInput
