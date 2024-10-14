import express from 'express'
import { CONNECT_FB } from '~/config/firebase'
import { StatusCodes } from 'http-status-codes'

const Router = express.Router()

Router.route('/')
  .get(async (req, res) => {
    try {
      const userRef = await CONNECT_FB.firestore().collection('users')
      const respose = await userRef.get()
      let dataUsers = []
      respose.forEach(doc => {
        dataUsers.push({ id:doc.id, ...doc.data() })
      })
      res.send(dataUsers)
    } catch (error) {
      throw new Error(error)
    }
  })
  .post(async (req, res) => {
    try {
      // const id = req.body.email
      const userJson = {
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname
      }

      //set id = email
      // await CONNECT_FB.firestore().collection('users').doc(id).set(userJson)
      await CONNECT_FB.firestore().collection('users').add(userJson)

      res.status(StatusCodes.OK).json({ message: 'Created user data successfully!' })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message })
    }
  })

Router.route('/:id')
  .get(async (req, res) => {
    try {
      const userRef = await CONNECT_FB.firestore().collection('users').doc(req.params.id)
      const response = await userRef.get()
      res.send(response.data())
    } catch (error) {
      throw new Error(error)
    }
  })
  .delete(async (req, res) => {
    try {
      await CONNECT_FB.firestore().collection('users').doc(req.params.id).delete()
      res.status(StatusCodes.OK).json({ message: 'Delete user successfully!' })

    } catch (error) {
      throw new Error(error)
    }
  })

export const userFbRouter = Router