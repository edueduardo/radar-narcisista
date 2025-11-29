// Templates de Email - Radar Narcisista BR
// Estes templates podem ser usados com Supabase Auth ou qualquer serviço de email

export const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo-box { display: inline-block; width: 50px; height: 50px; background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); border-radius: 12px; line-height: 50px; color: white; font-weight: bold; font-size: 18px; }
    h1 { color: #1f2937; font-size: 24px; margin: 0 0 16px; text-align: center; }
    p { color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white !important; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .btn:hover { opacity: 0.9; }
    .code { background: #f3f4f6; padding: 16px 24px; border-radius: 8px; font-family: monospace; font-size: 24px; letter-spacing: 4px; text-align: center; color: #1f2937; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 12px; color: #9ca3af; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin: 20px 0; }
    .warning p { color: #92400e; font-size: 14px; margin: 0; }
    .emergency { background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 12px 16px; margin: 20px 0; }
    .emergency p { color: #991b1b; font-size: 14px; margin: 0; }
    .list { background: #f9fafb; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .list li { color: #4b5563; font-size: 14px; margin-bottom: 8px; }
  </style>
`;

// Template base
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-box">RN</span>
      </div>
      ${content}
      <div class="footer">
        <p>© 2024 Radar Narcisista BR</p>
        <p>Este email foi enviado porque você tem uma conta no Radar Narcisista.</p>
        <p>Se você não reconhece esta atividade, entre em contato conosco.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 1. Email de Boas-vindas
export const welcomeEmail = (userName?: string) => baseTemplate(`
  <h1>Bem-vindo(a) ao Radar Narcisista! 💜</h1>
  <p>Olá${userName ? `, ${userName}` : ''}!</p>
  <p>
    Sua conta foi criada com sucesso. Estamos felizes em ter você conosco.
  </p>
  <p>
    O Radar é um espaço seguro para você encontrar clareza, registrar suas experiências 
    e receber apoio — tudo com total privacidade.
  </p>
  
  <div class="list">
    <p style="font-weight: 600; color: #1f2937; margin-bottom: 12px;">O que você pode fazer:</p>
    <ul>
      <li>📝 <strong>Teste de Clareza</strong> - Entenda melhor sua situação</li>
      <li>📖 <strong>Diário de Episódios</strong> - Registre eventos importantes</li>
      <li>🤖 <strong>Coach de Clareza</strong> - Converse com nossa IA acolhedora</li>
      <li>🔒 <strong>Saída Rápida</strong> - Tecla ESC para sair instantaneamente</li>
    </ul>
  </div>
  
  <div style="text-align: center;">
    <a href="{{APP_URL}}/dashboard" class="btn">Acessar Minha Conta</a>
  </div>
  
  <div class="warning">
    <p>⚠️ <strong>Lembrete:</strong> O Radar é uma ferramenta de apoio e não substitui acompanhamento profissional de saúde mental.</p>
  </div>
`);

// 2. Email de Confirmação de Email
export const confirmEmail = (confirmUrl: string) => baseTemplate(`
  <h1>Confirme seu email 📧</h1>
  <p>
    Obrigado por se cadastrar no Radar Narcisista! 
    Para ativar sua conta, clique no botão abaixo:
  </p>
  
  <div style="text-align: center;">
    <a href="${confirmUrl}" class="btn">Confirmar Email</a>
  </div>
  
  <p style="font-size: 14px; color: #9ca3af;">
    Se o botão não funcionar, copie e cole este link no navegador:<br>
    <a href="${confirmUrl}" style="color: #9333ea; word-break: break-all;">${confirmUrl}</a>
  </p>
  
  <p style="font-size: 14px; color: #9ca3af;">
    Este link expira em 24 horas.
  </p>
`);

// 3. Email de Recuperação de Senha
export const resetPasswordEmail = (resetUrl: string) => baseTemplate(`
  <h1>Redefinir sua senha 🔐</h1>
  <p>
    Recebemos uma solicitação para redefinir a senha da sua conta no Radar Narcisista.
  </p>
  
  <div style="text-align: center;">
    <a href="${resetUrl}" class="btn">Redefinir Senha</a>
  </div>
  
  <p style="font-size: 14px; color: #9ca3af;">
    Se o botão não funcionar, copie e cole este link no navegador:<br>
    <a href="${resetUrl}" style="color: #9333ea; word-break: break-all;">${resetUrl}</a>
  </p>
  
  <div class="warning">
    <p>⚠️ Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá a mesma.</p>
  </div>
  
  <p style="font-size: 14px; color: #9ca3af;">
    Este link expira em 1 hora.
  </p>
`);

// 4. Email de Senha Alterada
export const passwordChangedEmail = () => baseTemplate(`
  <h1>Senha alterada com sucesso ✅</h1>
  <p>
    A senha da sua conta no Radar Narcisista foi alterada com sucesso.
  </p>
  
  <p>
    Se você fez essa alteração, pode ignorar este email.
  </p>
  
  <div class="emergency">
    <p>🚨 <strong>Não foi você?</strong> Entre em contato imediatamente: 
    <a href="mailto:seguranca@radarnarcisista.br" style="color: #991b1b;">seguranca@radarnarcisista.br</a></p>
  </div>
`);

// 5. Email de Login Suspeito
export const suspiciousLoginEmail = (location: string, device: string, time: string) => baseTemplate(`
  <h1>Novo acesso detectado 🔔</h1>
  <p>
    Detectamos um novo acesso à sua conta no Radar Narcisista:
  </p>
  
  <div class="list">
    <ul style="list-style: none; padding: 0;">
      <li>📍 <strong>Local:</strong> ${location}</li>
      <li>💻 <strong>Dispositivo:</strong> ${device}</li>
      <li>🕐 <strong>Horário:</strong> ${time}</li>
    </ul>
  </div>
  
  <p>
    Se foi você, pode ignorar este email.
  </p>
  
  <div class="emergency">
    <p>🚨 <strong>Não reconhece este acesso?</strong> Altere sua senha imediatamente e entre em contato conosco.</p>
  </div>
  
  <div style="text-align: center;">
    <a href="{{APP_URL}}/configuracoes" class="btn">Verificar Minha Conta</a>
  </div>
`);

// 6. Email de Conta Deletada
export const accountDeletedEmail = (userName?: string) => baseTemplate(`
  <h1>Conta excluída 👋</h1>
  <p>Olá${userName ? `, ${userName}` : ''}!</p>
  <p>
    Sua conta no Radar Narcisista foi excluída conforme solicitado.
  </p>
  
  <div class="list">
    <p style="font-weight: 600; color: #1f2937; margin-bottom: 12px;">O que foi removido:</p>
    <ul>
      <li>✓ Todos os seus dados pessoais</li>
      <li>✓ Histórico de testes</li>
      <li>✓ Entradas do diário</li>
      <li>✓ Conversas com a IA</li>
    </ul>
  </div>
  
  <p>
    Sentiremos sua falta. Se mudar de ideia, você sempre pode criar uma nova conta.
  </p>
  
  <p style="font-size: 14px; color: #9ca3af;">
    Lembre-se: você não está sozinho(a). Se precisar de ajuda, ligue 188 (CVV).
  </p>
`);

// 7. Email de Exportação de Dados
export const dataExportEmail = (downloadUrl: string) => baseTemplate(`
  <h1>Seus dados estão prontos 📦</h1>
  <p>
    A exportação dos seus dados do Radar Narcisista foi concluída.
  </p>
  
  <div style="text-align: center;">
    <a href="${downloadUrl}" class="btn">Baixar Meus Dados</a>
  </div>
  
  <div class="warning">
    <p>⚠️ Este link expira em 7 dias. Após esse período, você precisará solicitar uma nova exportação.</p>
  </div>
  
  <p style="font-size: 14px; color: #9ca3af;">
    O arquivo está em formato JSON e contém todos os dados associados à sua conta.
  </p>
`);

// 8. Email de Assinatura Premium
export const premiumWelcomeEmail = (userName?: string) => baseTemplate(`
  <h1>Bem-vindo(a) ao Premium! 🌟</h1>
  <p>Olá${userName ? `, ${userName}` : ''}!</p>
  <p>
    Obrigado por assinar o Radar Narcisista Premium! 
    Agora você tem acesso a todos os recursos exclusivos.
  </p>
  
  <div class="list">
    <p style="font-weight: 600; color: #1f2937; margin-bottom: 12px;">Seus novos recursos:</p>
    <ul>
      <li>✨ Testes de Clareza ilimitados</li>
      <li>✨ Diário sem limites de entradas</li>
      <li>✨ Chat com IA ilimitado</li>
      <li>✨ Relatórios PDF detalhados</li>
      <li>✨ Plano de Segurança personalizado</li>
      <li>✨ Suporte prioritário</li>
    </ul>
  </div>
  
  <div style="text-align: center;">
    <a href="{{APP_URL}}/dashboard" class="btn">Explorar Recursos Premium</a>
  </div>
`);

// 9. Email de Cancelamento de Assinatura
export const subscriptionCancelledEmail = (endDate: string) => baseTemplate(`
  <h1>Assinatura cancelada 😢</h1>
  <p>
    Sua assinatura Premium do Radar Narcisista foi cancelada.
  </p>
  
  <p>
    Você ainda terá acesso aos recursos Premium até <strong>${endDate}</strong>.
    Após essa data, sua conta voltará ao plano gratuito.
  </p>
  
  <div class="list">
    <p style="font-weight: 600; color: #1f2937; margin-bottom: 12px;">O que você manterá no plano gratuito:</p>
    <ul>
      <li>✓ 1 Teste de Clareza por mês</li>
      <li>✓ Diário com limite de entradas</li>
      <li>✓ Chat com IA limitado</li>
    </ul>
  </div>
  
  <p>
    Mudou de ideia? Você pode reativar sua assinatura a qualquer momento.
  </p>
  
  <div style="text-align: center;">
    <a href="{{APP_URL}}/planos" class="btn">Reativar Premium</a>
  </div>
`);

// Função auxiliar para substituir variáveis
export const replaceVariables = (template: string, variables: Record<string, string>) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
};

// Exportar todos os templates
export const emailTemplates = {
  welcome: welcomeEmail,
  confirmEmail,
  resetPassword: resetPasswordEmail,
  passwordChanged: passwordChangedEmail,
  suspiciousLogin: suspiciousLoginEmail,
  accountDeleted: accountDeletedEmail,
  dataExport: dataExportEmail,
  premiumWelcome: premiumWelcomeEmail,
  subscriptionCancelled: subscriptionCancelledEmail,
};
