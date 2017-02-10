import * as React from 'react'

const emptyWhite = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

interface Props {
  value?: string
}

export const Favico = ({value}: Props) =>
  <img width={16} height={16} src={value || emptyWhite}/>
