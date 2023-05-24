
import {IDaySchedule, IPairSchedule, IUserInSchedule, IWeekResponse, WeekDB} from "../types/dayTypes.js";
import {TeacherTypes} from "../types/teacherTypes.js";
import {formatDateWS} from "./Dates.js";
export function convertToPairsResponse(scheduleObjects: TeacherTypes[]): IWeekResponse {
  const schedules: IDaySchedule[] = [];
  let currentDay: string | null = null;
  let currentPairNumber: number | null = null;
  let currentUserInSchedule: IUserInSchedule | null = null;
  let currentPairSchedule: IPairSchedule | null = null;
  console.log('sos', scheduleObjects)
  for (const scheduleObject of scheduleObjects) {
    const day = formatDateWS(new Date(scheduleObject.date));
    console.log('so', scheduleObject)
    if (currentDay !== day) {
      currentDay = day;
      currentPairNumber = null;
      currentUserInSchedule = null;
      currentPairSchedule = null;

      const daySchedule: IDaySchedule = {
        p: [],
        d: currentDay,
      };

      schedules.push(daySchedule);
    }

    if (currentPairNumber !== scheduleObject.pair_number) {
      currentPairNumber = scheduleObject.pair_number;
      currentUserInSchedule = null;

      const pairSchedule: IPairSchedule = {
        su: scheduleObject.subject_name,
        st: scheduleObject.subject_type,
        r: scheduleObject.room_number,
        p: currentPairNumber,
        sc_id: scheduleObject.schedule_id,
        us: [],
      };
      console.log(pairSchedule)
      schedules[schedules.length - 1].p.push(pairSchedule);
      currentPairSchedule = pairSchedule;
    }

    if (currentUserInSchedule === null || currentUserInSchedule.u !== String(scheduleObject.student_id)) {
      currentUserInSchedule = {
        u: String(scheduleObject.student_id),
        n: scheduleObject.students,
        g: scheduleObject.group_name,
        m: scheduleObject.visit == null ? 0 : scheduleObject.visit,
        r: scheduleObject.discription == null ? '' : `${scheduleObject.discription}`,
      };

      currentPairSchedule?.us.push(currentUserInSchedule);
    }
  }

  const weekResponse: IWeekResponse = {
    sc: schedules,
  };

  return weekResponse;
}