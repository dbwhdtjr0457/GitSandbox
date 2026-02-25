import type { GraphLayoutData } from './graphTypes'

type GraphCanvasEmptyProps = {
  data: Pick<
    GraphLayoutData,
    'branchEntries' | 'branchesByLane' | 'laneIndexByValue' | 'width' | 'baseX' | 'laneGap' | 'sidePadding'
  >
}

const graphEnglishEmptyText = {
  noCommits: 'No commits yet',
  initLine1: 'Initialize repository and commit to draw your first node.',
  initLine2: 'Run git init and git commit -m "message"',
}

const GRAPH_TEXT_PADDING_X = 20
const GRAPH_FONT_SIZE = 14
const GRAPH_FONT_CHAR_ESTIMATE = 7.3
const GRAPH_TEXT_LINE_HEIGHT = 18

const splitToWrappedLines = (text: string, availableWidth: number): string[] => {
  const maxCharsPerLine = Math.max(18, Math.floor(availableWidth / GRAPH_FONT_CHAR_ESTIMATE))
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    if (word.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = ''
      }

      for (let index = 0; index < word.length; index += maxCharsPerLine) {
        lines.push(word.slice(index, index + maxCharsPerLine))
      }
      return
    }

    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate
      return
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.length > 0 ? lines : ['']
}

export function GraphCanvasEmpty({ data }: GraphCanvasEmptyProps) {
  const hasBranches = data.branchEntries.length > 0
  const availableTextWidth = Math.max(
    200,
    data.width - GRAPH_TEXT_PADDING_X * 2,
  )
  const noCommitLines = splitToWrappedLines(graphEnglishEmptyText.noCommits, availableTextWidth)
  const guideLines = hasBranches
    ? []
    : [
      ...splitToWrappedLines(graphEnglishEmptyText.initLine1, availableTextWidth),
      ...splitToWrappedLines(graphEnglishEmptyText.initLine2, availableTextWidth),
    ]
  const guideStartY = 52 + Math.max(0, noCommitLines.length - 1) * GRAPH_TEXT_LINE_HEIGHT
  const contentBottomY = guideLines.length > 0
    ? guideStartY + guideLines.length * GRAPH_TEXT_LINE_HEIGHT + 8
    : 70 + Math.max(0, noCommitLines.length - 1) * GRAPH_TEXT_LINE_HEIGHT
  const viewHeight = Math.max(180, contentBottomY + 24)

  return (
    <svg
      viewBox={`0 0 ${data.width} ${viewHeight}`}
      className="graph-canvas"
      preserveAspectRatio="xMidYMin meet"
      style={{ height: `max(100%, 180px)`, width: '100%', minWidth: `${data.width}px` }}
    >
      <rect x="0" y="0" width={data.width} height="28" fill="#f8fafc" />
      {data.branchesByLane.map(({ laneValue, names }) => {
        const index = data.laneIndexByValue.get(laneValue) ?? 0
        const x = data.baseX + index * data.laneGap
        const delay = index * 70
        if (names.length === 0) {
          return null
        }
        return (
          <g key={`lane-label-empty-${laneValue}`} className="graph-empty-lane" style={{ animationDelay: `${delay}ms` }}>
            <line
              x1={x}
              y1="28"
              x2={x}
              y2="180"
              stroke="#cbd5e1"
              strokeWidth="1.8"
              className="graph-lane-line"
            />
            <text
              x={x + 12}
              y="170"
              fill="#334155"
              fontSize="12"
              textAnchor="start"
              className="graph-lane-text"
              style={{ animationDelay: `${delay + 80}ms` }}
            >
              {names.join(', ')}
            </text>
          </g>
        )
      })}
      <text
        x={GRAPH_TEXT_PADDING_X}
        y="28"
        fill="#777"
        fontSize={GRAPH_FONT_SIZE}
        className="graph-empty-msg"
        style={{ animationDelay: '120ms' }}
      >
        {noCommitLines.map((line, index) => (
          <tspan
            key={`no-commit-line-${index}`}
            x={GRAPH_TEXT_PADDING_X}
            dy={index === 0 ? '0' : `${GRAPH_TEXT_LINE_HEIGHT}px`}
          >
            {line}
          </tspan>
        ))}
      </text>
      {!hasBranches ? (
        <text
          x={GRAPH_TEXT_PADDING_X}
          y={guideStartY}
          fill="#777"
          fontSize={GRAPH_FONT_SIZE}
          className="graph-empty-guide"
          style={{ animationDelay: '180ms' }}
        >
          {guideLines.map((line, index) => (
            <tspan
              key={`guide-line-${index}`}
              x={GRAPH_TEXT_PADDING_X}
              dy={index === 0 ? '0' : `${GRAPH_TEXT_LINE_HEIGHT}px`}
              className="graph-empty-guide-line"
              style={index === 0 ? undefined : { animationDelay: `${200 + index * 30}ms` }}
            >
              {line}
            </tspan>
          ))}
        </text>
      ) : null}
    </svg>
  )
}

export default GraphCanvasEmpty
