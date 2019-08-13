import styled from 'styled-components'

export interface FlexProps {
  readonly inInline?: boolean
  readonly isColumn?: boolean
  readonly center?: 'main' | 'cross' | 'all'
}

export const Flex = styled.div<FlexProps>`
  display: ${props => (props.inInline ? 'inline-flex' : 'flex')};
  flex-direction: ${props => (props.isColumn ? 'column' : 'row')};
  justify-content: ${props =>
    props.center === 'main' || props.center === 'all' ? 'center' : ''};
  align-items: ${props =>
    props.center === 'cross' || props.center === 'all' ? 'center' : ''};
`
