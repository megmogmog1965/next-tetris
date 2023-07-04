'use client'
import React, { useEffect, useCallback } from "react";

// constants.
const DOT_LENGTH: number = 20;
const MAX_WIDTH = 12;
const MAX_HEIGHT = 20;

// react component.
export default function Canvas() {
  const board = new Board();
  let intervalId: number;

  board.post();

  // initializer.
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown(board), false);
    intervalId = runDaemon(board);
  }, []);

  // finalizer.
  useEffect(() => {
    return () => {
      document.removeEventListener("keydown", onKeyDown(board), false);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <canvas id="canvas" width={DOT_LENGTH * MAX_WIDTH} height={DOT_LENGTH * MAX_HEIGHT}></canvas>
  )
}

function onKeyDown(board: Board) {
  return (event: KeyboardEvent) => {
    if (event.keyCode === 37) {
      board.left();
    } else if (event.keyCode === 39) {
      board.right();
    } else if (event.keyCode === 40) {
      board.down();
    } else if (event.keyCode === 32) {
      board.rotate();
    }

    drawBoard(board);
  };
}

function runDaemon(board: Board) : number {
  // init.
  const context = getContext();
  context.translate(0, MAX_HEIGHT * DOT_LENGTH);
  context.scale(1, -1);

  const update = () => {
    board.post();
    board.down();

    drawBoard(board);
  };

  // @ts-ignore
  return setInterval(update, 1000);
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function drawBoard(board: Board) {
  const blocks = board.active ? [board.active, board.blocks] : [board.blocks];
  const context = getContext();

  context.clearRect(0, 0, MAX_WIDTH * DOT_LENGTH, MAX_HEIGHT * DOT_LENGTH);

  for (const block of blocks) {
    for (const point of block.points) {
      const offsetX = (block.offset.x + point.x) * DOT_LENGTH;
      const offsetY = (block.offset.y + point.y) * DOT_LENGTH;

      context.fillStyle = 'green';
      context.fillRect(offsetX, offsetY, DOT_LENGTH, DOT_LENGTH);
    }
  }
}

function getContext(): CanvasRenderingContext2D {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas!.getContext('2d');

  return context!;
}

class Board {
  blocks: Block;
  active?: Block;

  constructor() {
    this.blocks = new Block([], new Point(0, 0));
    this.active = undefined;
  }

  post() {
    if (this.active) {
      return;
    }

    const offset = new Point(Math.floor(MAX_WIDTH) / 2, MAX_HEIGHT - 1);
    const block = new Block([new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(1, 1)], offset);

    this.active = block;
  }

  down() {
    if (!this.active) {
      return;
    }

    const offset = new Point(this.active.offset.x, this.active.offset.y - 1);
    const newBlock = new Block(this.active.points, offset);

    if (this.hasCollision(newBlock)) {
      this.blocks = this.blocks.merge(this.active);
      this.active = undefined;

      this.blocks = this.eraseLine(this.blocks);

      return;
    }

    this.active = newBlock;
  }

  left() {
    if (!this.active) {
      return;
    }

    const offset = new Point(this.active.offset.x - 1, this.active.offset.y);
    const newBlock = new Block(this.active.points, offset);

    if (this.hasCollision(newBlock)) {
      return;
    }

    this.active = newBlock;
  }

  right() {
    if (!this.active) {
      return;
    }

    const offset = new Point(this.active.offset.x + 1, this.active.offset.y);
    const newBlock = new Block(this.active.points, offset);

    if (this.hasCollision(newBlock)) {
      return;
    }

    this.active = newBlock;
  }

  rotate() {
    // not implemented yet.
    return;
  }

  hasCollision(block: Block): boolean {
    return !block.is_valid_offset() || this.blocks.has_collision(block);
  }

  eraseLine(blocks: Block): Block {
    // validate for each lines.
    for (let i = 0; i < MAX_HEIGHT; i++) {
      const line = blocks.points.filter((point) => point.y === i);
      
      if (line.length === MAX_WIDTH) {
        let points = blocks.points.filter((point) => point.y !== i);
        points = points.map((point) => point.y > i ? new Point(point.x, point.y - 1) : point);
        blocks = new Block(points, blocks.offset);

        // call recursively.
        return this.eraseLine(blocks);
      }
    }

    return blocks;
  }
}

class Block {
  points: Point[];
  offset: Point;

  constructor(points: Point[], offset: Point) {
    this.points = points;
    this.offset = offset;
  }

  has_collision(block: Block): boolean {
    const absPointsThis = this.points.map((point) => new Point(this.offset.x + point.x, this.offset.y + point.y));
    const absPointsOthers = block.points.map((point) => new Point(block.offset.x + point.x, block.offset.y + point.y));

    return absPointsThis.some((point) => absPointsOthers.some((other) => point.x === other.x && point.y === other.y));
  }

  is_valid_offset(): boolean {
    const absPointsThis = this.points.map((point) => new Point(this.offset.x + point.x, this.offset.y + point.y));
    const ret = absPointsThis.every((point) => point.x >= 0 && point.x < MAX_WIDTH && point.y >= 0 && point.y < MAX_HEIGHT);

    return ret;
  }

  merge(block: Block): Block {
    const absPointsOthers = block.points.map((point) => new Point(block.offset.x + point.x, block.offset.y + point.y));
    const points = this.points.concat(absPointsOthers);
    const offset = new Point(0, 0);

    return new Block(points, offset);
  }
}

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

