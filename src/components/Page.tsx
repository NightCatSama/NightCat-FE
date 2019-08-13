import React from 'react'
import { Flex, FlexProps } from './Flex'
import styled from 'styled-components'

interface PageProps extends FlexProps {
  full?: boolean
}

export const Page: React.FC<PageProps> = ({ children, full, ...props }) => {
  let Wrapper = Flex
  if (full) {
    Wrapper = styled(Flex)`
      min-height: 100vh;
    `
  }
  return (
    <Wrapper className="page" isColumn {...props}>
      {children}
    </Wrapper>
  )
}
