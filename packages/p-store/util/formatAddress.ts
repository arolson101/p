import { FinancialInstitution } from 'filist'

export const formatAddress = (fi: FinancialInstitution): string => {
  let address = ''
  if (fi && fi.profile) {
    if (fi.profile.address1) {
      address += fi.profile.address1
    }

    if (fi.profile.address2) {
      if (address) { address += '\n' }
      address += fi.profile.address2
    }

    if (fi.profile.address3) {
      if (address) { address += '\n' }
      address += fi.profile.address3
    }

    if (fi.profile.city) {
      if (address) { address += '\n' }
      address += fi.profile.city
    }

    if (fi.profile.state) {
      if (fi.profile.city) {
        address += ', '
      } else {
        address += '\n'
      }
      address += fi.profile.state
    }

    if (fi.profile.zip) {
      if (fi.profile.city || fi.profile.state) {
        address += ' '
      } else {
        address += '\n'
      }
      address += fi.profile.zip
    }

    if (fi.profile.country) {
      if (address) { address += '\n' }
      address += fi.profile.country
    }
  }

  return address
}
