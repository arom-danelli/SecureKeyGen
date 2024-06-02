# Conversor de Certificados PFX e CRT

## Descrição Geral

Este projeto consiste em uma aplicação desenvolvida para converter certificados digitais entre os formatos PFX e CRT, permitindo a manipulação segura de certificados para diversos usos, incluindo autenticação e assinatura digital. A aplicação é desenvolvida em Node.js e utiliza tecnologias de criptografia avançada através das bibliotecas `node-forge` e OpenSSL.

## Tecnologias Utilizadas

- **Node.js**: Plataforma de execução para JavaScript no lado do servidor.
- **Electron**: Framework que permite o desenvolvimento de aplicações GUI nativas multiplataforma usando tecnologias web como JavaScript, HTML e CSS.
- **node-forge**: Biblioteca JavaScript que implementa os padrões de criptografia para modernas aplicações web.
- **OpenSSL**: Utilizado na branch `withOpenSSL` para proporcionar uma opção de criptografia baseada em linha de comando e compatibilidade com sistemas que já utilizam OpenSSL.

## Funcionalidades

- **Conversão de PFX para CRT e KEY**: Extrai certificados e chaves privadas de arquivos PFX e os salva em formatos separados de CRT e KEY.
- **Conversão de CRT e KEY para PFX**: Combina arquivos de certificado CRT e chave privada KEY em um único arquivo PFX.

## Estrutura do Projeto

- `src/`: Contém os scripts de conversão e os arquivos HTML/CSS/JS para a interface do usuário.
- `assets/`: Armazena recursos estáticos como imagens e ícones.
- `index.js`: Ponto de entrada do aplicativo Electron.

## Branches

### Main

A branch `main` utiliza `node-forge` para todas as operações de criptografia. É ideal para ambientes onde uma solução puramente JavaScript é suficiente e desejada.

### withOpenSSL

A branch `withOpenSSL` integra o OpenSSL para fornecer funcionalidades adicionais de criptografia, oferecendo uma opção para sistemas que requerem ou preferem o uso do OpenSSL devido à sua robustez e extenso suporte a diferentes algoritmos e funcionalidades de criptografia.


npm run dev
npm run dist:win 
npm run dist:linux