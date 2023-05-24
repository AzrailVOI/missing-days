export interface CheckUserData {
  u: string
  m: number
  r: string
}

export interface CheckData {
  sk: string
  sc_id: string
  su: string
  cu: CheckUserData[]
}

