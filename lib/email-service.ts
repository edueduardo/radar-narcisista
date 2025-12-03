/**
 * EMAIL SERVICE - Sistema de Emails Transacionais
 * 
 * BLOCO 41-45 - ETAPA 43
 * 
 * Suporta múltiplos provedores:
 * - Resend (recomendado)
 * - SendGrid
 * - Nodemailer (SMTP genérico)
 */

// =============================================================================
// TIPOS
// =============================================================================

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'smtp'
  apiKey?: string
  from: string
  replyTo?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: string[]
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// =============================================================================
// TEMPLATES DE EMAIL
// =============================================================================

export const EMAIL_TEMPLATES = {
  // Boas-vindas
  welcome: (nome: string, appName: string): EmailTemplate => ({
    subject: `Bem-vindo(a) ao ${appName}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo(a), ${nome}!</h1>
          </div>
          <div class="content">
            <p>Estamos muito felizes em ter você conosco no <strong>${appName}</strong>!</p>
            <p>Sua conta foi criada com sucesso e você já pode começar a explorar todas as funcionalidades.</p>
            <p style="text-align: center;">
              <a href="{APP_URL}/dashboard" class="button">Acessar meu Dashboard</a>
            </p>
            <p>Se tiver qualquer dúvida, nossa equipe está pronta para ajudar.</p>
            <p>Abraços,<br>Equipe ${appName}</p>
          </div>
          <div class="footer">
            <p>Este email foi enviado automaticamente. Por favor, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Bem-vindo(a), ${nome}! Sua conta no ${appName} foi criada com sucesso.`
  }),

  // Verificação de email
  verifyEmail: (nome: string, link: string, appName: string): EmailTemplate => ({
    subject: `Verifique seu email - ${appName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .code { background: #e5e7eb; padding: 10px 20px; font-size: 24px; letter-spacing: 5px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Verifique seu Email</h1>
          </div>
          <div class="content">
            <p>Olá, ${nome}!</p>
            <p>Para completar seu cadastro, clique no botão abaixo para verificar seu email:</p>
            <p style="text-align: center;">
              <a href="${link}" class="button">Verificar Email</a>
            </p>
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666;">${link}</p>
            <p><strong>Este link expira em 24 horas.</strong></p>
          </div>
          <div class="footer">
            <p>Se você não criou uma conta, ignore este email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Olá ${nome}, verifique seu email acessando: ${link}`
  }),

  // Recuperação de senha
  resetPassword: (nome: string, link: string, appName: string): EmailTemplate => ({
    subject: `Redefinir senha - ${appName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Redefinir Senha</h1>
          </div>
          <div class="content">
            <p>Olá, ${nome}!</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
            <p style="text-align: center;">
              <a href="${link}" class="button">Redefinir Senha</a>
            </p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
          </div>
          <div class="footer">
            <p>Por segurança, nunca compartilhe este link com ninguém.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Olá ${nome}, redefina sua senha acessando: ${link}`
  }),

  // Notificação de limite (80%)
  limitWarning: (nome: string, feature: string, percent: number, appName: string): EmailTemplate => ({
    subject: `⚠️ Você está chegando no limite - ${appName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .progress { background: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden; }
          .progress-bar { background: #f59e0b; height: 100%; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Aviso de Limite</h1>
          </div>
          <div class="content">
            <p>Olá, ${nome}!</p>
            <p>Você já usou <strong>${percent}%</strong> do seu limite de <strong>${feature}</strong>.</p>
            <div class="progress">
              <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
            <p>Para continuar usando sem interrupções, considere fazer um upgrade do seu plano.</p>
            <p style="text-align: center;">
              <a href="{APP_URL}/planos" class="button">Ver Planos</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Olá ${nome}, você já usou ${percent}% do limite de ${feature}.`
  }),

  // Notificação de limite atingido (100%)
  limitReached: (nome: string, feature: string, appName: string): EmailTemplate => ({
    subject: `🚫 Limite atingido - ${appName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚫 Limite Atingido</h1>
          </div>
          <div class="content">
            <p>Olá, ${nome}!</p>
            <p>Você atingiu o limite de <strong>${feature}</strong> do seu plano atual.</p>
            <p>Para continuar usando esta funcionalidade, faça um upgrade do seu plano.</p>
            <p style="text-align: center;">
              <a href="{APP_URL}/planos" class="button">Fazer Upgrade</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Olá ${nome}, você atingiu o limite de ${feature}. Faça upgrade para continuar.`
  }),

  // Confirmação de pagamento
  paymentConfirmation: (nome: string, plano: string, valor: string, appName: string): EmailTemplate => ({
    subject: `✅ Pagamento confirmado - ${appName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .receipt { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Pagamento Confirmado!</h1>
          </div>
          <div class="content">
            <p>Olá, ${nome}!</p>
            <p>Seu pagamento foi processado com sucesso.</p>
            <div class="receipt">
              <p><strong>Plano:</strong> ${plano}</p>
              <p><strong>Valor:</strong> ${valor}</p>
              <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <p>Seu plano já está ativo e você pode aproveitar todos os benefícios.</p>
            <p style="text-align: center;">
              <a href="{APP_URL}/dashboard" class="button">Acessar Dashboard</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Olá ${nome}, seu pagamento do plano ${plano} (${valor}) foi confirmado.`
  })
}

