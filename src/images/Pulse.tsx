const HIGH_ENERGY = 1
const MED_ENERGY = 0.4

const DEGREES = 55
const SIN_ANG = Math.sin(Math.PI * DEGREES / 180)
const COS_ANG = Math.cos(Math.PI * DEGREES / 180)

const M = (x: number, y: number) => `M ${x} ${y}`
const L = (x: number, y: number) => `L ${x} ${y}`
const C = (...x1x2y1y2xy: number[]) => `C ${x1x2y1y2xy.join(' ')}`

const createQuadrants = (template: (x: number, y: number) => string) => [
  template(-1, -1),
  template(1, -1),
  template(-1, 1),
  template(1, 1),
]

const Pulse = ({
  aspect = 1.3,
  energy,
  color,
  ...svgProps
}: React.SVGAttributes<SVGSVGElement> & {
  aspect?: number,
  energy: number,
  color: string,
}) => {

  // const k = 0
  // let highPart = (energy - HIGH_ENERGY) / (1 - HIGH_ENERGY)
  // if (highPart > 0) highPart = 0.3 + 0.7 * highPart

  const medPart = Math.min(1.0, (energy - MED_ENERGY) / (HIGH_ENERGY - MED_ENERGY))
  const lowPart = Math.min(1.0, energy / MED_ENERGY)

  // const highPaths = createQuadrants((x, y) =>
  //   `${M(x * COS_ANG, y * SIN_ANG)
  //   } ${C(
  //     x * (COS_ANG + k * SIN_ANG), y * (SIN_ANG + k * COS_ANG),
  //     x * k * (1 - highPart), -y * (-1 - highPart * aspect),
  //     0, -y * (-1 - highPart * aspect)
  //   )} ${L(0, 0)
  //   } Z`)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 2 2" {...svgProps}>
      <g fill={color}>
        {/* {
          highPart > 0 &&
          highPaths.map((d, i) => (
            <path
              fill="black"
              opacity={highPart * 0.8}
              d={d}
              key={`${i}`}
            />
          ))
        } */}
        {
          <circle cx={0} cy={0} r={1} opacity={medPart} />
        }
        {
          <circle cx={0} cy={0} r={0.5} opacity={lowPart} />
        }
      </g>
    </svg>
  )

}

export default Pulse

