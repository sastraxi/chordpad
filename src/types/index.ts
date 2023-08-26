/**
 * How many pulses fit into a bar, e.g.
 *  - whole notes = 48,
 *  - quarter notes = 12,
 *  - eighth notes = 6,
 *  - eighth note triplets = 4,
 *  - sixteenth notes = 3,
 *  - sixteenth note triplets = 2,
 *    etc.
 * 
 * See NOTE_DENOMINATOR.
 */
export type NoteLength = number

export type TimeSignature = {
  perMeasure: number
  noteValue: number  // e.g. 4 = 1/4, 8 = 1/8
}
