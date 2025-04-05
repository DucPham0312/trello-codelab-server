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
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'


const createNew = async (reqBody) => {
    try {
        //Kiểm tra xem email đã tồn tại trong hệ thống của chúng ta hay chưa
        const existUser = await userModel.findOneByEmail(reqBody.email)
        if (existUser) {
            throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
        }

        //Tạo data để lưu vào database
        //nameFromEmail: nếu email là mduc@gmail.com thì lấy được 'mduc'
        const nameFromEmail = reqBody.email.split('@')[0]
        const newUser = {
            email: reqBody.email,
            password: bcryptjs.hashSync(reqBody.password, 8), //Tham số thứ hai là độ phức tạp, giá trị càng cao thì băm càng lâu
            username: nameFromEmail,
            display_name: nameFromEmail,
            verify_token: uuidv4()
        }

        //Thực hiện lưu thông tin User vào database
        const createdUser = await userModel.createNew(newUser)

        //Gửi email cho người dùng xác thực tài khoản
        const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${createdUser.email}&token=${createdUser.verify_token}`
        const customSubject = 'Trello CodeLab: Please verify your email before using our services!'

        //Gửi email xác thực
        await BrevoProvider.sendEmail({
            to: createdUser.email,
            subject: customSubject,
            htmlContent: `
                <h1>Welcome to Trello CodeLab!</h1>
                <p>Please click the link below to verify your email:</p>
                <a href="${verificationLink}">${verificationLink}</a>
                <p>This link will expire in 24 hours.</p>
            `
        })

        return pickUser(createdUser)
    } catch (error) {
        throw new Error(error)
    }
}

const verifyAccount = async (reqBody) => {
    try {
        const existUser = await userModel.findOneByEmail(reqBody.email)

        //Các bước kiểm tra cần thiết
        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
        if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active')
        if (!reqBody.token === existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')

        //Update lại thông tin của user về để verify Account
        const updateData = {
            isActive: true,
            verifyToken: null
        }

        const updatedUser = await userModel.update(existUser._id, updateData)

        return pickUser(updatedUser)
    } catch (error) { throw error }
}

const login = async (reqBody) => {
    try {
        const existUser = await userModel.findOneByEmail(reqBody.email)

        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
        if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
        if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')
        }

        /**Tạo Tokens đăng nhập trả về cho phía FE*/
        //Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email
        const userInfo = { _id: existUser._id, email: existUser.email }

        //Tạo ra 2 loại token, accessToken và refreshToken để trả về FE
        const accessToken = await JwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            env.ACCESS_TOKEN_LIFE
        )

        const refreshToken = await JwtProvider.generateToken(
            userInfo,
            env.REFRESH_TOKEN_SECRET_SIGNATURE,
            env.REFRESH_TOKEN_LIFE
        )

        //Trả về thông tin của User kèm 2 token vừa tạo
        return { accessToken, refreshToken, ...pickUser(existUser) }
    } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
    try {
        //Verify / Giải mã refresh token xem hợp lệ không
        const refreshTokenDecoded = await JwtProvider.verifyToken(
            clientRefreshToken,
            env.REFRESH_TOKEN_SECRET_SIGNATURE
        )

        //Đã lưu thông tin unique và cố định của user trong token rồi, vì vậy lấy luôn từ decoded để tiết kiệm query vào data
        const userInfo = {
            _id: refreshTokenDecoded._id,
            email: refreshTokenDecoded.email
        }

        //Taoj accessToken mới
        const accessToken = await JwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            env.ACCESS_TOKEN_LIFE
        )

        return { accessToken }
    } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvatarFile) => {
    try {
        // Query User và kiểm tra
        const existUser = await userModel.findOneById(userId)
        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
        if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

        // Khởi tạo kết quả updated User ban đầu là empty
        let updateUser = {}

        //Trường hợp change password
        if (reqBody.current_password && reqBody.new_password) {
            //Kiểm tra current có đúng không
            if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
                throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect!!')
            }
            //Nếu current_pasword đúng, hash mật khẩu mưới và update vào DB
            updateUser = await userModel.update(existUser._id, {
                password: bcryptjs.hashSync(reqBody.new_password, 8)
            })
        } else if (userAvatarFile) {
            //Trường hợp upload file lên cloud storage (Cloundinary)
            const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
            // console.log('uploadResult: ', uploadResult)

            //Lưu lại url (secure_url) vào database
            updateUser = await userModel.update(existUser._id, {
                avatar: uploadResult.secure_url
            })
        }
        else {
            //Trường hợp update các thông tin chung(displayName)
            updateUser = await userModel.update(existUser._id, reqBody)
        }

        return pickUser(updateUser)
    } catch (error) { throw error }
}


export const userService = {
    createNew,
    verifyAccount,
    login,
    refreshToken,
    update
}