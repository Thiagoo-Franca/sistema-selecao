import { createBaseEmailTemplate, escapeHtml } from "./base.template.js";

export interface DefinirSenhaEmailProps {
  nome: string;
  definirSenhaUrl: string;
  validadeDias: number;
}

export const createDefinirSenhaEmail = (
  props: DefinirSenhaEmailProps,
): string => {
  const { nome, definirSenhaUrl, validadeDias } = props;
  const url = escapeHtml(definirSenhaUrl);

  const content = `
    <h2>Olá, ${escapeHtml(nome)}!</h2>
    <p>Uma conta foi criada para você no SISSEL, o sistema de seleção de candidatos do PGCOMP/UFBA.</p>
    <p>Para começar a usar o sistema, defina sua senha clicando no botão abaixo:</p>

    <div class="warning">
      <strong>⚠️ Importante:</strong>
      <ul>
        <li>Este link expira em ${validadeDias} dias</li>
        <li>Só pode ser usado uma vez</li>
        <li>Nunca compartilhe este link: quem o tiver pode definir a senha da sua conta</li>
        <li>Se você não esperava este email, ignore-o e avise a coordenação</li>
      </ul>
    </div>

    <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
    <div class="link-fallback">
      ${url}
    </div>
  `;

  return createBaseEmailTemplate({
    title: "Defina sua senha",
    content,
    buttonText: "Definir senha",
    buttonUrl: url,
    variant: "default",
  });
};
