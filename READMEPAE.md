EAI PAIZÃO, SUAVE? 

Aqui tem algumas observações pra te ajudar no seu role de descobertas.

-O Electron vc instala ele usando o npm ou yarn no cmd mesmo. Na vibe de Angular, Ionic.

-Vc precisa instalar o OpenSSl. Tem diversas maneiras, eu baixei um exec num lugar doido ai e instalei. 

-É preciso gerar uma chave PFX sua, para fazer os testes no sisteminha. No google ou no gptzão vc encontra como gerar, pelo cmd mesmo. 

-Quando for criar o certificado PFX, na última etapa, vai ter que colocar uma senha. No cmd, quando vc digita a senha, da a impressão que não está digitando. MAs é um padrão do ssl de
não fazer a 'movimentação' de digitar. É só vc colocar uma senha sua, e depois confirmar ela, voilá! 

-Por enquanto, o sistema está fazendo uma conversão de PFX para CRT + KEY. Porém, eu implementei um arquivo chamado preload.js e depois nada mais funcionou. 

- O renderer.js está trabalhando em conjunto com o index.js. O renderes está chamando o 'password', lembra que vc define uma senha no PFX? Essa senha precisa fazer parte do processo de conversão. O index chama a rendererização da tela e o conversor.

- Eu acho que o erro tbm está no renderer, ele está pedindo o password no prompt, o ideal é aparecer uma telinha pedindo a senha. 

no de mais é isso, a ideia está ai <3