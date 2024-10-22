import { reminderModel } from '~/models/reminderModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const creatNew = async (reqBody) => {
  try {
    const newReminder = {
      ...reqBody
    }
    const createdReminder = await reminderModel.createNew(newReminder)
    const getNewReminder = await reminderModel.findOneById(createdReminder.insertedId)

    if (getNewReminder) {
      await userModel.pushReminderIds(getNewReminder)
    }

    return getNewReminder
  } catch (error) { throw error }
}

const getAllReminders = async () => {
  return await reminderModel.getAllReminders()
}

const getDetails = async (reminderId) => {
  try {
    const reminder = await reminderModel.getDetails(reminderId)
    if (!reminder) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Reminder not found!')
    }

    return reminder
  } catch (error) { throw error }
}

const update = async (reminder_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedReminder = await reminderModel.update(reminder_Id, updateData)

    return updatedReminder
  } catch (error) { throw error }
}

const deleteItem = async (reminder_Id) => {
  try {
    const targetReminder = await reminderModel.findOneById(reminder_Id)
    if (!targetReminder) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Reminder not found!')
    }
    //Xoa reminder
    await reminderModel.deleteOneById(reminder_Id)

    await userModel.pullReminderIds(targetReminder)

    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}


export const reminderService = {
  creatNew,
  getAllReminders,
  getDetails,
  update,
  deleteItem
}