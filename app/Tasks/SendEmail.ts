import { BaseTask } from 'adonis5-scheduler/build/src/Scheduler/Task'
import { string } from '@ioc:Adonis/Core/Helpers'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class SendEmail extends BaseTask {
  public static get schedule() {
    return '* */0 */9 * * *'
  }

  public static get useLock() {
    return true
  }

  public async handle() {
    const users = await User.query()
    this.logger.info('oie')
    const usersToSendEmail = users.filter(async (user) => {
      await user.load('bets')
      const lastBet = user.bets[user.bets.length - 1]
      let sendEmail: boolean = false
      if (lastBet) {
        const betAge = Math.abs(lastBet.createdAt.diffNow('days').days)
        sendEmail = betAge > 7
      }
      return sendEmail
    })
    usersToSendEmail.forEach(async (user) => {
      this.logger.info('sending email')
      await Mail.send((message) => {
        message
          .from('no-reply@tgl.com')
          .to(user.email)
          .subject(`TGL - Hello ${string.sentenceCase(user.username)}`)
          .htmlView('remember/remember', {
            name: string.sentenceCase(user.username),
            companyEmail: 'yaslim@luby.com',
          })
      })
      this.logger.info('email sended')
    })
  }
}
