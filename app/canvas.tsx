'use client'
import React, { useEffect, useCallback } from 'react'
import { Board } from '../src/board'

// constants.
const DOT_LENGTH: number = 20
const MAX_WIDTH = 12
const MAX_HEIGHT = 20

// react component.
export default function Canvas() {
  // initializer & finalizer.
  useEffect(() => {
    const board = new Board(MAX_HEIGHT, MAX_WIDTH)
    const keyDownHandler = onKeyDown(board)

    document.addEventListener('keydown', keyDownHandler, false)
    const stopDaemon = runDaemon(board)

    return () => {
      document.removeEventListener('keydown', keyDownHandler, false)
      stopDaemon()
    }
  }, [])

  return (
    <canvas id="canvas" width={MAX_WIDTH * DOT_LENGTH} height={MAX_HEIGHT * DOT_LENGTH}></canvas>
  )
}

function onKeyDown(board: Board): (event: KeyboardEvent) => void {
  const actions: { [key: number]: () => void } = {
    37: () => board.left(),
    39: () => board.right(),
    40: () => board.down(),
    32: () => board.rotate(),
  }

  return (event: KeyboardEvent) => {
    const action = actions[event.keyCode]
    if (!action) {
      return
    }

    action()
    drawBoard(board)
  }
}

function runDaemon(board: Board) : () => void {
  // init.
  const context = getContext()
  context.translate(0, MAX_HEIGHT * DOT_LENGTH)
  context.scale(1, -1)

  const update = () => {
    board.post()
    board.down()

    drawBoard(board)
  }

  // run it.
  const intervalId = setInterval(update, 1000)

  // return function to stop daemon.
  return () => clearInterval(intervalId)
}

function drawBoard(board: Board) {
  const blocks = board.active ? [board.active, board.blocks] : [board.blocks]
  const context = getContext()

  context.clearRect(0, 0, MAX_WIDTH * DOT_LENGTH, MAX_HEIGHT * DOT_LENGTH)

  for (const block of blocks) {
    for (const point of block.points) {
      const offsetX = (block.offset.x + point.x) * DOT_LENGTH
      const offsetY = (block.offset.y + point.y) * DOT_LENGTH

      context.fillStyle = 'green'
      context.fillRect(offsetX, offsetY, DOT_LENGTH, DOT_LENGTH)
    }
  }
}

function getContext(): CanvasRenderingContext2D {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const context = canvas!.getContext('2d')

  return context!
}
