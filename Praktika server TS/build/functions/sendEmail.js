import * as nodemailer from 'nodemailer';
export const sendEmail = (userId, email, visitType, desc, s_name, date, name, statistic) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.mail.ru",
        port: 465,
        secure: true,
        auth: {
            user: 'no-reply-rsue@mail.ru',
            pass: 'YNpHMQhA8RcyiFyTbtJf'
        }
    });
    const mailOptions = {
        from: 'no-reply-rsue@mail.ru',
        to: `${email.trim()}`,
        subject: 'Уведомление о посещаемости',
        html: mailHTML(visitType, desc, s_name, date, name, statistic)
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Письмо успешно отправлено: ' + info.response);
        }
    });
};
function mailHTML(visit, desc, s_name, date, name, statistic) {
    return `
<div
      style="
      font-family: Montserrat, sans-serif;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
      border: 1px solid #ccc;
      border-radius: 4px;">
    <h2 style="color: #555;">Уведомление о посещаемости</h2>

    <p>Уважаемый(-ая) <span style="font-weight: bold;">${name}</span>,</p>

    <p><span style="font-weight: bold;">${date}</span> система контроля посещаемости зарегистрировала ваш пропуск на занятие <span style="font-weight: bold;">"${s_name}"</span>. ${visit === 1 ? `Хотим вам напомнить, что регулярное присутствие на занятиях является важной частью вашего академического успеха, и мы призываем вас обращать особое внимание на свою посещаемость.` : ``} </p>

    <p style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding-bottom: .3rem; padding-top: .3rem;">${visit === 1 ? `Если ваш пропуск был обусловлен уважительной причиной, пожалуйста, предоставьте деканату вашего факультета соответствующую
      документацию в течение 3 рабочих дней. Такая документация может включать медицинское
      свидетельство, справку от работодателя или другие доказательства, подтверждающие вашу невозможность присутствовать на занятии.`
        : `Пропуск был обусловлен уважительной причиной: <span style="display:block; font-weight: bold;">${desc}</span>`}</p>

    <p style="font-weight: bold;
      color: #e74c3c;">${visit === 1 ? `В случае предоставления уважительной причины, ваш пропуск будет заменен на отсутствие с уважительной
      причиной. Однако, если уважительная причина не будет предоставлена в установленные
      сроки, ваш пропуск будет рассматриваться как безуважный и повлечет соответствующие последствия.`
        : ``}</p>
    
    <div style="margin-top: 1rem; margin-bottom: 1rem; border-top: 1px solid #000; border-bottom: 1px solid #000; padding-bottom: .3rem; padding-top: .3rem;"
    >Ваша статистика посещаемости по дисциплине <span style="font-weight: bold;">"${statistic.subject_name}"</span> (<i>${statistic.subject_type}</i>):
        <ul>
        <li>Общее колическтво пар: ${statistic.visit_count}</li>
        <li>Количество посещённых пар: ${statistic.visit_exist_count}</li>
        <li>Пропусков без уважительной причины: ${statistic.visit_norespect_count}</li>
        <li>Пропусков с уважительной причиной: ${statistic.visit_respect_count}</li>
        </ul>
    </div>
    
    <p>Если у вас возникли какие-либо вопросы или необходимо обсудить причины вашего пропуска, мы рекомендуем
      обратиться в деканат вашего факультета. Координаты деканата и информацию о его рабочем времени вы можете найти на
      нашем <a href="https://rsue.ru">вэб-сайте</a> или обратиться к вашему преподавателю.</p>

    <p>С уважением,<br>
      Система контроля посещаемости</p>
  </div>
    `;
}
//# sourceMappingURL=sendEmail.js.map