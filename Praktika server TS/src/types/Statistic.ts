export interface IStatisticRequest {
  sk: string;
  fd: string;
  td: string;
  su_id:string;
  g_id:string;
  st_id:string
  sut_id:string
}

export interface IStatisticDayData {
  d: string;
  m: number;
  r: number;
  nr: number;
  e: number;
}

export interface IStatisticResponse {
  sd: IStatisticDayData[];
}

export interface IDBTStatic{
  date: Date
  teacher_id: number
  schedule_id: number
  count_students: number
  count_existed_students: number
  count_respect_students: number
  count_norespect_students: number

}
export interface IDBTStaticSU{
  date: Date
  teacher_id: number
  student_id: number
  subject_id:number
  subject_type_id:number
  visit_count: number
  visit_respect_count: number
  visit_norespect_count: number
  visit_exist_count: number

}
export interface IDBSStatic{
  date: Date
  student_id: number
  visit_count: number
  visit_respect_count: number
  visit_norespect_count: number
  visit_exist_count: number

}

export interface ISubjectStatistic{
  subject_name: string
  subject_type: string
  student_id: number
  visit_count: number
  visit_respect_count: number
  visit_norespect_count: number
  visit_exist_count: number
}

export interface IBeforeStatisticRequest
{
  sk:string;//session_key
  fd:string;//from_day
  td:string;//to_day
  su_id:string;//subjects_id
  g_id:string;//groups_id
  st_id:string;//students_id
  sut_id:string
}
// export interface IBeforeStatisticResponse {
//   su: string[]; // subjects
//   su_id: string[]; // subjects_id
//   g: string[]; // groups
//   g_id: string[]; // groups_id
//   st: string[]; // students
//   st_id: string[]; // students_id
//   sut: string[]; // students_id
//   sut_id: string[]; // students_id
// }
export interface IBeforeStatisticResponse {
    su: Array<{
      n: string, // subjects
      id: string
    }>
    g: Array<{
      n: string, // groups
      id: string // groups_id
    }>
    st: Array<{
      n: string, // students
      id: string // students_id
    }>
    sut: Array<{
      n: string,
      id: string
    }>
}
export interface IBeforeStatisticRequestDB{
  schedule_id: number,
  group_id: number,
  date: Date,
  teacher_id: number,
  subject_name: string,
  subject_id: number,
  subject_type_name: string,
  subject_type_id: string,
  student_id: number,
  student_name: string,
  group_name: string

}