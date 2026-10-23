# Pesquisa de usuários do Canva: o que o Meu Editor pode fazer melhor

Feita com a skill `replica-entrepreneur` (replica-skill) em 23/10/2026.

## Limites desta pesquisa

- O ambiente de nuvem bloqueia o acesso direto às páginas de avaliação (App Store,
  Trustpilot, Reddit, Hacker News, Reclame Aqui). A pesquisa foi feita só pela busca
  na web, que devolve **resumos** das páginas, não avaliações copiadas palavra por
  palavra. Por isso não há `reviews.csv` nem contagem por tema: os números abaixo são
  os que as próprias fontes publicam.
- Amostra: 4 buscas, cerca de 10 fontes distintas. A skill pede 100+ avaliações de
  3+ fontes. Trate os temas como **direção**, não como prova.
- Para uma rodada completa: liberar `trustpilot.com`, `reclameaqui.com.br`,
  `itunes.apple.com` e `reddit.com` em *Network access* do ambiente.

## 1. O que eles odeiam

| # | Problema | Força da evidência | Fontes |
|---|---|---|---|
| 1 | Cobrança depois de cancelar, teste grátis que vira cobrança, cancelamento difícil, suporte que não responde | **Forte**: aparece em 5 fontes diferentes, em inglês e português | [BBB](https://www.bbb.org/us/tx/austin/profile/online-shopping/canva-0825-1000193781/complaints), [PissedConsumer](https://canva.pissedconsumer.com/review.html) (média 1,8 em ~1.500 avaliações), [Reclame Aqui](https://www.reclameaqui.com.br/canva/cobranca-indevida-e-dificuldade-para-cancelar-assinatura-canva-pro_q79EbcgpE70SMiwH/), [Trustpilot](https://www.trustpilot.com/review/canva.com), [Capterra](https://www.capterra.com/p/168956/Canva/reviews/) |
| 2 | Os melhores modelos e elementos ficam atrás do plano pago; designs ficam com "cara de Canva" | Média: 2 fontes | [Software Advice](https://www.softwareadvice.com/graphic-design/canva-profile/reviews/), [Capterra](https://www.capterra.com/p/168956/Canva/reviews/) |
| 3 | Lento e travando em designs pesados, com muitas imagens | Média: 2 fontes | [Try or Bye](https://www.tryorbye.com/products/canva), [Trustpilot](https://www.trustpilot.com/review/canva.com) |
| 4 | Aumento de preço do plano de equipe (mínimo de 3 usuários) | Fraca: 1 fonte agregadora | [My Engineering Buddy](https://www.myengineeringbuddy.com/blog/canva-reviews-alternatives-pricing-offerings/) |
| 5 | Excesso de modelos: demora para achar o certo | Fraca: 1 fonte | [Software Advice](https://www.softwareadvice.com/graphic-design/canva-profile/reviews/) |

## 2. O que falta

| # | Pedido | Força | Fontes |
|---|---|---|---|
| 1 | Edição offline (o Canva depende da nuvem) | Média: 2 fontes, uma voltada a corretores | [AI and Realtors](https://aiandrealtors.com/review-canva-ai), [Capterra](https://www.capterra.com/p/168956/Canva/reviews/) |
| 2 | Créditos de IA que não acabam no meio do mês | Fraca: 1 fonte | [AI and Realtors](https://aiandrealtors.com/review-canva-ai) |
| 3 | Área de edição maior em panfletos | Fraca: 1 avaliação | [Capterra, pág. 89](https://www.capterra.com/p/168956/Canva/reviews/?page=89) |

## 3. O que ninguém resolve (posicionamento)

- **Corretores compram pacotes de modelos prontos** no Etsy e Gumroad para usar dentro
  do Canva ([exemplo](https://creativevinesrealtor.gumroad.com/l/JustlistedPostcardJustSoldPostTemplate)).
  Sinal de que o Canva genérico não entrega o fluxo do corretor pronto.
- O trabalho repetido do corretor (os mesmos dados do imóvel e do corretor digitados
  em cada post, story e capa de vídeo) não aparece como recurso do Canva em nenhuma
  fonte. Isto é **inferência**, não reclamação citada.

## 4. Plano de melhorias

Ordem pela força da evidência e pelo custo de fazer.

| # | O que construir | Tamanho | Responde a |
|---|---|---|---|
| 1 | ✅ (feito) **Ficha do imóvel**: preencher uma vez (tipo, bairro, quartos, vagas, m², preço, fotos) e todos os modelos de imóveis se preenchem sozinhos | M | Seção 3 |
| 2 | ✅ (feito) **Minha marca**: logo, cores, nome, CRECI e telefone salvos uma vez e aplicados em todo modelo | M | 1.2 ("cara de Canva"), seção 3 |
| 3 | **Pacote de divulgação**: exportar de uma vez post, story, capa de Reels e miniatura do YouTube do mesmo imóvel | M | Seção 3 |
| 4 | **100% offline**: embutir as fontes no app, sem depender do Google Fonts | P | 2.1 |
| 5 | **Busca e filtro de modelos** | P | 1.5 |
| 6 | Manter leve com fotos grandes (já reduz para 2000 px; medir com 10+ fotos) | P | 1.3 |
| 7 | **Sem armadilha de cobrança**: se um dia for vendido, preço único ou mensal com cancelamento em 1 clique e aviso antes de cobrar | (decisão de negócio) | 1.1 |

## 5. Posicionamento

Opção A (recomendada):
> Para corretores que perdem tempo montando o mesmo post toda vez, o Meu Editor
> preenche os dados do imóvel e a sua marca em todos os formatos de uma só vez,
> sem assinatura surpresa.
> Evidência: seção 3 (inferência) e tema 1.1 (forte, 5 fontes).

Opção B:
> Para quem cansou de cobranças depois de cancelar, um editor de artes para imóveis
> com preço claro e que funciona até sem internet.
> Evidência: temas 1.1 (forte) e 2.1 (média).

Opção C:
> Para corretores cujas artes parecem iguais às de todo mundo, modelos de imóveis
> com a sua identidade aplicada automaticamente.
> Evidência: tema 1.2 (média).

Não usar o nome "Canva" no nome do app, em anúncios ou na divulgação.
