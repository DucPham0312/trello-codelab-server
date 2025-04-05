import { env } from '~/config/environment'

export default {
    poolConfig: {
        host: env.SQL_HOST,
        port: env.SQL_PORT,
        user: env.SQL_USER,
        password: env.SQL_PASSWORD,
        database: env.SQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
}
