import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

//Khởi tạo một đối tượng trelloDataBaseIntence ban đầu là null ( vì chúng ta chưa connect)
let trelloDataBaseInstance = null

//Khởi tạo một đối tượng mongoClientInstance để connect tơi MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

//Kết nối tới DataBase
export const CONNECT_DB = async () => {
  //Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của clientInstance
  await mongoClientInstance.connect()

  //Kết nối thành công thì lấy ra Database theo tên và gắn ngược nó lại vào biến trelloDataBaseInstance ở trên
  trelloDataBaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

//Đóng kết nối Database khi cần
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}

//Funtion GET_DB (không async) này có nhiệm vụ export ra trelloDataBaseInstance sau khi đã connect thành công tới MongoDB để sử dụng ở nhiều nơi khác
//Lưu ý phải đảm bảo chỉ luôn gọi GET_DB sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
  if (!trelloDataBaseInstance) throw new Error('Must connect to Database first!')
  return trelloDataBaseInstance
}
