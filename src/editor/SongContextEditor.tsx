import { ButtonProps } from "@chakra-ui/react"
import PopoverInput from "../components/PopoverInput"
import TimeSignatureDisplay from "../components/TimeSignatureDisplay"
import KeyInput from "../inputs/KeyInput"
import TapBpmInput from "../inputs/TapBpmInput"
import TimeSignatureInput from "../inputs/TimeSignatureInput"
import { ContextMutators, SongContext } from "../state/song"

type PropTypes = {
  context: SongContext
  overrides?: Partial<SongContext>
  mutators: ContextMutators
  buttonProps?: Partial<ButtonProps>
}

const SongContextEditor = ({
  context,
  overrides,
  mutators: { setBpm, setKey, setTimeSignature },
  buttonProps = {}
}: PropTypes) => {
  const commonProps: Partial<ButtonProps> = {
    size: 'sm',
    colorScheme: overrides ? "blackAlpha" : "gray",
    borderWidth: 2,
    ...buttonProps,
  }
  return (
    <>
      <PopoverInput
        value={overrides?.key ?? context.key}
        onChange={setKey}
        displayComponent={({ value }) => <span>{value}</span>}
        editorComponent={KeyInput}
        buttonProps={{
          ...commonProps,
          w: 32,
          variant: !overrides || overrides?.key ? 'solid' : 'ghost',
          colorScheme: overrides?.key ? 'blue' : commonProps.colorScheme,
        }}
      />
      <PopoverInput
        value={overrides?.timeSignature ?? context.timeSignature}
        onChange={setTimeSignature}
        displayComponent={TimeSignatureDisplay}
        editorComponent={TimeSignatureInput}
        closeOnChange
        buttonProps={{
          ...commonProps,
          variant: !overrides || overrides?.timeSignature ? 'solid' : 'ghost',
          colorScheme: overrides?.timeSignature ? 'blue' : commonProps.colorScheme,
        }}
      />
      <PopoverInput
        value={overrides?.bpm ?? context.bpm}
        onChange={setBpm}
        displayComponent={({ value }) => <span>𝅘𝅥 = {value}</span>}
        editorComponent={TapBpmInput}
        buttonProps={{
          ...commonProps,
          w: 16,
          variant: !overrides || overrides?.bpm ? 'solid' : 'ghost',
          colorScheme: overrides?.bpm ? 'blue' : commonProps.colorScheme,
        }}
      />
    </>
  )
}

export default SongContextEditor