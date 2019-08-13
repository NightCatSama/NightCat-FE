import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  body {
    font-family: PingFangSC-Regular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif;
    width: 100%;
    overflow-x: hidden;
    background-color: $bgc;
  }

  ul {
    list-style: none;
  }

  button:focus {
    outline: none;
    box-shadow: none;
  }
`
