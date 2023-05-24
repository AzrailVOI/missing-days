export interface IUserInSchedule {
  u: string
  n: string
  g: string
  m: number | null
  r: string | null
}

export interface IPairSchedule {
  su: string;
  st: string;
  r: string;
  p: number;
  sc_id: number;
  us: IUserInSchedule[];
}

export interface IDaySchedule {
  p: IPairSchedule[];
  d: string;
}

export interface IWeekResponse {
  sc: IDaySchedule[];
}

export interface WeekRequest {
  session_key: string;
  day: Date;
}

export interface WeekDB{
  date: Date,
  pair_number: number
  teacher_id: number
  teacher_name: string
  teacher_position: string
  subject_name: string
  subject_type: string
  room_number: string
  visit:number | null
  discription:string|null
  student_id:number
  schedule_id: number

}