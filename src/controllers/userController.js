import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'
import ms from 'ms'

const createNew = async (req, res, next) => {
    try {
        const createdUser = await userService.createNew(req.body)
        res.status(StatusCodes.CREATED).json(createdUser)
    } catch (error) { next(error) }
}

const verifyAccount = async (req, res, next) => {
    try {
        const result = await userService.verifyAccount(req.body)
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body)
        //Xử lý trả về http only cookie cho phía trình duyệt
        //maxAge- tg sống cookie khác với token
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: ms('14 days')
        })

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: ms('14 days')
        })

        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const logout = async (req, res, next) => {
    try {
        res.status(StatusCodes.OK).json({ loggedOut: true })
    } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.body?.refreshToken
        if (!refreshToken) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token not found')
        }

        const result = await userService.refreshToken(refreshToken)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In!'))
    }
}

const update = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const userAvatarFile = req.file
        // console.log('Controller > userUploadFile: ', userUploadFile)
        const updatedUser = await userService.update(userId, req.body, userAvatarFile)
        res.status(StatusCodes.OK).json(updatedUser)
    } catch (error) {
        next(error)
    }
}


export const userController = {
    createNew,
    verifyAccount,
    login,
    logout,
    refreshToken,
    update
}