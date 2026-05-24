export type Meridiem = 'AM' | 'PM'
export type BorderTheme =
  | 'classic-gold'
  | 'curved-gold'
  | 'christian-blessing'
  | 'hindu-divine'
  | 'all-blessings'
export type BiodataBackground = string

export type BiodataForm = {
  personal: {
    firstName: string
    lastName: string
    gender: string
    dob: string
    placeOfBirth: string
    timeOfBirth: {
      hour: string
      minute: string
      meridiem: Meridiem | ''
    }
    height: string
    maritalStatus: string
    religion: string
    motherTongue: string
    community: string
    diet: string
    complexion: string
    livingIn: string
    state: string
    city: string
  }
  career: {
    highestQualification: string
    collegeName: string
    workSector: string
    occupation: string
    companyName: string
    annualIncome: string
  }
  family: {
    fatherName: string
    fatherOccupation: string
    motherName: string
    motherOccupation: string
    siblings: string
  }
  contact: {
    countryCode: string
    phone: string
    email: string
    fatherCountryCode: string
    fatherPhone: string
    motherCountryCode: string
    motherPhone: string
    address: string
  }
  photo: string
  design: {
    borderTheme: BorderTheme
    background: BiodataBackground
    photoRadius: string
    textPanelOpacity: string
  }
}

export type FieldErrors = Partial<Record<string, string>>
