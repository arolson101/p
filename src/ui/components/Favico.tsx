import * as React from 'react'

const emptyWhite = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

interface Props {
  value?: string
  greyscale?: boolean
}

const styles = {
  normal: {},
  greyscale: {
    WebkitFilter: 'grayscale(100%)', /* Safari 6.0 - 9.0 */
    filter: 'grayscale(100%)'
  }
}

export const Favico = ({value, greyscale}: Props) =>
  <img
    width={16}
    height={16}
    src={value || emptyWhite}
    style={greyscale ? styles.greyscale : styles.normal}
  />
