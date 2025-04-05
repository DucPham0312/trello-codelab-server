const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (toEmail, customSubject, customHtmlContent) => {
    //Khởi tạo một sendSmtEmail với những thông tin cần thiết
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    //Tài khoản gửi mail:
    sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

    //Những tài khoản nhận email
    //'to' là Array để sau tùy biến gửi 1 email đến nhiều user
    sendSmtpEmail.to = [{ email: toEmail }]

    //Tiêu đề
    sendSmtpEmail.subject = customSubject

    //Nội dung email dạng HTML
    sendSmtpEmail.htmlContent = customHtmlContent

    //Gọi hành động gửi mail
    // sendTransacEmail của thư viện sẽ return một Promise
    return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
    sendEmail
}