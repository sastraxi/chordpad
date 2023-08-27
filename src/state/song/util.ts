import { SongContext } from "./types";

export const resolveContext = (base: SongContext, overlay: Partial<SongContext>): SongContext => ({
  ...base,
  ...overlay,
})
