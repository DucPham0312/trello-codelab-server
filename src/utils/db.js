import mysql from 'mysql2/promise'
import config from '~/config/sqlConf'
const pool = mysql.createPool(config.poolConfig)

export default pool