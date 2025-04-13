import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'


const createNew = async (req, res, next) => {
    const correctCondition = Joi.object({
        column_id: Joi.string().required(),
        board_id: Joi.string().required(),
        title: Joi.string().required().min(3).max(50).trim().strict(),
        description: Joi.string().allow(null),
        cover_url: Joi.string().allow(null),
        deadline: Joi.date().allow(null),
        is_completed: Joi.boolean().default(false),
        google_event_id: Joi.string().allow(null)
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
        description: Joi.string().allow(null),
        cover_url: Joi.string().allow(null),
        position: Joi.number().integer()
    })

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const idItems = async (req, res, next) => {
    const correctCondition = Joi.object({
        ids: Joi.array().items(
            Joi.string().required()
        ).min(1).required()
    })

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

export const cardValidation = {
    createNew,
    update,
    idItems
}