import express from "express";
import * as http from 'http';
import { WebSocketServer } from 'ws';
import * as mysql from 'mysql2/promise';
import * as crypto from "crypto";
import { formatDate, formatDateEmail, formatDateWS, getEndOfWeek, getStartOfWeek, isSameDay } from "./functions/Dates.js";
import { ws_Send } from "./functions/bigWsSend.js";
import { MessageEnum } from "./types/MessagesEnum.js";
import { splitMsg } from "./functions/splitMsg.js";
import { RolesEnum } from "./types/RolesEnum.js";
import { convertToPairsResponse } from "./functions/pairsResponse.js";
import { sendEmail } from "./functions/sendEmail.js";
const app = express();
const httpServer = http.createServer(app);
const mess = "Hello";
console.log(mess);
const textToSHA256 = (text) => {
    return crypto.createHash('sha256').update(text).digest('hex');
};
const DBconnectionConfig = {
    password: '12345',
    database: 'praktyka',
    port: '3306',
    host: '127.0.0.1',
    user: 'root'
};
const prdb = await mysql.createConnection(DBconnectionConfig);
const wss = new WebSocketServer({ server: httpServer });
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 1024,
});
const keys = { publicKey: publicKey.export({ type: 'pkcs1', format: 'pem' }), privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }) };
console.log(publicKey, privateKey);
wss.on('connection', function connection(ws, req) {
    const secretKey = crypto.randomBytes(32);
    const ip = req.socket.remoteAddress;
    ws.on('error', console.error);
    console.log("Client connected", ip);
    let session = {
        sessionKey: crypto.randomBytes(32).toString('base64'),
        userId: null,
        role: null
    };
    const cheakAuth = false;
    ws.on('message', async (encryptedMessage) => {
        const split = splitMsg(encryptedMessage.toString());
        if (split.encryptedType !== MessageEnum.rsaKey) {
            const decryptedMessage = String(decryptMessage(Buffer.from(encryptedMessage.toString(), 'base64'), secretKey));
            const { encryptedType, encryptedData } = splitMsg(decryptedMessage);
            let data;
            let type;
            switch (encryptedType) {
                case MessageEnum.none:
                    data = null;
                    type = null;
                    break;
                case MessageEnum.message:
                    data = String(encryptedData);
                    break;
                case MessageEnum.loginData:
                    data = JSON.parse(encryptedData);
                    const pass_hash = textToSHA256(data.password);
                    const [...usersdirt] = await prdb.execute(`select * from users WHERE login = ? AND password_hash = ?`, [data.login, pass_hash]);
                    const users = usersdirt[0];
                    if (users.length > 0) {
                        const user = users[0];
                        session.userId = usersdirt[0][0].user_id;
                        session.role = usersdirt[0][0].role_id;
                        console.log('usid', session.userId, session.role);
                        const userData = {
                            login: user.login,
                            first_name: user.first_name,
                            middle_name: user.middle_name,
                            last_name: user.last_name,
                            role_id: user.role_id,
                            email: user.email,
                            phone: user.phone,
                            session_key: session.sessionKey,
                        };
                        const encryptedMessage = encryptMessage(`3:${JSON.stringify(userData)}`, secretKey);
                        ws_Send(ws, encryptedMessage);
                    }
                    else {
                        const encryptedMessage = encryptMessage(`1:Вы ввели неверный логин или пароль`, secretKey);
                        ws_Send(ws, encryptedMessage);
                    }
                    break;
                case MessageEnum.userData:
                    data = JSON.parse(encryptedData);
                    break;
                case MessageEnum.weekRequest:
                    data = JSON.parse(encryptedData);
                    if (data.session_key === session.sessionKey) {
                        const [year, month, day] = data.day.split('-');
                        console.log(Number(year));
                        console.log(Number(month));
                        console.log(Number(day));
                        const currentDate = new Date(Number(year), Number(month) - 1, Number(day));
                        console.log(currentDate, data.day);
                        const startOfWeek = formatDate(getStartOfWeek(currentDate));
                        const endOfWeek = formatDate(getEndOfWeek(currentDate));
                        console.log(startOfWeek, endOfWeek);
                        if (session.role === RolesEnum.student) {
                            const [...weekdirt] = await prdb.execute(`
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
                `, [startOfWeek, endOfWeek, session.userId]);
                            const week = weekdirt[0];
                            const schedules = [];
                            let currentDay = null;
                            let currentPairs = [];
                            for (const row of week) {
                                const { date, pair_number, teacher_id, teacher_name, teacher_position, subject_name, room_number, subject_type, visit, discription, student_id, schedule_id } = row;
                                const day = new Date(date);
                                if (currentDay === null || !isSameDay(currentDay, day)) {
                                    if (currentDay !== null && currentPairs.length > 0) {
                                        schedules.push({ p: currentPairs, d: formatDateWS(currentDay) });
                                    }
                                    currentDay = day;
                                    currentPairs = [];
                                }
                                const pair = {
                                    su: subject_name,
                                    st: subject_type,
                                    r: room_number,
                                    p: pair_number,
                                    sc_id: schedule_id,
                                    us: []
                                };
                                pair.us.push({
                                    u: String(teacher_id),
                                    n: teacher_name,
                                    g: teacher_position,
                                    r: discription == null ? '' : discription,
                                    m: visit == null ? 0 : visit
                                });
                                currentPairs.push(pair);
                            }
                            if (currentDay !== null && currentPairs.length > 0) {
                                schedules.push({ p: currentPairs, d: formatDateWS(currentDay) });
                            }
                            const weekResponse = { sc: schedules };
                            console.log(JSON.stringify(weekResponse));
                            const encryptWeekResponse = encryptMessage(`${MessageEnum.weekResponse}:${JSON.stringify(weekResponse)}`, secretKey);
                            ws_Send(ws, encryptWeekResponse);
                        }
                        else if (session.role === RolesEnum.teacher) {
                            const [...pairsdirt] = await prdb.execute(`
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
                `, [startOfWeek, endOfWeek, session.userId]);
                            const pairs = pairsdirt[0];
                            const pairsResponse = convertToPairsResponse(pairs);
                            console.log(JSON.stringify(pairsResponse));
                            const encryptPairsResponse = encryptMessage(`${MessageEnum.weekResponse}:${JSON.stringify(pairsResponse)}`, secretKey);
                            ws_Send(ws, encryptPairsResponse);
                        }
                    }
                    break;
                case MessageEnum.checkData:
                    data = JSON.parse(encryptedData);
                    console.log(data);
                    const forUpdateVisit = data;
                    const [...subjectdirt] = await prdb.execute(`
                      SELECT subject_id, type_id FROM schedule where schedule_id = ?
                      `, [forUpdateVisit.sc_id]);
                    const { subject_id, type_id } = subjectdirt[0][0];
                    forUpdateVisit.cu.map(async (el) => {
                        console.log(Number(el.u), forUpdateVisit.sc_id, el.m, el.r);
                        await prdb.execute(`INSERT INTO praktyka.schedule_user (users_user_id, schedule_schedule_id, visit, discription)
                                            VALUES (?, ?, ?, ?)
                                            ON DUPLICATE KEY UPDATE
                                              visit = VALUES(visit),
                                              discription = VALUES(discription);

                        `, [Number(el.u), Number(forUpdateVisit.sc_id), Number(el.m), String(el.r)]);
                        const [...emaildirt] = await prdb.execute(`
                            select email, CONCAT(last_name, ' ', first_name, ' ', middle_name ) as student_name from users where user_id = ?
                    `, [Number(el.u)]);
                        const { email, student_name } = emaildirt[0][0];
                        const [...pairDatedirt] = await prdb.execute(`
                            SELECT date FROM schedule where schedule_id = ?
                    `, [Number(forUpdateVisit.sc_id)]);
                        const pairDate = pairDatedirt[0][0].date;
                        const [...statisticdirt] = await prdb.execute(`
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
                    `, [Number(el.u), Number(subject_id), Number(type_id)]);
                        const statistic = statisticdirt[0][0];
                        console.log('s name: ', forUpdateVisit.su);
                        console.log('email: ', email);
                        console.log('name: ', student_name);
                        console.log('date: ', formatDateEmail(pairDate));
                        console.log('statistic', statistic);
                        if (Number(el.m) === 1 || Number(el.m) === 2) {
                            sendEmail(Number(el.u), email, Number(el.m), String(el.r), String(forUpdateVisit.su), formatDateEmail(pairDate), student_name, statistic);
                        }
                    });
                    break;
                case MessageEnum.statisticRequest:
                    data = JSON.parse(encryptedData);
                    const statisticRequest = data;
                    console.log("SR2: ", statisticRequest);
                    if (session.sessionKey === statisticRequest.sk) {
                        console.log(session.role);
                        if (session.role === RolesEnum.teacher) {
                            if (statisticRequest.su_id === '' && statisticRequest.g_id === '' && statisticRequest.st_id === '') {
                                const [...tstaticdirt] = await prdb.execute(`
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
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId)]);
                                const tstatic = tstaticdirt[0];
                                const statisticResponse = { sd: [] };
                                console.log("TS: ", tstatic);
                                tstatic.map((el) => {
                                    statisticResponse.sd.push({
                                        d: formatDateWS(el.date),
                                        m: el.count_students,
                                        r: el.count_respect_students,
                                        nr: el.count_norespect_students,
                                        e: el.count_existed_students
                                    });
                                });
                                const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey);
                                ws_Send(ws, encryptStatisticResponse);
                            }
                            else if (statisticRequest.su_id !== '' && statisticRequest.g_id === '' && statisticRequest.st_id === '') {
                            }
                        }
                        else if (session.role === RolesEnum.student) {
                            const [...sstaticdirt] = await prdb.execute(`
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
                      `, [statisticRequest.fd, statisticRequest.td, Number(session.userId)]);
                            const sstatic = sstaticdirt[0];
                            console.log("sss", sstatic);
                            const statisticResponse = { sd: [] };
                            console.log("SS: ", sstatic);
                            sstatic.map((el) => {
                                statisticResponse.sd.push({
                                    d: formatDateWS(el.date),
                                    m: el.visit_count,
                                    r: el.visit_respect_count,
                                    nr: el.visit_norespect_count,
                                    e: el.visit_exist_count
                                });
                            });
                            console.log("SR: ", statisticResponse);
                            const encryptStatisticResponse = encryptMessage(`${MessageEnum.statisticResponse}:${JSON.stringify(statisticResponse)}`, secretKey);
                            ws_Send(ws, encryptStatisticResponse);
                        }
                    }
                    break;
                case MessageEnum.beforeStatisticRequest:
                    data = JSON.parse(encryptedData);
                    const beforeReq = data;
                    console.log("BRQ: ", beforeReq);
                    if (session.sessionKey === beforeReq.sk) {
                        if (session.role === RolesEnum.teacher) {
                            console.log("BR: ", beforeReq);
                            const [...bsqdirt] = await prdb.execute(`
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
having date >= ? and date <= ? and teacher_id = ?
order by f.date
                          `, [String(beforeReq.fd), String(beforeReq.td), Number(session.userId)]);
                            const bsq = bsqdirt[0];
                            console.log('bsq: ', bsq);
                            let brsu = [];
                            let brsu_id = [];
                            let brg = [];
                            let brg_id = [];
                            let brst = [];
                            let brst_id = [];
                            let brsut = [];
                            let brsut_id = [];
                            bsq.map((el) => {
                                brsu.push(el.subject_name);
                                brsu_id.push(String(el.subject_id));
                                brg.push(el.group_name);
                                brg_id.push(String(el.group_id));
                                brst.push(el.student_name);
                                brst_id.push(String(el.student_id));
                                brsut.push(String(el.subject_type_name));
                                brsut_id.push(String(el.subject_type_id));
                            });
                            const beforeResp = {
                                su: [...new Set(brsu)],
                                su_id: [...new Set(brsu_id)],
                                g: [...new Set(brg)],
                                g_id: [...new Set(brg_id)],
                                st: [...new Set(brst)],
                                st_id: [...new Set(brst_id)],
                                sut_id: [...new Set(brsut_id)],
                                sut: [...new Set(brsut)]
                            };
                            console.log(beforeResp);
                            const encryptBeforeResponse = encryptMessage(`${MessageEnum.beforeStatisticResponse}:${JSON.stringify(beforeResp)}`, secretKey);
                            ws_Send(ws, encryptBeforeResponse);
                        }
                        else if (session.role === RolesEnum.student) {
                            const s = {
                                su: ['хуй', "пизда"],
                                su_id: ['хуй', "пизда"],
                                g: ['хуй', "пизда"],
                                g_id: ['хуй', "пизда"],
                                st: ['хуй', "пизда"],
                                st_id: ['хуй', "пизда"],
                                sut: ['хуй', "пизда"],
                                sut_id: ['хуй', "пизда"]
                            };
                            const encryptBeforeResponse = encryptMessage(`${MessageEnum.beforeStatisticResponse}:${JSON.stringify(s)}`, secretKey);
                            ws_Send(ws, encryptBeforeResponse);
                        }
                    }
                    break;
                case MessageEnum.rsaKey:
                    data = String(encryptedData);
                    console.log("RSA", data);
                    break;
                default:
                    type = "default";
                    data = String(encryptedData);
                    break;
            }
            console.log(`Decrypted message:`, data);
        }
        else if (split.encryptedType === MessageEnum.rsaKey) {
            console.log(split.encryptedData);
            const publickKeyObject = crypto.createPublicKey({
                key: split.encryptedData,
                format: 'pem',
                type: 'pkcs1'
            });
            console.log(publickKeyObject);
            publickKeyObject.export({ format: 'pem', type: 'pkcs1' });
            console.log(publickKeyObject.export({ format: 'pem', type: 'pkcs1' }));
            try {
                const encryptedSecretKey = crypto.publicEncrypt({
                    key: publickKeyObject,
                    oaepHash: 'sha1',
                    padding: crypto.constants.RSA_PKCS1_PADDING
                }, Buffer.from(secretKey.toString('base64')));
                console.log(encryptedSecretKey.toString('base64'));
                ws_Send(ws, `${MessageEnum.secretKey}:${encryptedSecretKey.toString('base64')}`);
            }
            catch (e) {
                console.log('Decrypt error: ', e);
            }
        }
    });
    ws.on('close', () => {
        console.log(`Client disconnected: ${ip}`);
    });
});
function decryptMessage(encryptedMessage, key) {
    try {
        const keyBytes = key;
        const iv = Buffer.alloc(16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBytes, iv);
        let decrypted = decipher.update(encryptedMessage);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
    }
    catch (e) {
        return e;
    }
}
function encryptMessage(message, key) {
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(message, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}
const port = 5001;
app.get('/', (req, res) => {
    res.send('Praktika Server');
});
httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
//# sourceMappingURL=server.js.map