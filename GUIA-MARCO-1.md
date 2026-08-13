# Guia do Marco 1 — Colocar o C.O.S.M.O. no ar

Matheus, este guia te leva do zero até ter o **C.O.S.M.O. publicado na internet**, com um endereço só seu, instalável no celular. Foi escrito assumindo que você nunca abriu um terminal na vida. Vá com calma, um passo por vez. Se algo der diferente do descrito, pare e me chame — não force.

**O que você vai ter ao final:** um link tipo `cosmo-matheus.vercel.app` funcionando, com o app abrindo, seus projetos, agenda, ideias e conquistas. A parte de IA (chat, briefing) ainda estará "dormindo" — ela acorda no Marco 2. Isso é de propósito.

**Tempo estimado:** 40 a 60 minutos, sem pressa.

---

## Antes de começar: as 3 contas

Você vai criar três coisas gratuitas. Todas têm plano grátis que sobra pro seu uso.

1. **Conta no GitHub** (o depósito do código)
2. **Programa Git** no seu Windows (a ferramenta que envia o código pro GitHub)
3. **Conta na Vercel** (quem publica o site)

Não precisa criar tudo agora — o guia avisa a hora de cada uma.

---

## Passo 1 — Criar a conta no GitHub

1. Abra o navegador e vá em **github.com**
2. Clique em **Sign up** (cadastrar)
3. Digite seu email, crie uma senha, escolha um nome de usuário (ex: `matheuscorrea`)
4. Confirme o email que eles enviam
5. Quando perguntarem sobre plano, escolha o **Free** (grátis)

Pronto. Você tem o depósito.

---

## Passo 2 — Instalar o Git no Windows

O Git é o "caminhão" que leva seus arquivos até o GitHub.

1. Vá em **git-scm.com/download/win**
2. O download começa sozinho (escolha "64-bit Git for Windows Setup" se perguntar)
3. Abra o arquivo baixado e vá clicando em **Next** em todas as telas — pode aceitar tudo que já vem marcado. Não precisa entender cada tela; os padrões estão certos.
4. No final, clique em **Install** e depois **Finish**

**Como saber se deu certo:** aperte a tecla **Windows**, digite `cmd` e abra o "Prompt de Comando" (aquela telinha preta). Digite:

```
git --version
```

Se aparecer algo como `git version 2.xx`, funcionou. Se disser que "git não é reconhecido", reinicie o computador e tente de novo.

---

## Passo 3 — Baixar os arquivos do C.O.S.M.O.

Eu te entreguei uma pasta chamada **cosmo-app** (com todos os arquivos do projeto). 

1. Coloque essa pasta num lugar fácil de achar, por exemplo direto em `C:\cosmo-app` ou na sua Área de Trabalho.
2. Confirme que dentro dela existem: a pasta `src`, a pasta `api`, a pasta `public`, e arquivos como `package.json` e `index.html`.

> Dica: evite deixar a pasta dentro do OneDrive, pois às vezes ele atrapalha. Área de Trabalho ou `C:\` direto é mais tranquilo.

---

## Passo 4 — Criar o repositório (a "gaveta") no GitHub

1. Entre no **github.com** logado
2. No canto superior direito, clique no **+** e depois em **New repository**
3. Em **Repository name**, escreva: `cosmo`
4. Deixe marcado **Private** (privado — só você vê)
5. **NÃO** marque nenhuma caixa de "Add a README" ou ".gitignore" — deixe tudo desmarcado
6. Clique em **Create repository**

A próxima tela mostra uns comandos. Não feche essa aba — vamos usar em seguida.

---

## Passo 5 — Enviar os arquivos pro GitHub

Aqui é a parte da telinha preta. Vou te dar cada comando pronto. Você **copia e cola um por um**, apertando Enter depois de cada.

1. Abra o **Prompt de Comando** (tecla Windows → digite `cmd` → Enter)

2. Entre na pasta do projeto. Se ela está na Área de Trabalho, digite (troque `SeuUsuario` pelo nome de usuário do seu Windows):

```
cd Desktop\cosmo-app
```

Se você colocou em `C:\cosmo-app`, então digite:

```
cd C:\cosmo-app
```

3. Agora, um de cada vez, cole estes comandos (aperte Enter após cada linha):

```
git init
```
```
git add .
```
```
git commit -m "C.O.S.M.O. primeira versao"
```

> Se na primeira vez o Git pedir pra configurar seu nome e email, ele mostra os comandos. Rode-os assim (com seus dados):
> ```
> git config --global user.name "Matheus Correa"
> git config --global user.email "seuemail@exemplo.com"
> ```
> E depois repita o `git commit -m "C.O.S.M.O. primeira versao"`.

4. Agora conecte ao seu repositório. **Volte na aba do GitHub** (a que ficou aberta no Passo 4) e copie o endereço que aparece — algo como `https://github.com/matheuscorrea/cosmo.git`. Então rode (colando SEU endereço):

