import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

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
        const refreshToken = req.headers.authorization?.substring('Bearer '.length)
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
        const userId = req.jwtDecoded._id
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