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

    const offset = new Point(Math.floor(this.width) / 2, this.height - 1)
    const block = new Block([new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(1, 1)], offset)

    this.active = block
  }

  down() {
    if (!this.active) {
      return
    }

    const offset = new Point(this.active.offset.x, this.active.offset.y - 1)
    const newBlock = new Block(this.active.points, offset)

    if (this.hasCollision(newBlock)) {
      this.blocks = this.eraseLines(this.blocks.merge(this.active))
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

    if (this.hasCollision(newBlock)) {
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

    if (this.hasCollision(newBlock)) {
      return
    }

    this.active = newBlock
  }

  rotate() {
    // not implemented yet.
    return
  }

  hasCollision(block: Block): boolean {
    return !block.isValidOffset(this.width, this.height) || this.blocks.hasCollision(block)
  }

  eraseLines(blocks: Block): Block {
    // validate for each lines.
    for (let i = 0; i < this.height; i++) {
      const line = blocks.points.filter((point) => point.y === i)
      
      if (line.length === this.width) {
        let points = blocks.points.filter((point) => point.y !== i)
        points = points.map((point) => point.y > i ? new Point(point.x, point.y - 1) : point)
        blocks = new Block(points, blocks.offset)

        // call recursively.
        return this.eraseLines(blocks)
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
    const absPointsThis = this.points.map((point) => new Point(this.offset.x + point.x, this.offset.y + point.y))
    const absPointsOthers = block.points.map((point) => new Point(block.offset.x + point.x, block.offset.y + point.y))

    return absPointsThis.some((point) => absPointsOthers.some((other) => point.x === other.x && point.y === other.y))
  }

  isValidOffset(maxWidth: number, maxHeight: number): boolean {
    const absPointsThis = this.points.map((point) => new Point(this.offset.x + point.x, this.offset.y + point.y))

    return absPointsThis.every((point) => point.x >= 0 && point.x < maxWidth && point.y >= 0 && point.y < maxHeight)
  }

  merge(block: Block): Block {
    const absPointsThis = this.points.map((point) => new Point(this.offset.x + point.x, this.offset.y + point.y))
    const absPointsOthers = block.points.map((point) => new Point(block.offset.x + point.x, block.offset.y + point.y))

    const points = absPointsThis.concat(absPointsOthers)
    const offset = new Point(0, 0)

    return new Block(points, offset)
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