import { StatusCodes } from 'http-status-codes'
import { reminderService } from '~/services/reminderService'

const createNew = async (req, res, next) => {
  try {
    const createdReminder = await reminderService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdReminder)
  } catch (error) { next(error) }
}

const getAllReminders = async (req, res, next) => {
  try {
    const reminders = await reminderService.getAllReminders()
    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(reminders)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const reminderId = req.params.id

    const reminder = await reminderService.getDetails(reminderId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(reminder)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const reminderId = req.params.id
    const updatedReminder = await reminderService.update(reminderId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedReminder)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const reminderId = req.params.id
    const result = await reminderService.deleteItem(reminderId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const reminderController = {
  createNew,
  getAllReminders,
  getDetails,
  update,
  deleteItem
}