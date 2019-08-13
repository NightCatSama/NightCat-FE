import React from 'react'
import { useRoutes } from 'hookrouter'
import { routes } from './routes'
import { NotFoundPage } from './pages/NotFoundPage'
import { ThemeProvider } from 'styled-components'
import { theme } from './styles/theme'
import { GlobalStyle } from './styles/globalStyle'

export function App() {
  const match = useRoutes(routes)
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <>
          <GlobalStyle />
          {match || <NotFoundPage />}
        </>
      </ThemeProvider>
    </React.Fragment>
  )
}