// =============================================================================
// CLASSE PRINCIPAL
// =============================================================================

export class EmailService {
  private config: EmailConfig

  constructor(config?: Partial<EmailConfig>) {
    this.config = {
      provider: (process.env.EMAIL_PROVIDER as EmailConfig['provider']) || 'resend',
      apiKey: process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      replyTo: process.env.EMAIL_REPLY_TO,
      ...config
    }
  }

  /**
   * Envia um email
   */
  async send(params: SendEmailParams): Promise<EmailResult> {
    try {
      switch (this.config.provider) {
        case 'resend':
          return await this.sendWithResend(params)
        case 'sendgrid':
          return await this.sendWithSendGrid(params)
        default:
          throw new Error(`Provider não suportado: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('[EmailService] Erro ao enviar email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Envia email usando Resend
   */
  private async sendWithResend(params: SendEmailParams): Promise<EmailResult> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: this.config.from,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo || this.config.replyTo,
        tags: params.tags?.map(tag => ({ name: tag, value: 'true' }))
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar email via Resend')
    }

    return {
      success: true,
      messageId: data.id
    }
  }

  /**
   * Envia email usando SendGrid
   */
  private async sendWithSendGrid(params: SendEmailParams): Promise<EmailResult> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: Array.isArray(params.to) 
            ? params.to.map(email => ({ email }))
            : [{ email: params.to }]
        }],
        from: { email: this.config.from },
        reply_to: params.replyTo ? { email: params.replyTo } : undefined,
        subject: params.subject,
        content: [
          { type: 'text/plain', value: params.text || '' },
          { type: 'text/html', value: params.html }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erro ao enviar email via SendGrid')
    }

    return {
      success: true,
      messageId: response.headers.get('x-message-id') || undefined
    }
  }

  // ===========================================================================
  // MÉTODOS DE CONVENIÊNCIA
  // ===========================================================================

  async sendWelcome(to: string, nome: string, appName: string = 'Radar'): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES.welcome(nome, appName)
    return this.send({ to, ...template })
  }

  async sendVerifyEmail(to: string, nome: string, link: string, appName: string = 'Radar'): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES.verifyEmail(nome, link, appName)
    return this.send({ to, ...template })
  }

  async sendResetPassword(to: string, nome: string, link: string, appName: string = 'Radar'): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES.resetPassword(nome, link, appName)
    return this.send({ to, ...template })
  }

  async sendLimitWarning(to: string, nome: string, feature: string, percent: number, appName: string = 'Radar'): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES.limitWarning(nome, feature, percent, appName)
    return this.send({ to, ...template, tags: ['limit-warning'] })
  }

  async sendLimitReached(to: string, nome: string, feature: string, appName: string = 'Radar'): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES.limitReached(nome, feature, appName)
    return this.send({ to, ...template, tags: ['limit-reached'] })
  }

  async sendPaymentConfirmation(to: string, nome: string, plano: string, valor: string, appName: string = 'Radar'): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES.paymentConfirmation(nome, plano, valor, appName)
    return this.send({ to, ...template, tags: ['payment'] })
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService()
  }
  return emailServiceInstance
}

// =============================================================================
// HOOK REACT
// =============================================================================

export function useEmailService() {
  const emailService = getEmailService()
  
  return {
    sendWelcome: emailService.sendWelcome.bind(emailService),
    sendVerifyEmail: emailService.sendVerifyEmail.bind(emailService),
    sendResetPassword: emailService.sendResetPassword.bind(emailService),
    sendLimitWarning: emailService.sendLimitWarning.bind(emailService),
    sendLimitReached: emailService.sendLimitReached.bind(emailService),
    sendPaymentConfirmation: emailService.sendPaymentConfirmation.bind(emailService),
    send: emailService.send.bind(emailService)
  }
}
