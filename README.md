# Solidariedade em Ação

Site institucional responsivo desenvolvido como projeto acadêmico da disciplina **Desenvolvimento Front-End para Web**.

## Objetivo

Apresentar uma organização social fictícia de forma moderna, acessível e profissional, conectando pessoas interessadas em voluntariado a iniciativas de educação, segurança alimentar e inclusão social.

## Páginas

- **Início:** apresentação da organização, frentes de atuação e projetos em destaque.
- **Projetos:** detalhamento das iniciativas sociais e formas de contribuição.
- **Voluntariado:** formulário completo para simulação de cadastro de pessoas voluntárias.

## Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla

## Recursos implementados

- Estrutura HTML5 semântica
- Layout responsivo para diferentes tamanhos de tela
- Navegação mobile
- Navegação SPA com roteamento por hash
- Boas práticas de acessibilidade
- Estados interativos e suporte a `prefers-reduced-motion`
- Máscaras para CPF, telefone e CEP
- Validação de formulário com recursos nativos do HTML5
- Feedback visual após o envio válido

## Como executar

O projeto não exige instalação de dependências ou processo de build. Inicie um servidor local, como o Live Server, e abra `html/index.html`. A navegação principal utiliza as rotas `#inicio`, `#projetos` e `#voluntariado` sem recarregar o documento.

## Observação

O formulário é exclusivamente demonstrativo e não envia informações ao servidor. Durante o preenchimento, um rascunho com nome, cidade, estado, área de interesse e mensagem é salvo no `localStorage` do navegador. CPF, telefone, CEP, e-mail e data de nascimento não entram nesse rascunho. Os dados salvos são apagados após o envio simulado.
