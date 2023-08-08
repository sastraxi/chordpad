import { Box, Editable, EditableInput, EditablePreview, HStack, Heading, Input, Kbd, Text } from "@chakra-ui/react"
import { useDefaultSongContext, useMutateDefaultSongContext, useSongMeta } from "../state/song"
import { useState } from "react"
import SongContextEditor from "./SongContextEditor"

const SongMetaEditor = () => {
  const { title, setTitle, author, setAuthor } = useSongMeta()
  const context = useDefaultSongContext()
  const mutators = useMutateDefaultSongContext()
  const [scratchTitle, setScratchTitle] = useState<string | undefined>(undefined)
  const [scratchAuthor, setScratchAuthor] = useState<string | undefined>(undefined)


  return (
    <HStack>
      <Editable
        isPreviewFocusable={true}
        value={scratchTitle ?? title}
        onChange={setScratchTitle}
        onSubmit={title => { setTitle(title); setScratchTitle(undefined) }}
        submitOnBlur={true}
        fontSize="3xl"
        minW={60}
      >
        <EditablePreview />
        <EditableInput />
      </Editable>
      <SongContextEditor context={context} mutators={mutators} />
      <HStack spacing={6} ml={12}>
        <HStack>
          <Kbd>ctrl</Kbd>
          <Text fontSize="sm">ripple edit</Text>
        </HStack>
      </HStack>
    </HStack>
  )


}

export default SongMetaEditor
