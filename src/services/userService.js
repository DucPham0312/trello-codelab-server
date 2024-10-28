import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'


const createNew =async (reqBody) => {
  try {
    //Kiểm tra xem email đã tồn tại trong hệ thống của chúng ta hay chưa
    const exisUser = await userModel.findOneByEmail(reqBody.email)
    if (exisUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    //Tạo data để lưu vào database
    //nameFromEmail: nếu email là mduc@gmail.com thì lấy được 'mduc'
    const nameFromEmail =reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), //Tham số thứ hai là độ phức tạp, giá trị càng cao thì băm càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    //Thực hiện lưu thông tin User vào database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    //Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello CodeLab: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br/> - MinhDucday - </h3>
    `
    //Gọi tới Provider gửi email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    //return trả dữ liệu về cho phía Controller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

export const userService = {
  createNew
}