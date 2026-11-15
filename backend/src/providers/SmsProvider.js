// Interface de envio de SMS. Implementações reais (Twilio, Zenvia...) estendem esta classe.
export class SmsProvider {
  async send(phone, message) {
    throw new Error('SmsProvider.send não implementado');
  }
}
