import JWT from 'jsonwebtoken'

/**
 * Function tạo mới một token - Cần 3 tham số đầu vào
 * userInfo: Nhưng thông tin muốn đính kèm vào token
 * secretSignature: Chữ kí bí mật (dạng một chuỗi string ngẫu nhiên) trên docs thì để tên là privateKey
 * tokenLife: Thời gian sống của Token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) { throw new Error(error) }
}


/**
 * Kiểm tra một token có hợp lệ hay không
 * -->Token được tạo ra đúng với chữ kí bí mật secretSignature
 */
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) { throw new Error(error) }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}