// Erro de negócio com status HTTP e código legível pelo front.
// Uso: throw new AppError(400, 'INSUFFICIENT_POINTS', 'Saldo insuficiente');
export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
