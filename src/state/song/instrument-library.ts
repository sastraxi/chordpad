import { PatternLibrary } from "./rhythm"
import { Instrument } from "./types"

const instr = (instrument: Instrument) => ({ [instrument.name]: instrument })

export const InstrumentLibrary = {
  ...instr({
    name: "Kick",
    type: "drum",
    playMode: "drum",
    pattern: PatternLibrary["whole"],
    noteLength: 0,

    patchNumber: 1,
    muted: false,
    volume: 0.3,
  }),
  ...instr({
    name: "Snare",
    type: "drum",
    playMode: "drum",
    pattern: PatternLibrary["three"],
    noteLength: 0,

    patchNumber: 17,
    muted: false,
    volume: 0.3,
  }),
  ...instr({
    name: "Electric Bass",
    type: "guitar",
    playMode: "bass",
    pattern: PatternLibrary["heartbeat"],
    noteLength: 0.2,

    patchNumber: 379,
    muted: false,
    volume: 0.5,
  }),
  ...instr({
    name: "Acoustic Guitar",
    type: "guitar",
    playMode: "chord",
    pattern: PatternLibrary["quarter"],
    noteLength: 0.4,

    strumDelay: 0.2,
    strumPattern: "DUUD",

    patchNumber: 265,
    muted: false,
    volume: 0.5,
  }),
  ...instr({
    name: "Grand Piano",
    type: "piano",
    playMode: "chord",
    pattern: PatternLibrary["quarter"],
    noteLength: 0.4,

    strumDelay: 0.3,
    strumPattern: "U",

    patchNumber: 15,
    muted: false,
    volume: 0.5,
  }),
  ...instr({
    name: "Arp Synth",
    type: "piano",
    playMode: "arp",
    pattern: PatternLibrary["eighth"],
    noteLength: 0.2,

    arpPattern: "123436",

    patchNumber: 926,
    muted: false,
    volume: 0.5,
  }),
}

export const INSTRUMENT_NAMES = Object.keys(InstrumentLibrary)
