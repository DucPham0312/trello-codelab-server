import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const createNew = async (req, res, next) => {
    const correctCondition = Joi.object({
        board_id: Joi.string().required(),
        title: Joi.string().required().min(3).max(50).trim().strict(),
        position: Joi.number().integer().default(0)
    })

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const update = async (req, res, next) => {
    const correctCondition = Joi.object({
        title: Joi.string().min(3).max(50).trim().strict(),
        position: Joi.number().integer()
    })

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const deleteItem = async (req, res, next) => {
    const corectCondition = Joi.object({
        id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })
    try {
        await corectCondition.validateAsync(req.params)
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

export const columnValidation = {
    createNew,
    update,
    deleteItem
}