export enum STATE { IDLE,LOADING,SELECTING,COMPLETE };

export type Rectangle = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export type Point = {
  x:number
  y:number
}

export type MouseEventDetail = {
  x: number
  y: number
  isMove: boolean
  isClick: boolean
}

export type KeyEventDetail = {
  // if user press "ctrl" + "p" to start screenshot
  // then isStart is only "true" when keydown event happens on "P"
  isStart: boolean
  isEnter: boolean
  isEscape: boolean
}