import React, { useEffect } from 'react'
import Balls from '../libs/balls'
import styled from 'styled-components'
import { navigate } from 'hookrouter'

export function Welcome() {
  const BallCanvas = styled.canvas`
    width: 100vw;
    height: 100vh;
  `
  useEffect(() => {
    new Balls('canvas')

    function gotoHome() {
      navigate('/home')
    }
    document.addEventListener('keyup', gotoHome, false)
    return () => document.removeEventListener('keyup', gotoHome, false)
  })
  return (
    <>
      <BallCanvas id="canvas"></BallCanvas>
    </>
  )
}