```
git remote add origin https://github.com/SEU-USUARIO/cosmo.git
```
```
git branch -M main
```
```
git push -u origin main
```

5. Nesse último comando, vai abrir uma janela pedindo pra você **entrar no GitHub**. Faça o login pelo navegador que ele abrir. Isso autoriza o envio.

**Deu certo?** Atualize a página do seu repositório no GitHub. Os arquivos (src, api, public...) devem estar lá agora. 🎉

---

## Passo 6 — Publicar na Vercel

Agora a parte mais fácil e mais satisfatória.

1. Vá em **vercel.com**
2. Clique em **Sign Up** e escolha **Continue with GitHub** (entrar com o GitHub) — assim já conecta tudo
3. Autorize a Vercel a ver seus repositórios
4. No painel, clique em **Add New...** → **Project**
5. Encontre o repositório **cosmo** na lista e clique em **Import**
6. Na tela de configuração, **não precisa mexer em nada** — a Vercel reconhece que é um projeto Vite sozinha
7. Clique em **Deploy**

Espere um ou dois minutos. Quando terminar, aparece uma tela de parabéns com uma miniatura do seu app. Clique nela ou no botão **Visit** (Visitar).

**O C.O.S.M.O. está no ar.** O endereço é algo como `cosmo-xxxx.vercel.app`. Esse link funciona em qualquer lugar do mundo, no seu celular, no PC de qualquer pessoa.

---

## Passo 7 — Instalar no celular (como um app)

1. Abra o link da Vercel no navegador do celular (Chrome no Android, Safari no iPhone)
2. **No Android (Chrome):** toque nos três pontinhos → **Adicionar à tela inicial**
3. **No iPhone (Safari):** toque no ícone de compartilhar (quadrado com seta) → **Adicionar à Tela de Início**
4. Confirme

Agora tem um ícone do C.O.S.M.O. na sua tela, com a logo orbital. Abre em tela cheia, sem barra de navegador. Parece um app de loja — mas é seu, sem loja, sem taxa.

---

## O que esperar (e o que NÃO vai funcionar ainda)

✅ **Funciona agora:** criar/abrir projetos, subtarefas, marcar como feito, agenda, datas importantes, ideias, conquistas, tudo salvo no aparelho.

⏳ **Ainda dormindo (Marco 2):** o chat com o C.O.S.M.O., o "Briefing do dia", o "Organize meu dia" e o "quebrar em subtarefas". Eles dependem da chave de IA, que a gente configura com segurança no próximo marco. Por enquanto, se você tocar neles, o app não quebra — só mostra um aviso ou um texto padrão.

⏳ **Marco 3:** login e sincronização entre celular e PC (hoje os dados ficam separados em cada aparelho).

⏳ **Marco 4:** Google Agenda e voz.

---

## Se algo der errado

- **"git não é reconhecido"** → reinicie o PC depois de instalar o Git.
- **O push pede senha e não aceita** → é o login pelo navegador que resolve; se não abriu, me chame que te passo o jeito com "token".
- **A Vercel deu erro no deploy** → me mande o texto vermelho que apareceu; quase sempre é uma coisinha de um arquivo, e resolvo rápido.
- **O app abriu em branco** → me avise, provavelmente é um detalhe de configuração.

Qualquer tela estranha, tira um print e me manda. A gente resolve junto.

---

## Quando terminar

Me diga **"Marco 1 no ar"** e a gente parte pro **Marco 2**: acordar o cérebro do C.O.S.M.O. com segurança. Vai ser bem mais curto que este.
