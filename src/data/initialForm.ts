import type { BiodataForm } from '../types/biodata'
import { getDefaultBackground } from './backgrounds'

export const emptyBiodataForm: BiodataForm = {
  personal: {
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    placeOfBirth: '',
    timeOfBirth: {
      hour: '',
      minute: '',
      meridiem: '',
    },
    height: '',
    maritalStatus: '',
    religion: '',
    motherTongue: '',
    community: '',
    diet: '',
    complexion: '',
    livingIn: 'India',
    state: '',
    city: '',
  },
  career: {
    highestQualification: '',
    collegeName: '',
    workSector: '',
    occupation: '',
    companyName: '',
    annualIncome: '',
  },
  family: {
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    siblings: '',
  },
  contact: {
    countryCode: '+91',
    phone: '',
    email: '',
    fatherCountryCode: '+91',
    fatherPhone: '',
    motherCountryCode: '+91',
    motherPhone: '',
    address: '',
  },
  photo: '',
  design: {
    borderTheme: 'classic-gold',
    background: getDefaultBackground(),
    photoRadius: '18',
    textPanelOpacity: '36',
  },
}
