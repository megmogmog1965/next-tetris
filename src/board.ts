// constants.
const BLOCK_TYPES = [
  (offset: Point) => new Block([new Point(0, 1), new Point(1, 1), new Point(2, 1), new Point(1, 2)], offset),
  (offset: Point) => new Block([new Point(0, 2), new Point(1, 2), new Point(1, 1), new Point(2, 1)], offset),
  (offset: Point) => new Block([new Point(0, 2), new Point(0, 1), new Point(1, 1), new Point(2, 1)], offset),
  (offset: Point) => new Block([new Point(0, 0), new Point(1, 0), new Point(0, 1), new Point(1, 1)], offset),
  (offset: Point) => new Block([new Point(0, 2), new Point(1, 2), new Point(2, 2), new Point(3, 2)], offset),
]

export class Board {
  height: number
  width: number

  blocks: Block
  active?: Block

  constructor(height: number, width: number) {
    this.height = height
    this.width = width

    this.blocks = new Block([], new Point(0, 0))
    this.active = undefined
  }

  post() {
    if (this.active) {
      return
    }

    this.active = this.#randomBlock()
  }

  down() {
    if (!this.active) {
      return
    }

    const offset = new Point(this.active.offset.x, this.active.offset.y - 1)
    const newBlock = new Block(this.active.points, offset)

    if (this.#hasCollision(newBlock)) {
      this.blocks = this.#eraseLines(this.blocks.merge(this.active))
      this.active = undefined

      return
    }

    this.active = newBlock
  }

  left() {
    if (!this.active) {
      return
    }

    const offset = new Point(this.active.offset.x - 1, this.active.offset.y)
    const newBlock = new Block(this.active.points, offset)

    if (this.#hasCollision(newBlock)) {
      return
    }

    this.active = newBlock
  }

  right() {
    if (!this.active) {
      return
    }

    const offset = new Point(this.active.offset.x + 1, this.active.offset.y)
    const newBlock = new Block(this.active.points, offset)

    if (this.#hasCollision(newBlock)) {
      return
    }

    this.active = newBlock
  }

  rotate() {
    if (!this.active) {
      return
    }

    const length = Math.max(...this.active.points.map((point) => Math.max(point.x, point.y)))
    const half = length / 2

    // @see https://gihyo.jp/dev/feature/01/geo_anime/0002
    const pointsRotated = this.active.points.map((point) => {
      const rad = -90 * 3.14159 / 180
      const x0 = point.x - half
      const y0 = point.y - half

      let x1 = Math.cos(rad) * x0
      let y1 = Math.sin(rad) * x0
      x1 -= Math.sin(rad) * y0
      y1 += Math.cos(rad) * y0

      return new Point(Math.round(x1 + half), Math.round(y1 + half))
    })

    this.active = new Block(pointsRotated, this.active.offset)
  }

  #randomBlock(): Block {
    const index = Math.floor(Math.random() * BLOCK_TYPES.length)
    const offset = new Point(Math.floor(this.width) / 2, this.height - 2)

    return BLOCK_TYPES[index](offset)
  }

  #hasCollision(block: Block): boolean {
    return !block.isValidOffset(this.width, this.height) || this.blocks.hasCollision(block)
  }

  #eraseLines(blocks: Block): Block {
    // validate for each lines.
    for (let i = 0; i < this.height; i++) {
      const line = blocks.points.filter((point) => point.y === i)

      if (line.length === this.width) {
        let points = blocks.points.filter((point) => point.y !== i)
        points = points.map((point) => point.y > i ? new Point(point.x, point.y - 1) : point)
        blocks = new Block(points, blocks.offset)

        // call recursively.
        return this.#eraseLines(blocks)
      }
    }

    return blocks
  }
}

class Block {
  points: Point[]
  offset: Point

  constructor(points: Point[], offset: Point) {
    this.points = points
    this.offset = offset
  }

  hasCollision(block: Block): boolean {
    const absPointsThis = this.#getAbsPoints()
    const absPointsOthers = block.#getAbsPoints()

    return absPointsThis.some((point) => absPointsOthers.some((other) => point.x === other.x && point.y === other.y))
  }

  isValidOffset(maxWidth: number, maxHeight: number): boolean {
    const absPointsThis = this.#getAbsPoints()

    return absPointsThis.every((point) => point.x >= 0 && point.x < maxWidth && point.y >= 0 && point.y < maxHeight + 2)
  }

  merge(block: Block): Block {
    const absPointsThis = this.#getAbsPoints()
    const absPointsOthers = block.#getAbsPoints()

    const points = absPointsThis.concat(absPointsOthers)
    const offset = new Point(0, 0)

    return new Block(points, offset)
  }

  #getAbsPoints(): Point[] {
    return this.points.map((point) => new Point(this.offset.x + point.x, this.offset.y + point.y))
  }
}

class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}