import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

//Middleware đảm nhiệm việc quan trọng: Xác thực JWT accessToken nhận đc từ FE có hợp lệ ko

const isAuthorized = async (req, res, next) => {
  //Cách 1: Lấy accessToken nằm trong req cookie phía client
  const clientAccessToken = req.cookies?.accessToken

  //Cách 2: Lấy accessToken trong trường hợp phía FE lưu localStorage và gửi lên thông qua header authorization
  // const accessTokenFromHeader = req.headers.authorization

  //Nếu client accessToken không tồn tại thì trả về lỗi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }

  try {
    //Thực hiện giải mã token xem có hợp lệ hay ko
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      // accessTokenFromHeader.substring('Bearer '.length), //Cách 2
      env.ACCESS_TOKEN_SECRET_SIGNATURE)

    // console.log('accessTokenDecoded', accessTokenDecoded)

    //Nếu token hợp lệ, cần lưu thông tin giải mã được vào req.JwtDecoded, để sử dụng cho tầng cần xử lí phía sau
    req.jwtDecoded = accessTokenDecoded

    //Cho phép req đi tiếp
    next()
  } catch (error) {
    //Nếu accessToken nó bị hết hạn (expired) thì cần trả về mã lỗi cho FE biết để gọi api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      return
    }

    //Nếu accessToken không hợp lệ do bất kì điều gì khác hết hạn thì trả về luôn mã 401 cho FE gọi api sign_out luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}