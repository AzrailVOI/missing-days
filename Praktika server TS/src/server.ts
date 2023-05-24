import express, {Express, Request, Response} from "express"
import * as http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import {IncomingMessage} from "http";
import * as mysql from 'mysql2/promise'
import * as crypto from "crypto";
import {IUserData} from './types/userData.js'
import {IDaySchedule, IPairSchedule,  IWeekResponse, WeekDB} from "./types/dayTypes.js";
import {formatDate, formatDateEmail, formatDateWS, getEndOfWeek, getStartOfWeek, isSameDay} from "./functions/Dates.js";
import {ws_Send} from "./functions/bigWsSend.js";
import {MessageEnum} from "./types/MessagesEnum.js";
import {SessionType} from "./types/sessionType.js";
import {KeyPair} from "./types/Key.js";
import {KeyPairKeyObjectResult} from "crypto";
import {splitMsg} from "./functions/splitMsg.js";
import {RolesEnum} from "./types/RolesEnum.js";
import {TeacherTypes} from "./types/teacherTypes.js";
import {convertToPairsResponse} from "./functions/pairsResponse.js";
import {CheckData, CheckUserData} from "./types/TeacherCommit.js";
import {sendEmail} from "./functions/sendEmail.js";
import {
    IBeforeStatisticRequest, IBeforeStatisticRequestDB, IBeforeStatisticResponse,
    IDBSStatic,
    IDBTStatic, IDBTStaticSU, IStatisticDayData,
    IStatisticRequest,
    IStatisticResponse,
    ISubjectStatistic
} from "./types/Statistic.js";
import {distributeData} from "./functions/staticFunc.js";

const app : Express = express();
const httpServer = http.createServer(app);
const mess = "Hello"
console.log(mess)




// Пример использования
// const currentDate = new Date('2023-05-31'); // Используйте нужную вам дату
// const startOfWeek = getStartOfWeek(currentDate);
// const endOfWeek = getEndOfWeek(currentDate);
//
// console.log('Начало недели:', formatDate(startOfWeek));
// console.log('Конец недели:', formatDate(endOfWeek));


const textToSHA256 = (text:string) => {
  return crypto.createHash('sha256').update(text).digest('hex')
}

