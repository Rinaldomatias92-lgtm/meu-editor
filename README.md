# Meu Editor

Editor de design no navegador, no estilo do Canva, feito com React, [Konva](https://konvajs.org/) e [jsPDF](https://github.com/parallax/jsPDF).

## Recursos

- **Canvas**: formas (retângulo, círculo, triângulo, estrela, linha, contorno), texto e imagens enviadas — arrastar, redimensionar e girar. Dois cliques num texto para editar.
- **Camadas e alinhamento**: ocultar, bloquear e reordenar camadas; alinhar à página; guias magnéticas ao arrastar.
- **Ficha do imóvel** (aba Imóvel): título, bairro, quartos, vagas, área, preço, até 3 fotos e dados do corretor, preenchidos uma vez. Os modelos de Imóveis se preenchem sozinhos; editar um texto à mão desliga ele da ficha.
- **Modelos**: promoção, citação, story de evento, capa de apresentação, cartão de visita e tamanhos em branco.
- **Exportação**: PNG e PDF no tamanho real do design.
- Desfazer/refazer, atalhos de teclado, zoom e salvamento automático no navegador.

## Atalhos

| Tecla | Ação |
| --- | --- |
| Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y | Desfazer / refazer |
| Ctrl+D | Duplicar |
| Delete / Backspace | Excluir |
| Setas (Shift = 10px) | Mover |
| Esc | Tirar seleção |

## Abrindo pelo atalho (Windows)

- **Meu Editor.bat** — clique duas vezes para abrir o editor no navegador. Ele atualiza o código (`git pull`), instala as dependências e liga o servidor. Funciona dentro da pasta do projeto ou copiado para a área de trabalho (nesse caso usa `%USERPROFILE%\meu-editor`). Deixe a janela preta aberta enquanto usa.
- **Meu Editor (online).url** — abre a versão publicada, sem instalar nada.

## Rodando

```bash
npm install
npm run dev              # servidor de desenvolvimento
npm run build            # build de produção em dist/
npm run build:artifact   # página única em dist-artifact/meu-editor.html (para publicar como Artifact no claude.ai)
```

## Estrutura

- `src/App.tsx` — layout, histórico, painéis, exportação
- `src/Canvas.tsx` — palco Konva, seleção, guias de alinhamento, edição de texto
- `src/templates.ts` — modelos e tamanhos de página
- `src/types.ts` — tipos do design
