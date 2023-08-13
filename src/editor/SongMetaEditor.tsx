import { Editable, EditableInput, EditablePreview, HStack } from "@chakra-ui/react"
import { useState } from "react"
import { useDefaultSongContext, useMutateDefaultSongContext, useSongMeta } from "../state/song"
import SongContextEditor from "./SongContextEditor"

const SongMetaEditor = () => {
  const { title, setTitle, author, setAuthor } = useSongMeta()
  const context = useDefaultSongContext()
  const mutators = useMutateDefaultSongContext()
  const [scratchTitle, setScratchTitle] = useState<string | undefined>(undefined)
  const [scratchAuthor, setScratchAuthor] = useState<string | undefined>(undefined)

  const onSubmit = (newTitle: string) => {
    if (newTitle) setTitle(newTitle)
    setScratchTitle(undefined)
  }

  return (
    <HStack>
      <Editable
        isPreviewFocusable={true}
        value={scratchTitle ?? title}
        onChange={setScratchTitle}
        onSubmit={onSubmit}
        submitOnBlur={true}
        fontSize="3xl"
        minW={60}
      >
        <EditablePreview mr={4} />
        <EditableInput />
      </Editable>
      <SongContextEditor context={context} mutators={mutators} buttonProps={{ size: "md" }} />
    </HStack>
  )


}

export default SongMetaEditor
