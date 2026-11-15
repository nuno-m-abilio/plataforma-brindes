import { SmsProvider } from './SmsProvider.js';

// Simulação: "envia" o SMS imprimindo no terminal do servidor.
export class ConsoleSmsProvider extends SmsProvider {
  async send(phone, message) {
    console.log(`[SMS simulado] para ${phone}: ${message}`);
  }
}
