import { notificationModel } from '~/models/notificationModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'


const creatNew = async (reqBody) => {
  try {
    const newNotification = {
      ...reqBody
    }
    const createdNotification = await notificationModel.createNew(newNotification)
    const getNewNotification = await notificationModel.findOneById(createdNotification.insertedId)

    return getNewNotification
  } catch (error) { throw error }
}

const getAllNotifications = async () => {
  return await notificationModel.getAllNotifications()
}

const getDetails = async (notificationId) => {
  try {
    const notification = await notificationModel.getDetails(notificationId)
    if (!notification) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found!')
    }

    return notification
  } catch (error) { throw error }
}

const update = async (notification_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedNotification = await notificationModel.update(notification_Id, updateData)

    return updatedNotification
  } catch (error) { throw error }
}

const deleteItem = async (notification_Id) => {
  try {
    const targetNotification = await notificationModel.findOneById(notification_Id)
    if (!targetNotification) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found!')
    }

    await notificationModel.deleteOneById(notification_Id)

    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}

export const notificationService = {
  creatNew,
  getAllNotifications,
  getDetails,
  update,
  deleteItem
}