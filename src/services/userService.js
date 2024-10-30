import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'


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

const verifyAccount = async (reqBody) => {
  try {
    const exisUser = await userModel.findOneByEmail(reqBody.email)

    //Các bước kiểm tra cần thiết
    if (!exisUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (exisUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active')
    if (reqBody.token === exisUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')

    //Update lại thông tin của user về để verify Account
    const updateData ={
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(exisUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    const exisUser = await userModel.findOneByEmail(reqBody.email)

    if (!exisUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!exisUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!bcryptjs.compareSync(reqBody.password, exisUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!!')
    }

    /**Tạo Tokens đăng nhập trả về cho phía FE*/
    //Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email
    const userInfo = { _id: exisUser._id, email: exisUser.email }

    //Tạo ra 2 loại token, accessToken và refreshToken để trả về FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.refreshToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    //Trả về thông tin của User kèm 2 token vừa tạo
    return { accessToken, refreshToken, ...pickUser(exisUser) }
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login
}