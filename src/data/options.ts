export const genderOptions = ['Male', 'Female']

export const maritalStatusOptions = [
  'Never Married',
  'Divorced',
  'Widowed',
  'Separated',
]

export const dietOptions = ['Veg', 'Non-Veg', 'Eggetarian', 'Vegan']

export const workSectorOptions = [
  'Private',
  'Government',
  'Business',
  'Defence',
  'Not Working',
]

export const countryCodeOptions = ['+91', '+1', '+44', '+61', '+971', '+65']

export const hourOptions = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, '0'),
)

export const minuteOptions = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, '0'),
)

export const meridiemOptions = ['AM', 'PM']
