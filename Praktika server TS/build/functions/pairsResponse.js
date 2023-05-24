import { formatDateWS } from "./Dates.js";
export function convertToPairsResponse(scheduleObjects) {
    const schedules = [];
    let currentDay = null;
    let currentPairNumber = null;
    let currentUserInSchedule = null;
    let currentPairSchedule = null;
    console.log('sos', scheduleObjects);
    for (const scheduleObject of scheduleObjects) {
        const day = formatDateWS(new Date(scheduleObject.date));
        console.log('so', scheduleObject);
        if (currentDay !== day) {
            currentDay = day;
            currentPairNumber = null;
            currentUserInSchedule = null;
            currentPairSchedule = null;
            const daySchedule = {
                p: [],
                d: currentDay,
            };
            schedules.push(daySchedule);
        }
        if (currentPairNumber !== scheduleObject.pair_number) {
            currentPairNumber = scheduleObject.pair_number;
            currentUserInSchedule = null;
            const pairSchedule = {
                su: scheduleObject.subject_name,
                st: scheduleObject.subject_type,
                r: scheduleObject.room_number,
                p: currentPairNumber,
                sc_id: scheduleObject.schedule_id,
                us: [],
            };
            console.log(pairSchedule);
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
            currentPairSchedule === null || currentPairSchedule === void 0 ? void 0 : currentPairSchedule.us.push(currentUserInSchedule);
        }
    }
    const weekResponse = {
        sc: schedules,
    };
    return weekResponse;
}
//# sourceMappingURL=pairsResponse.js.map