const DBconnectionConfig = {
  password: '12345',
  database: 'praktyka',
  port: '3306',
  host: '127.0.0.1',
  user: 'root',
    multipleStatements: true
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const prdb = await mysql.createConnection(DBconnectionConfig);



/*
const currentDate = new Date(2023, 5, 19); // Используйте нужную вам дату
const startOfWeek = formatDate(getStartOfWeek(currentDate))
const endOfWeek = formatDate(getEndOfWeek(currentDate))
console.log(startOfWeek, endOfWeek)
const [...weekdirt]:Array<any> = await prdb.execute(`
SELECT 
date, 
pair_number, 
teacher_id,
(select CONCAT(last_name, ' ',  SUBSTRING(first_name, 1, 1), '. ', SUBSTRING(middle_name, 1, 1), '.') from users where schedule.teacher_id = users.user_id) as teacher_name,
(select position from users where schedule.teacher_id = users.user_id) as teacher_position,
(select subject_name from subjects where subjects.subject_id = schedule.subject_id) as subject_name,
(select room_number from rooms where rooms.room_id = schedule.room_id) as room_number,
(select subject_type_name from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type
FROM schedule
having date >= ? and date <= ?
`, [startOfWeek, endOfWeek])
const week:Array<WeekDB> = weekdirt[0];
console.log(week)

 */

/*
const WeekResponse:IWeekResponse={
    schedules: [...week.map((el:WeekDB)=>{
        return{
            pairs: [...week.map((el:WeekDB)=>{
                return{
                    pair_number: el.pair_number,
                    room_number: el.room_number,
                    subject_name: el.subject_name,
                    users: [...week.map((el:WeekDB)=>{
                        return{
                            user_id: String(el.teacher_id),
                            name: el.teacher_name,
                            group: el.teacher_position
                        }
                    })]
                }
            })],
            day: el.date
        }
    })]
}
*/
/*
const schedules: IDaySchedule[] = [];
let currentDay: Date | null = null;
let currentPairs: IPairSchedule[] = [];

for (const row of week) {
    const { date, pair_number, teacher_id, teacher_name, teacher_position, subject_name, room_number } = row;

    // Convert the date string to a JavaScript Date object
    const day = new Date(date);

    // If the current day is null or different from the previous row, start a new day
    if (currentDay === null || !isSameDay(currentDay, day)) {
        // Add the previous day's pairs to the schedules array
        if (currentDay !== null && currentPairs.length > 0) {
            schedules.push({ pairs: currentPairs, day: currentDay });
        }

        // Start a new day with an empty pairs array
        currentDay = day;
        currentPairs = [];
    }

    // Create a new pair schedule object
    const pair: IPairSchedule = {
        subject_name,
        room_number,
        pair_number,
        users: []
    };

    // Add the user to the pair's users array
    pair.users.push({
        user_id: String(teacher_id),
        name: teacher_name,
        group: teacher_position
    });

    // Add the pair to the current day's pairs array
    currentPairs.push(pair);
}

// Add the last day's pairs to the schedules array
if (currentDay !== null && currentPairs.length > 0) {
    schedules.push({ pairs: currentPairs, day: currentDay });
}

// Create the final week response object
const weekResponse: IWeekResponse = { schedules };

// Helper function to check if two dates represent the same day

console.log(weekResponse, weekResponse.schedules)
console.log(JSON.stringify(weekResponse))

const encryptWeekResponse = encryptMessage(`4:${JSON.stringify(weekResponse)}`, secretKey)
console.log(encryptWeekResponse)
*/






/*

const [...pairsdirt]:Array<any> = await prdb.execute(`
WITH a AS (
SELECT *
FROM praktyka.group_user
),
c as (
SELECT * FROM praktyka.schedule_user
),
b as (
SELECT
schedule_group.group_id,
schedule_group.schedule_id as sch_id,
users.user_id as student_id,
(select group_name from praktyka.groups where schedule_group.group_id = praktyka.groups.group_id) as group_name,
GROUP_CONCAT(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name ) SEPARATOR '; ') AS students
FROM
praktyka.schedule_group
JOIN a ON a.group_id = schedule_group.group_id
JOIN users ON users.user_id = a.user_id
GROUP BY
schedule_group.group_id,
schedule_group.schedule_id,
users.user_id
)
SELECT 
date, 
pair_number, 
teacher_id,
schedule_id,

(select subject_name from subjects where subjects.subject_id = schedule.subject_id) as subject_name,
(select room_number from rooms where rooms.room_id = schedule.room_id) as room_number,
(select subject_type_name from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type,
student_id,
group_name,
students,
visit,
discription

FROM schedule
join b on schedule.schedule_id = b.sch_id
LEFT JOIN c ON c.users_user_id = student_id AND c.schedule_schedule_id = schedule_id
having date >= '2023-05-15' and date <= '2023-05-21' and teacher_id = 4
                `, [])
                          const pairs:Array<TeacherTypes> = pairsdirt[0];
                          // console.log("Pairs:\n",pairs)
                          const pairsResponse: IWeekResponse = convertToPairsResponse(pairs);
                          console.log(convertToPairsResponse(pairs), pairsResponse, pairsResponse.schedules);
                          pairsResponse.schedules.map((el:IDaySchedule)=>{
                              el.pairs.map((ell)=>{
                                  console.log(ell.users)
                              })
                          })
*/

/*
const prichiny:any = ['Мной овладел сон',
'Мне пришлось задержаться в туалете, решая мировые дела',
'Вы не представляете как тяжко подниматься с кровати! И у меня не получилось :(',
'Автобус задержался',
'Была пробка',
'Будильник не сработал',
'Инопришленцы похители меня!',
'Меня слишком затянула ЧЕРНАЯ ДЫРА!!1!!11!1!1!!!!11',
'Оказалось, что моя квартира - это тот ещё лабиринт))))))))))',
'Встретились на улице со старым знакомым и решили пообщаться, выпить кофе, поговорить о жизни, карьере, детях... Ну сами понимаете',
'Меня перенесла на другую планету неведомая сила!',
'!!!ЕГИПЕТСКАЯ СИЛА!!!',
'Мои ноги восстали против меня и устроили забастовку',
'Пришлось решать мировые проблемы со своим котом',
'Попал в воронку времени и потерял несколько часов',
'Меня смыло вместе с ванной во время принятия душа',
'Украли все мои штаны',
'Навык дыхания покинул меня, и мне пришлось потратить время на его восстановление']

const [...ad]:Array<any> = await prdb.execute(`
SELECT * FROM praktyka.schedule_group
join group_user on group_user.group_id = schedule_group.group_id
having group_user.group_id = 2`)
const a:any = ad[0]
console.log(a)
a.map(async (el:any)=>{
    const a = getRandomNumber(1,3)
    const b = getRandomNumber(0, prichiny.length-1)
    let pric
    if (a === 2){
        pric = prichiny[b]
    }else{
        pric = ''
    }

    console.log(Number(el.user_id), Number(el.schedule_id), a, pric)
    await prdb.execute(`
    INSERT INTO schedule_user (users_user_id, schedule_schedule_id, visit, discription)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    visit = VALUES(visit),
    discription = VALUES(discription);
    `, [Number(el.user_id), Number(el.schedule_id), a, pric])
})


function getRandomNumber(min: number, max: number): number {
  // Генерируем случайное число между 0 и 1
  const random = Math.random();

  // Масштабируем случайное число на заданный диапазон
  const scaled = random * (max - min + 1);

  // Округляем вниз до целого числа и смещаем на минимальное значение
  const result = Math.floor(scaled) + min;

  return result;
}

*/
/*
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id
having date >= ? and date <= ? and teacher_id = ? and subject_id = ?
order by date, student_id
*/

/*
const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and subject_id = ? and group_id = ?
order by date, c.group_id
                      `, ["2023-05-01", "2023-05-31", 4, 7, 2])
const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
function groupBy(array: any[], key: string): { [key: string]: any[] } {
  return array.reduce((result: any, currentValue: any) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
}
const statisticResponse : IStatisticResponse = {sd: []}
console.log("TS(suid): ",tstatic)
function distributeData(data: any[]): IStatisticResponse {
  const statisticData: IStatisticDayData[] = [];

  // Группируем данные по дате
  const groupedData = groupBy(data, 'date');
  // Обрабатываем каждую группу
  for (const date in groupedData) {
    if (groupedData.hasOwnProperty(date)) {
      const group = groupedData[date];
      const statisticDayData: IStatisticDayData = {
        d: formatDateWS(new Date(date)),
        m: group.length,
        r: 0,
        nr: 0,
        e: 0
      };

      // Обрабатываем каждый элемент группы
      group.forEach((item: any) => {
        statisticDayData.r += item.visit_respect_count;
        statisticDayData.nr += item.visit_norespect_count;
        statisticDayData.e += item.visit_exist_count;
      });

      statisticData.push(statisticDayData);
    }
  }

  return {
    sd: statisticData
  };
}


const result = distributeData(tstatic);
console.log(result);
*/




const [...bsqdirt]:any[] = await prdb.execute(`
with 
f as (SELECT 
date, 
teacher_id,
schedule_id,
(select subject_name from subjects where subjects.subject_id = schedule.subject_id) as subject_name,
(select subject_id from subjects where subjects.subject_id = schedule.subject_id) as subject_id,
(select subject_type_name from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type_name,
(select subject_type_id from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type_id
FROM schedule),
i as (
SELECT user_id as student_id, group_id,
(select concat(last_name, ' ', SUBSTRING(first_name, 1, 1), '. ', SUBSTRING(middle_name, 1, 1), '.') from users where praktyka.group_user.user_id = users.user_id) as student_name
FROM praktyka.group_user
)
SELECT   *, 
(select group_name from praktyka.groups where praktyka.schedule_group.group_id = praktyka.groups.group_id and praktyka.schedule_group.schedule_id = f.schedule_id) as group_name
FROM praktyka.schedule_group
join f on f.schedule_id = praktyka.schedule_group.schedule_id
join i on schedule_group.group_id = i.group_id
having date >= "2023-05-01" and date <= "2023-05-31" and student_id = 2
order by f.date
                          `);
const bsq:Array<IBeforeStatisticRequestDB> = bsqdirt[0];
console.log('bsq: ', bsq);
let sus:Array<{
    n: string, // subjects
    id: string
}> = []
let gs:Array<{
    n: string, // groups
    id: string // groups_id
}> = []
let ss:Array<{
    n: string, // students
    id: string // students_id
}> = []
let sts:Array<{
    n: string,
    id: string
}> = []
bsq.map((el:IBeforeStatisticRequestDB)=>{
    sus.push({
        n: el.subject_name,
        id: String(el.subject_id)
    });
    gs.push({
        n: el.group_name,
        id: String(el.group_id)
    });
    ss.push({
        n: el.student_name,
        id: String(el.student_id)
    });
    sts.push({
        n: el.subject_type_name,
        id: String(el.subject_type_id)
    })
})
const uniqueSu: Array<{ n: string; id: string }> = Array.from(
  new Map(sus.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
);
const uniqueG: Array<{ n: string; id: string }> = Array.from(
  new Map(gs.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
);
const uniqueSt: Array<{ n: string; id: string }> = Array.from(
  new Map(ss.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
);
const uniqueSut: Array<{ n: string; id: string }> = Array.from(
  new Map(sts.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
);
const beforeResp:IBeforeStatisticResponse = {
    su: uniqueSu, // subjects
    g: uniqueG, // group
    st: uniqueSt, // students
    sut: uniqueSut
}
console.log(beforeResp)






// console.log(secretKey)
// console.log(secretKey.toString('base64'))
// console.log("sa",Buffer.from(secretKey))
const wss = new WebSocketServer({ server: httpServer });
const { publicKey, privateKey }: KeyPairKeyObjectResult = crypto.generateKeyPairSync('rsa', {
    modulusLength: 1024,
});

const keys: KeyPair = { publicKey: publicKey.export({ type: 'pkcs1', format: 'pem' }), privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }) };
console.log(publicKey, privateKey)
wss.on('connection', function connection(ws:WebSocket, req:IncomingMessage) {
  const secretKey = crypto.randomBytes(32);
  const ip = req.socket.remoteAddress;
  ws.on('error', console.error);
  console.log("Client connected", ip)
  // ws.send(`-1:${secretKey.toString('base64')}`);
  // console.log(secretKey.toString('base64'))
  // console.log(secretKey)
  // console.log(Buffer.from(secretKey.toString('base64')))
  let session:SessionType = {
      sessionKey: crypto.randomBytes(32).toString('base64'),
      userId: null,
      role: null
  }

  const cheakAuth = false;
  // const encryptedMessage = encryptMessage(`1:Hello from server`, secretKey);
  // ws.send(encryptedMessage);
  // console.log(encryptedMessage)
  ws.on('message', async (encryptedMessage) => {
    // console.log(`Received message: `, encryptedMessage);
    // Расшифровываем полученное сообщение
      const split = splitMsg(encryptedMessage.toString())
      if (split.encryptedType !== MessageEnum.rsaKey){
          const decryptedMessage = String(decryptMessage(Buffer.from(encryptedMessage.toString(), 'base64'), secretKey));
          const {encryptedType, encryptedData} = splitMsg(decryptedMessage)
          // console.log(encryptedData, encryptedType)
          let data: any
          let type: string | null;


          switch (encryptedType) {
              case MessageEnum.none:
                  data = null
                  type = null
                  break
              case MessageEnum.message:
                  data = String(encryptedData)
                  break
              case MessageEnum.loginData:
                  data = JSON.parse(encryptedData)
                  const pass_hash = textToSHA256(data.password)
                  const [...usersdirt]:any = await prdb.execute(`select * from users WHERE login = ? AND password_hash = ?`,[data.login, pass_hash]);
                  const users:Array<IUserData> = usersdirt[0];
                  if (users.length>0){
                      const user:IUserData = users[0]
                      session.userId = usersdirt[0][0].user_id
                      session.role = usersdirt[0][0].role_id
                      console.log('usid', session.userId, session.role)
                      const userData:IUserData = {
                          login: user.login,
                          first_name: user.first_name,
                          middle_name: user.middle_name,
                          last_name: user.last_name,
                          role_id: user.role_id,
                          email: user.email,
                          phone: user.phone,
                          session_key: session.sessionKey,
                      };
                      // console.log('UD: ',userData)
                      const encryptedMessage = encryptMessage(`3:${JSON.stringify(userData)}`, secretKey);
                      ws_Send(ws, encryptedMessage)
                  }else{
                      const encryptedMessage = encryptMessage(`1:Вы ввели неверный логин или пароль`, secretKey);
                      ws_Send(ws, encryptedMessage)
                  }
                  break
              case MessageEnum.userData:
                  data = JSON.parse(encryptedData)
                  break
              case MessageEnum.weekRequest:
                  data = JSON.parse(encryptedData)
                  if (data.session_key === session.sessionKey){
                      const [year, month, day] = data.day.split('-');

                      console.log(Number(year)); // '2023'
                      console.log(Number(month)); // '05'
                      console.log(Number(day)); // '18'
                      const currentDate = new Date(Number(year), Number(month)-1, Number(day)); // Используйте нужную вам дату
                      console.log(currentDate, data.day)
                      const startOfWeek = formatDate(getStartOfWeek(currentDate))
                      const endOfWeek = formatDate(getEndOfWeek(currentDate))
                      console.log(startOfWeek, endOfWeek)
                      if (session.role === RolesEnum.student){
                          const [...weekdirt]:Array<any> = await prdb.execute(`
with 
f as (SELECT 
date, 
pair_number, 
teacher_id,
schedule_id,
(select CONCAT(last_name, ' ',  SUBSTRING(first_name, 1, 1), '. ', SUBSTRING(middle_name, 1, 1), '.') from users where schedule.teacher_id = users.user_id) as teacher_name,
(select position from users where schedule.teacher_id = users.user_id) as teacher_position,
(select subject_name from subjects where subjects.subject_id = schedule.subject_id) as subject_name,
(select room_number from rooms where rooms.room_id = schedule.room_id) as room_number,
(select subject_type_name from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type
FROM schedule),

i as (
SELECT user_id as student_id, group_id
#(select first_name from users where praktyka.group_user.user_id = users.user_id) as Name 
FROM praktyka.group_user
)

SELECT   *, 
(select group_name from praktyka.groups where praktyka.schedule_group.group_id = praktyka.groups.group_id and praktyka.schedule_group.schedule_id = f.schedule_id) as group_name,
(select users_user_id from schedule_user where student_id = schedule_user.users_user_id and f.schedule_id = schedule_user.schedule_schedule_id) as users_user_id,
(select visit from schedule_user where student_id = schedule_user.users_user_id and f.schedule_id = schedule_user.schedule_schedule_id) as visit,
(select discription from schedule_user where student_id = schedule_user.users_user_id and f.schedule_id = schedule_user.schedule_schedule_id) as discription



FROM praktyka.schedule_group
join f on f.schedule_id = praktyka.schedule_group.schedule_id
join i on schedule_group.group_id = i.group_id
having date >= ? and date <= ? and student_id = ?
order by f.date
                `, [startOfWeek, endOfWeek, session.userId])
                          const week:Array<WeekDB> = weekdirt[0];
                          // console.log("week", week)


                          const schedules: IDaySchedule[] = [];
                          let currentDay: Date | null = null;
                          let currentPairs: IPairSchedule[] = [];

                          for (const row of week) {
                              const { date, pair_number, teacher_id, teacher_name, teacher_position, subject_name, room_number, subject_type, visit, discription, student_id, schedule_id } = row;
                              // Convert the date string to a JavaScript Date object
                              const day = new Date(date);

                              // If the current day is null or different from the previous row, start a new day
                              if (currentDay === null || !isSameDay(currentDay, day)) {
                                  // Add the previous day's pairs to the schedules array
                                  if (currentDay !== null && currentPairs.length > 0) {
                                      schedules.push({ p: currentPairs, d: formatDateWS(currentDay) });
                                  }

                                  // Start a new day with an empty pairs array
                                  currentDay = day;
                                  currentPairs = [];
                              }

                              // Create a new pair schedule object
                              const pair: IPairSchedule = {
                                  su:subject_name,
                                  st:subject_type,
                                  r:room_number,
                                  p:pair_number,
                                  sc_id:schedule_id,
                                  us: []
                              };
                              // console.log(discription)
                              // Add the user to the pair's users array
                              pair.us.push({
                                  u: String(teacher_id),
                                  n: teacher_name,
                                  g: teacher_position,
                                  r: discription==null ? '' : discription,
                                  m: visit==null ? 0 : visit
                              });

                              // Add the pair to the current day's pairs array
                              currentPairs.push(pair);
                          }

// Add the last day's pairs to the schedules array
                          if (currentDay !== null && currentPairs.length > 0) {
                              schedules.push({ p: currentPairs, d: formatDateWS(currentDay) });
                          }

// Create the final week response object
                          const weekResponse: IWeekResponse = { sc:schedules };

// Helper function to check if two dates represent the same day

                          // console.log(weekResponse)
                          console.log(JSON.stringify(weekResponse))


                          const encryptWeekResponse = encryptMessage(`${MessageEnum.weekResponse}:${JSON.stringify(weekResponse)}`, secretKey)
                          // console.log(encryptWeekResponse)
                          ws_Send(ws, encryptWeekResponse)
                      }
                      else if (session.role === RolesEnum.teacher){
                          const [...pairsdirt]:Array<any> = await prdb.execute(`
WITH a AS (
SELECT *
FROM praktyka.group_user
),
c as (
SELECT * FROM praktyka.schedule_user
),
b as (
SELECT
schedule_group.group_id,
schedule_group.schedule_id as sch_id,
users.user_id as student_id,
(select group_name from praktyka.groups where schedule_group.group_id = praktyka.groups.group_id) as group_name,
GROUP_CONCAT(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name ) SEPARATOR '; ') AS students
FROM
praktyka.schedule_group
JOIN a ON a.group_id = schedule_group.group_id
JOIN users ON users.user_id = a.user_id
GROUP BY
schedule_group.group_id,
schedule_group.schedule_id,
users.user_id
)
SELECT 
date, 
pair_number, 
teacher_id,
schedule_id,

(select subject_name from subjects where subjects.subject_id = schedule.subject_id) as subject_name,
(select room_number from rooms where rooms.room_id = schedule.room_id) as room_number,
(select subject_type_name from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type,
student_id,
group_name,
students,
visit,
discription

FROM schedule
join b on schedule.schedule_id = b.sch_id
LEFT JOIN c ON c.users_user_id = student_id AND c.schedule_schedule_id = schedule_id
having date >= ? and date <= ? and teacher_id = ?
order by date
                `, [startOfWeek, endOfWeek, session.userId])
                          const pairs:Array<TeacherTypes> = pairsdirt[0];
                          // console.log("Pairs:\n",pairs)
                          const pairsResponse: IWeekResponse = convertToPairsResponse(pairs);
                          // pairsResponse.schedules.map((el:IDaySchedule)=>{
                          //     console.log(el)
                          //     el.pairs.map((ell)=>{
                          //         console.log(ell.users)
                          //     })
                          // })
                          console.log(JSON.stringify(pairsResponse))
                          const encryptPairsResponse = encryptMessage(`${MessageEnum.weekResponse}:${JSON.stringify(pairsResponse)}`, secretKey)
                          ws_Send(ws, encryptPairsResponse)

                      }
                  }
                  break
              case MessageEnum.checkData:
                  data = JSON.parse(encryptedData)
                  console.log(data)
                  const forUpdateVisit : CheckData = data
                  const [...subjectdirt]:any = await prdb.execute(`
                      SELECT subject_id, type_id FROM schedule where schedule_id = ?
                      `, [forUpdateVisit.sc_id])
                  const {subject_id, type_id} = subjectdirt[0][0]
                  forUpdateVisit.cu.map( async (el:CheckUserData)=>{
                      console.log(Number(el.u), forUpdateVisit.sc_id, el.m, el.r)
                      await prdb.execute(`INSERT INTO schedule_user (users_user_id, schedule_schedule_id, visit, discription)
                                            VALUES (?, ?, ?, ?)
                                            ON DUPLICATE KEY UPDATE
                                              visit = VALUES(visit),
                                              discription = VALUES(discription);

                        `, [Number(el.u), Number(forUpdateVisit.sc_id), Number(el.m), String(el.r)])
                      const [...emaildirt]:any = await prdb.execute(`
                            select email, CONCAT(last_name, ' ', first_name, ' ', middle_name ) as student_name from users where user_id = ?
                    `, [Number(el.u)])
                      const {email, student_name} = emaildirt[0][0]
                      const [...pairDatedirt]:any = await prdb.execute(`
                            SELECT date FROM schedule where schedule_id = ?
                    `, [Number(forUpdateVisit.sc_id)])
                      const pairDate = pairDatedirt[0][0].date

                      const [...statisticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id FROM schedule
)
SELECT
(select subject_name from subjects where subjects.subject_id = a.subject_id) as subject_name,
(select subject_type_name from subject_type where subject_type.subject_type_id = a.type_id) as subject_type,
users_user_id AS student_id, 
COUNT(visit) AS visit_count, 
sum((select count(visit) from schedule_user where e.users_user_id = schedule_user.users_user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2)) AS visit_respect_count,
sum((select count(visit) from schedule_user where e.users_user_id = schedule_user.users_user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1)) AS visit_norespect_count,
sum((select count(visit) from schedule_user where e.users_user_id = schedule_user.users_user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 3)) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
GROUP BY users_user_id, subject_id, type_id
having student_id = ? and subject_id = ? and type_id = ?
order by subject_id
                    `, [Number(el.u), Number(subject_id), Number(type_id)])
                      const statistic : ISubjectStatistic = statisticdirt[0][0]
                      console.log('s name: ', forUpdateVisit.su)
                      console.log('email: ', email)
                      console.log('name: ', student_name)
                      console.log('date: ', formatDateEmail(pairDate))
                      console.log('statistic',statistic)
                      if (Number(el.m) === 1 || Number(el.m) === 2){
                        sendEmail(Number(el.u), email, Number(el.m), String(el.r), String(forUpdateVisit.su), formatDateEmail(pairDate), student_name, statistic)
                      }
                  })

                  break
              case MessageEnum.statisticRequest:
                  data = JSON.parse(encryptedData)

                  const statisticRequest:IStatisticRequest = data
                  console.log("SR2: ", statisticRequest)
                  if (session.sessionKey === statisticRequest.sk){
                      console.log(session.role)
                      if (session.role === RolesEnum.teacher){
                          if (statisticRequest.su_id === '' && statisticRequest.g_id === '' && statisticRequest.st_id === '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
                      SELECT 
                        date,
                        teacher_id,
                        schedule_id,
                        (select count(users_user_id) from schedule_user where schedule.schedule_id = schedule_user.schedule_schedule_id) as count_students,
                        (select count(users_user_id) from schedule_user where schedule.schedule_id = schedule_user.schedule_schedule_id and visit = 3) as count_existed_students,
                        (select count(users_user_id) from schedule_user where schedule.schedule_id = schedule_user.schedule_schedule_id and visit = 2) as count_respect_students,
                        (select count(users_user_id) from schedule_user where schedule.schedule_id = schedule_user.schedule_schedule_id and visit = 1) as count_norespect_students
                        FROM schedule
                        having date >= ? and date <= ? and teacher_id = ?
                        ORDER BY date;
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId)])
                              const tstatic : Array<IDBTStatic> = tstaticdirt[0]
                              const statisticResponse : IStatisticResponse = {sd: []}
                              console.log("TS: ",tstatic)
                              tstatic.map((el:IDBTStatic)=>{
                                  statisticResponse.sd.push({
                                      d: formatDateWS(el.date),
                                      m: el.count_students,
                                      r: el.count_respect_students,
                                      nr: el.count_norespect_students,
                                      e: el.count_existed_students
                                  })
                              })
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id === '' && statisticRequest.st_id === '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id
having date >= ? and date <= ? and teacher_id = ? and subject_id = ?
order by date, student_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.su_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id === '' && statisticRequest.g_id !== '' && statisticRequest.st_id === '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and group_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.g_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id === '' && statisticRequest.g_id === '' && statisticRequest.st_id !== '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and student_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.st_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id === '' && statisticRequest.g_id === '' && statisticRequest.st_id === '' && statisticRequest.sut_id !== '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and subject_type_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.sut_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id !== '' && statisticRequest.st_id === '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and subject_id = ? and group_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.su_id), Number(statisticRequest.g_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id !== '' && statisticRequest.st_id !== '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and subject_id = ? and group_id = ? and student_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.su_id), Number(statisticRequest.g_id), Number(statisticRequest.st_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id === '' && statisticRequest.g_id !== '' && statisticRequest.st_id !== '' && statisticRequest.sut_id !== '')
                          {
                              // Код для случая, когда g_id не равно '' и st_id, sut_id не равны ''
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and subject_type_id = ? and group_id = ? and student_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.sut_id), Number(statisticRequest.g_id), Number(statisticRequest.st_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id === '' && statisticRequest.st_id !== '' && statisticRequest.sut_id !== '')
                          {
                              // Код для случая, когда su_id не равно '' и st_id, sut_id не равны ''
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and subject_type_id = ? and subject_id = ? and student_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.sut_id), Number(statisticRequest.su_id), Number(statisticRequest.st_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id !== '' && statisticRequest.st_id === '' && statisticRequest.sut_id !== '')
                          {
                              // Код для случая, когда su_id, g_id не равны '' и st_id, sut_id не равны ''
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and group_id = ? and subject_id = ? and subject_type_id = ?
order by date, c.group_id
`, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.g_id), Number(statisticRequest.su_id), Number(statisticRequest.sut_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id !== '' && statisticRequest.st_id !== '' && statisticRequest.sut_id !== '')
                          {
                              // Код для случая, когда все значения не равны ''
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and teacher_id = ? and group_id = ? and subject_id = ? and student_id = ? and subject_type_id = ?
order by date, c.group_id
`, [statisticRequest.fd, statisticRequest.td, Number(session.userId), Number(statisticRequest.g_id), Number(statisticRequest.su_id), Number(statisticRequest.st_id), Number(statisticRequest.sut_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                      }
                      else if (session.role === RolesEnum.student){
                            /*
                          const [...sstaticdirt]:any = await prdb.execute(`
                      WITH a AS (
                                  SELECT schedule_id, date FROM schedule
                                )
                                SELECT date, users_user_id AS student_id, COUNT(visit) AS visit_count,
                                sum((select count(visit) from schedule_user where e.users_user_id = schedule_user.users_user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2)) AS visit_respect_count,
                                sum((select count(visit) from schedule_user where e.users_user_id = schedule_user.users_user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1)) AS visit_norespect_count,
                                sum((select count(visit) from schedule_user where e.users_user_id = schedule_user.users_user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 3)) AS visit_exist_count
                                FROM praktyka.schedule_user e
                                JOIN a ON a.schedule_id = e.schedule_schedule_id
                                GROUP BY date, users_user_id
                                having date >= ? AND date <= ? AND student_id = ?
                                ORDER BY date;
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId)])
                          const sstatic : Array<IDBSStatic> = sstaticdirt[0]
                          console.log("sss",sstatic)
                          const statisticResponse : IStatisticResponse = {sd: []}
                          console.log("SS: ", sstatic)
                          sstatic.map((el:IDBSStatic)=>{
                              statisticResponse.sd.push({
                                  d: formatDateWS(el.date),
                                  m: el.visit_count,
                                  r: el.visit_respect_count,
                                  nr: el.visit_norespect_count,
                                  e: el.visit_exist_count
                              })
                          })
                          console.log("SR: ",statisticResponse)
                          const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                          ws_Send(ws, encryptStatisticResponse)
                          */
                          if (statisticRequest.su_id === '' && statisticRequest.g_id === '' && statisticRequest.st_id === '' && statisticRequest.sut_id === '')
                          {
                              const [...groupdirt]:any = await prdb.execute(`SELECT group_id FROM group_user where user_id = ?`, [Number(session.userId)])
                              const group:number = groupdirt[0][0].group_id
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and group_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(group)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id === '' && statisticRequest.st_id === '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id
having date >= ? and date <= ? and subject_id = ?
order by date, student_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.su_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id === '' && statisticRequest.g_id !== '' && statisticRequest.st_id === '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and group_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.g_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id === '' && statisticRequest.g_id === '' && statisticRequest.st_id !== '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and student_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.st_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id === '' && statisticRequest.g_id === '' && statisticRequest.st_id === '' && statisticRequest.sut_id !== '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and subject_type_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.sut_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id !== '' && statisticRequest.st_id === '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and subject_id = ? and group_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.su_id), Number(statisticRequest.g_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id !== '' && statisticRequest.st_id !== '' && statisticRequest.sut_id === '')
                          {
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and subject_id = ? and group_id = ? and student_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.su_id), Number(statisticRequest.g_id), Number(statisticRequest.st_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id === '' && statisticRequest.g_id !== '' && statisticRequest.st_id !== '' && statisticRequest.sut_id !== '')
                          {
                              // Код для случая, когда g_id не равно '' и st_id, sut_id не равны ''
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and subject_type_id = ? and group_id = ? and student_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.sut_id), Number(statisticRequest.g_id), Number(statisticRequest.st_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id === '' && statisticRequest.st_id !== '' && statisticRequest.sut_id !== '')
                          {
                              // Код для случая, когда su_id не равно '' и st_id, sut_id не равны ''
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and subject_type_id = ? and subject_id = ? and student_id = ?
order by date, c.group_id
                      `, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.sut_id), Number(statisticRequest.su_id), Number(statisticRequest.st_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id !== '' && statisticRequest.st_id === '' && statisticRequest.sut_id !== '')
                          {
                              // Код для случая, когда su_id, g_id не равны '' и st_id, sut_id не равны ''
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and group_id = ? and subject_id = ? and subject_type_id = ?
order by date, c.group_id
`, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.g_id), Number(statisticRequest.su_id), Number(statisticRequest.sut_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                          else if (statisticRequest.su_id !== '' && statisticRequest.g_id !== '' && statisticRequest.st_id !== '' && statisticRequest.sut_id !== '')
                          {
                              // Код для случая, когда все значения не равны ''
                              const [...tstaticdirt]:any = await prdb.execute(`
WITH a AS (
  SELECT schedule_id, subject_id, type_id, teacher_id, date FROM schedule
),
b as (
select * from schedule_group
),
c as (
select * from group_user
)
SELECT
date,
teacher_id,
b.group_id,
c.user_id as student_id,
(select subject_id from subjects where subjects.subject_id = a.subject_id) as subject_id,
(select subject_type_id from subject_type where subject_type.subject_type_id = a.type_id) as subject_type_id,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id) AS visit_count, 
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 2) AS visit_respect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and a.schedule_id = schedule_user.schedule_schedule_id and visit = 1) AS visit_norespect_count,
(select count(visit) from schedule_user where schedule_user.users_user_id = c.user_id and  a.schedule_id = schedule_user.schedule_schedule_id and visit = 3) AS visit_exist_count
FROM praktyka.schedule_user e
JOIN a ON a.schedule_id = e.schedule_schedule_id
join b on b.schedule_id = e.schedule_schedule_id
join c on b.group_id = c.group_id
GROUP BY subject_id, type_id, teacher_id, a.schedule_id,  user_id, group_id
having date >= ? and date <= ? and group_id = ? and subject_id = ? and student_id = ? and subject_type_id = ?
order by date, c.group_id
`, [statisticRequest.fd, statisticRequest.td, Number(statisticRequest.g_id), Number(statisticRequest.su_id), Number(statisticRequest.st_id), Number(statisticRequest.sut_id)])
                              const tstatic : Array<IDBTStaticSU> = tstaticdirt[0]
                              console.log("TS(suid-gid): ",tstatic)
                              const statisticResponse = distributeData(tstatic)
                              const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey)
                              ws_Send(ws, encryptStatisticResponse)
                          }
                      }
                  }

                  break
              case MessageEnum.beforeStatisticRequest:
                  data = JSON.parse(encryptedData)
                  const beforeReq:IBeforeStatisticRequest = data
                  console.log("BRQ: ",beforeReq)
                  if (session.sessionKey === beforeReq.sk){
                      if (session.role === RolesEnum.teacher){
                          console.log("BR: ",beforeReq)
                          const [...bsqdirt]:any[] = await prdb.execute(`
with 
f as (SELECT 
date, 
teacher_id,
schedule_id,
(select subject_name from subjects where subjects.subject_id = schedule.subject_id) as subject_name,
(select subject_id from subjects where subjects.subject_id = schedule.subject_id) as subject_id,
(select subject_type_name from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type_name,
(select subject_type_id from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type_id
FROM schedule),
i as (
SELECT user_id as student_id, group_id,
(select concat(last_name, ' ', SUBSTRING(first_name, 1, 1), '. ', SUBSTRING(middle_name, 1, 1), '.') from users where praktyka.group_user.user_id = users.user_id) as student_name
FROM praktyka.group_user
)
SELECT   *, 
(select group_name from praktyka.groups where praktyka.schedule_group.group_id = praktyka.groups.group_id and praktyka.schedule_group.schedule_id = f.schedule_id) as group_name
FROM praktyka.schedule_group
join f on f.schedule_id = praktyka.schedule_group.schedule_id
join i on schedule_group.group_id = i.group_id
having date >= ? and date <= ? and teacher_id = ? ${beforeReq.su_id !== '' ? `and subject_id = ${Number(beforeReq.su_id)}` : ``}
order by f.date
                          `, [String(beforeReq.fd), String(beforeReq.td), Number(session.userId)]);
                          const bsq:Array<IBeforeStatisticRequestDB> = bsqdirt[0];
                          console.log('bsq: ', bsq);
                          let sus:Array<{
                              n: string, // subjects
                              id: string
                          }> = []
                          let gs:Array<{
                              n: string, // groups
                              id: string // groups_id
                          }> = []
                          let ss:Array<{
                              n: string, // students
                              id: string // students_id
                          }> = []
                          let sts:Array<{
                              n: string,
                              id: string
                          }> = []
                          bsq.map((el:IBeforeStatisticRequestDB)=>{
                              sus.push({
                                  n: el.subject_name,
                                  id: String(el.subject_id)
                              });
                              gs.push({
                                  n: el.group_name,
                                  id: String(el.group_id)
                              });
                              ss.push({
                                  n: el.student_name,
                                  id: String(el.student_id)
                              });
                              sts.push({
                                  n: el.subject_type_name,
                                  id: String(el.subject_type_id)
                              })
                          })
                          const uniqueSu: Array<{ n: string; id: string }> = Array.from(
                              new Map(sus.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
                          );
                          const uniqueG: Array<{ n: string; id: string }> = Array.from(
                              new Map(gs.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
                          );
                          const uniqueSt: Array<{ n: string; id: string }> = Array.from(
                              new Map(ss.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
                          );
                          const uniqueSut: Array<{ n: string; id: string }> = Array.from(
                              new Map(sts.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
                          );
                          const beforeResp:IBeforeStatisticResponse = {
                              su: uniqueSu, // subjects
                              g: uniqueG, // group
                              st: uniqueSt, // students
                              sut: uniqueSut
                          }
                          console.log(beforeResp)
                          const encryptBeforeResponse = encryptMessage(`${MessageEnum.beforeStatisticResponse}:${JSON.stringify(beforeResp)}`, secretKey)
                          ws_Send(ws, encryptBeforeResponse)
                      }
                      else if (session.role === RolesEnum.student){
                          console.log("BR: ",beforeReq)
                          const [...bsqdirt]:any[] = await prdb.execute(`
with 
f as (SELECT 
date, 
teacher_id,
schedule_id,
(select subject_name from subjects where subjects.subject_id = schedule.subject_id) as subject_name,
(select subject_id from subjects where subjects.subject_id = schedule.subject_id) as subject_id,
(select subject_type_name from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type_name,
(select subject_type_id from subject_type where subject_type.subject_type_id = schedule.type_id) as subject_type_id
FROM schedule),
i as (
SELECT user_id as student_id, group_id,
(select concat(last_name, ' ', SUBSTRING(first_name, 1, 1), '. ', SUBSTRING(middle_name, 1, 1), '.') from users where praktyka.group_user.user_id = users.user_id) as student_name
FROM praktyka.group_user
)
SELECT   *, 
(select group_name from praktyka.groups where praktyka.schedule_group.group_id = praktyka.groups.group_id and praktyka.schedule_group.schedule_id = f.schedule_id) as group_name
FROM praktyka.schedule_group
join f on f.schedule_id = praktyka.schedule_group.schedule_id
join i on schedule_group.group_id = i.group_id
having date >= ? and date <= ? and student_id = ? ${beforeReq.su_id !== '' ? `and subject_id = ${Number(beforeReq.su_id)}` : ``} ${beforeReq.sut_id !== '' ? `and subject_type_id = ${Number(beforeReq.sut_id)}` : ``}
order by f.date
                          `, [String(beforeReq.fd), String(beforeReq.td), Number(session.userId)]);
                          const bsq:Array<IBeforeStatisticRequestDB> = bsqdirt[0];
                          console.log('bsq: ', bsq);
                          let sus:Array<{
                              n: string, // subjects
                              id: string
                          }> = []
                          let gs:Array<{
                              n: string, // groups
                              id: string // groups_id
                          }> = []
                          let ss:Array<{
                              n: string, // students
                              id: string // students_id
                          }> = []
                          let sts:Array<{
                              n: string,
                              id: string
                          }> = []
                          bsq.map((el:IBeforeStatisticRequestDB)=>{
                              sus.push({
                                  n: el.subject_name,
                                  id: String(el.subject_id)
                              });
                              gs.push({
                                  n: el.group_name,
                                  id: String(el.group_id)
                              });
                              ss.push({
                                  n: el.student_name,
                                  id: String(el.student_id)
                              });
                              sts.push({
                                  n: el.subject_type_name,
                                  id: String(el.subject_type_id)
                              })
                          })
                          const uniqueSu: Array<{ n: string; id: string }> = Array.from(
                              new Map(sus.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
                          );
                          const uniqueG: Array<{ n: string; id: string }> = Array.from(
                              new Map(gs.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
                          );
                          const uniqueSt: Array<{ n: string; id: string }> = Array.from(
                              new Map(ss.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
                          );
                          const uniqueSut: Array<{ n: string; id: string }> = Array.from(
                              new Map(sts.map((obj) => [`${obj.n}-${obj.id}`, obj])).values()
                          );
                          const beforeResp:IBeforeStatisticResponse = {
                              su: uniqueSu, // subjects
                              g: uniqueG, // group
                              st: uniqueSt, // students
                              sut: uniqueSut
                          }
                          console.log(beforeResp)
                          const encryptBeforeResponse = encryptMessage(`${MessageEnum.beforeStatisticResponse}:${JSON.stringify(beforeResp)}`, secretKey)
                          ws_Send(ws, encryptBeforeResponse)
                      }

                  }
                  break
              case MessageEnum.rsaKey:
                  data = String(encryptedData)
                  console.log("RSA",data)
                  break
              default:
                  type = "default"
                  data = String(encryptedData)
                  break
          }
          console.log(`Decrypted message:`, data);
          // const users = await prdb.execute('SELECT * FORM users ');

          // console.log(encryptedMessage1)
      }else if (split.encryptedType === MessageEnum.rsaKey){
        console.log(split.encryptedData)
          const publickKeyObject = crypto.createPublicKey({
              key: split.encryptedData,
              format: 'pem',
              type: 'pkcs1'
          });
          console.log(publickKeyObject)
          publickKeyObject.export({ format: 'pem', type: 'pkcs1' });
          console.log(publickKeyObject.export({ format: 'pem', type: 'pkcs1' }))
          try {
              const encryptedSecretKey = crypto.publicEncrypt({
                  key: publickKeyObject,
                  oaepHash: 'sha1',
                  padding: crypto.constants.RSA_PKCS1_PADDING
              }, Buffer.from(secretKey.toString('base64')));
              console.log(encryptedSecretKey.toString('base64'))
              ws_Send(ws, `${MessageEnum.secretKey}:${encryptedSecretKey.toString('base64')}`)
          }catch (e){
              console.log('Decrypt error: ', e)
          }

      }

  });
  ws.on('close', () => {
    console.log(`Client disconnected: ${ip}`);
  });
});
function decryptMessage(encryptedMessage: Buffer, key: Buffer) {
    try {
        const keyBytes = key;
        const iv = Buffer.alloc(16);

        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBytes, iv);

        let decrypted = decipher.update(encryptedMessage);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted;
    }catch (e) {
        return e
    }

}
function encryptMessage(message: string, key: Buffer): string {
    const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(message, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}




const port = 5001





app.get('/', (req:Request, res:Response) => {
  res.send('Praktika Server');
});

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});



