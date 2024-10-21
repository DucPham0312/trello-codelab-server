import { StatusCodes } from 'http-status-codes'
import { notificationService } from '~/services/notificationService'

const createNew = async (req, res, next) => {
  try {
    const createdNotification = await notificationService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdNotification)
  } catch (error) { next(error) }
}

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getAllNotifications()
    res.status(StatusCodes.OK).json(notifications)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const notificationId = req.params.id

    const notification = await notificationService.getDetails(notificationId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(notification)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const notificationId = req.params.id
    const updatedNotification = await notificationService.update(notificationId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedNotification)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const notificationId = req.params.id
    const result = await notificationService.deleteItem(notificationId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}


export const notificationController = {
  createNew,
  getAllNotifications,
  getDetails,
  update,
  deleteItem
}