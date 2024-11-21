import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'
import AuthValidator from '#validators/auth'
import messagesProvider from '#helpers/validation_messages_provider'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const data = await vine
      .compile(AuthValidator.loginSchema)
      .validate(request.all(), { messagesProvider });
    
    try {
      if (!data.email.includes('@')) {
        data.email = `${data.email}@student.its.ac.id`;
      }

      console.log(data.email);
      const user = await User.verifyCredentials(data.email, data.password);
      const token = await User.accessTokens.create(user, ['*'], { expiresIn: '1 days' });

      if (!token.value!.release()) {
        return response.unprocessableEntity({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      return response.ok({
        success: true,
        message: 'Login successful.',
        data: token.value!.release(),
      });
    } catch (error) {
      return response.unprocessableEntity({
        success: false,
        message: 'Invalid email or password.',
        error: error.message,
      });
    }
  }

  async register({ request, response }: HttpContext) {
    const data = await vine
      .compile(AuthValidator.registerSchema)
      .validate(request.all(), { messagesProvider })

    try {
      if (await User.query().where('email', data.email).first()) {
        return response.conflict({
          success: false,
          message: 'The email has already been taken.',
        })
      }
      console.log(data.email);
      const user = await User.create({ email: data.email, password: data.password })
      await mail.send(new VerifyEmailNotification(user))

      return response.ok({
        success: true,
        message: 'Please check your email inbox (and spam) for an access link.',
      })
    } catch (error) {
      return response.unprocessableEntity({
        success: false,
        message: 'Registration failed.',
        error: error.message,
      })
    }
  }

  async user({ auth, response }: HttpContext) {
    try {
      return response.ok({
        success: true,
        message: 'User retrieved successfully.',
        user: auth.user?.id,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to retrieve user.',
        error: error.message,
      })
    }
  }
  async logout({ auth, response }: HttpContext) {
    try {
      await User.accessTokens.delete(auth.user!, auth.user!.currentAccessToken.identifier)
      return response.ok({
        success: true,
        message: 'Logged out successfully.',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Logout failed.',
        error: error.message,
      })
    }
  }
}
