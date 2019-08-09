import React, { useEffect } from 'react'
import Balls from '../libs/balls'
import styled from 'styled-components'

export function Home() {
  const BallCanvas = styled.canvas`
    width: 100vw;
    height: 100vh;
  `
  useEffect(() => {
    new Balls('canvas')
  })
  return (
    <>
      <BallCanvas id="canvas"></BallCanvas>
    </>
  )
}
