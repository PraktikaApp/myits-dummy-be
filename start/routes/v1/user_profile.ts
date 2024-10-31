const UserProfilesController = () => import('#controllers/user_profiles_controller');
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

export default function courseRoute() {
  router
    .group(() => {
      router.get('/', [UserProfilesController, 'index'])
      router
        .group(() => {
          router.post('/', [UserProfilesController, 'store'])
          router.get('/:id', [UserProfilesController, 'show'])
          router.patch('/:id', [UserProfilesController, 'update'])
          router.delete('/:id', [UserProfilesController, 'destroy'])
        })
        .middleware(middleware.auth({ guards: ['api'] }))
    })
    .prefix('/user_profile')
}
