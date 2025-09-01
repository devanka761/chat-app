export interface IAuth {
  email: string
  otp: {
    code: string | number
    expiry: number
  }
  rate: number
  cd?: number
}
