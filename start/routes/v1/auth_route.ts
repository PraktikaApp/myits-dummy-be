const AuthController = () => import('#controllers/auth_controller')
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

export default function authRoutes() {
  router
    .group(() => {
      router.post('/login', [AuthController, 'login'])
      router.post('/register', [AuthController, 'register'])
      router
        .group(() => {
          router.post('/logout', [AuthController, 'logout'])
          router.get('/user', [AuthController, 'user'])
        })
        .middleware(middleware.auth({ guards: ['api'] }))
    })
    .prefix('/auth')
}
