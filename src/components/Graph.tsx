import type { GraphProps } from './graph/graphTypes'
import { buildGraphData } from './graph/graphLayout'
import { GraphCanvasEmpty } from './graph/GraphCanvasEmpty'
import { GraphCanvasMain } from './graph/GraphCanvasMain'

export function Graph({ commits, branches, head, lanes }: GraphProps) {
  const data = buildGraphData(commits, branches, lanes, head)

  if (data.isEmpty) {
    return <GraphCanvasEmpty data={data} />
  }

  return <GraphCanvasMain data={data} head={head} />
}
