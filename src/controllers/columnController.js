import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
    try {
        const createdColumn = await columnService.creatNew(req.body)
        res.status(StatusCodes.CREATED).json(createdColumn)
    } catch (error) { next(error) }
}

const getAllColumns = async (req, res, next) => {
    try {
        const columns = await columnService.getAllColumns()
        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(columns)
    } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
    try {
        // console.log('req.params: ', req.params)
        const columnId = req.params.id

        const column = await columnService.getDetails(columnId)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(column)
    } catch (error) { next(error) }
}

const update = async (req, res, next) => {
    try {
        const columnId = req.params.id
        const columnCoverFile = req.file
        const userInfo = req.jwtDecoded
        const updatedColumn = await columnService.update(columnId, req.body, columnCoverFile, userInfo)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(updatedColumn)
    } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
    try {
        const columnId = req.params.id
        const result = await columnService.deleteItem(columnId)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

export const columnController = {
    createNew,
    getAllColumns,
    getDetails,
    update,
    deleteItem
}