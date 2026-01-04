"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = exports.transporter = void 0;
const nodemailer = __importStar(require("nodemailer"));
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
if (!emailUser || !emailPass) {
    console.error('AVISO: EMAIL_USER ou EMAIL_PASSWORD não configurados no .env');
}
exports.transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});
exports.transporter.verify(function (error, success) {
    if (error) {
        console.error('Erro na configuração de email:', error.message);
        console.log('Verifique as credenciais no arquivo .env:');
        console.log('EMAIL_USER:', emailUser ? 'Configurado' : 'FALTANDO');
        console.log('EMAIL_PASSWORD:', emailPass ? 'Configurado' : 'FALTANDO');
    }
    else {
        console.log('Servidor de email configurado com sucesso');
    }
});
exports.emailTemplates = {
    passwordReset: (username, resetLink) => ({
        subject: 'Recuperação de Senha - PT Platform',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PT Platform</h1>
          </div>
          <div class="content">
            <h2>Olá, ${username}!</h2>
            <p>Recebemos um pedido para redefinir a senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <center>
              <a href="${resetLink}" class="button">Redefinir Senha</a>
            </center>
            <p>Ou copie e cole o seguinte link no seu navegador:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
            <div class="warning">
              <strong>Importante:</strong>
              <ul>
                <li>Este link é válido por <strong>1 hora</strong></li>
                <li>Se não solicitou esta alteração, ignore este email</li>
                <li>Nunca partilhe este link com ninguém</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>2024 PT Platform. Todos os direitos reservados.</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
      Olá, ${username}!
      
      Recebemos um pedido para redefinir a senha da sua conta.
      
      Clique no link abaixo para criar uma nova senha:
      ${resetLink}
      
      Este link é válido por 1 hora.
      
      Se não solicitou esta alteração, ignore este email.
      
      2024 PT Platform
    `,
    }),
    passwordChanged: (username) => ({
        subject: 'Senha Alterada com Sucesso - PT Platform',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .success { background-color: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Senha Alterada</h1>
          </div>
          <div class="content">
            <h2>Olá, ${username}!</h2>
            <div class="success">
              <p><strong>Sua senha foi alterada com sucesso!</strong></p>
            </div>
            <p>A senha da sua conta PT Platform foi redefinida.</p>
            <p>Se não realizou esta alteração, entre em contacto connosco imediatamente.</p>
          </div>
          <div class="footer">
            <p>2024 PT Platform. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
      Olá, ${username}!
      
      Sua senha foi alterada com sucesso!
      
      Se não realizou esta alteração, entre em contacto connosco imediatamente.
      
      2024 PT Platform
    `,
    }),
};
