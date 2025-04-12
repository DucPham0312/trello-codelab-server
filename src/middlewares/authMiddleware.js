import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

//Middleware đảm nhiệm: Xác thực JWT accessToken nhận đc từ FE có hợp lệ ko

const isAuthorized = async (req, res, next) => {
    const clientAccessToken = req.cookies?.accessToken

    //Nếu client accessToken không tồn tại thì trả về lỗi
    if (!clientAccessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
        return
    }
    try {
        //Thực hiện giải mã token xem có hợp lệ hay ko
        const accessTokenDecoded = await JwtProvider.verifyToken(
            clientAccessToken,
            env.ACCESS_TOKEN_SECRET_SIGNATURE)

        //Token hợp lệ, lưu thông tin giải mã vào req.JwtDecoded, sử dụng cho tầng cần xử lí sau
        req.jwtDecoded = accessTokenDecoded

        next()
    } catch (error) {
        //accessToken hết hạn (expired) trả về mã lỗi cho FE biết để gọi api refreshToken
        if (error?.message?.includes('jwt expired')) {
            next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
            return
        }

        //accessToken không hợp lệ do bất kì điều gì khác thì trả về luôn mã 401 cho FE gọi api sign_out
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
    }
}

export const authMiddleware = {
    isAuthorized
}