# lojafemininasite

## Aurora — loja de moda feminina (protótipo front-end)

Site completo de e-commerce de moda feminina, desenvolvido em **HTML, CSS e JavaScript puro** (sem frameworks), com visual de boutique: paleta creme/areia/marrom/dourado, tipografia serifada + sans e imagens reais.

### Páginas

| Página | Arquivo | Destaque |
|---|---|---|
| Home | `index.html` | Hero, categorias, novidades, mais vendidas, looks, newsletter |
| Categoria | `categoria.html` | Filtros (tamanho, cor, preço, disponibilidade), chips, ordenação, busca |
| Produto | `produto.html` | Galeria, cores/tamanhos com estoque, guia de medidas, entrega estimada |
| Sacola | `carrinho.html` | Quantidades, cupom `AURORA10`, frete por CEP (grátis > R$ 299), checkout simulado |
| Sobre | `sobre.html` | História e compromissos da marca |
| Atendimento | `atendimento.html` | Entrega, trocas, pagamento, FAQ e contato |

### Estrutura

```
├── index.html · categoria.html · produto.html · carrinho.html · sobre.html · atendimento.html
├── css/style.css        # design system completo (tokens, componentes, responsivo)
├── js/
│   ├── data.js          # catálogo: 25 produtos, 9 categorias, looks e informativos
│   ├── app.js           # carrinho, favoritos, busca, menu, toasts, utilitários
│   ├── home.js · categoria.js · produto.js · carrinho.js · atendimento.js
└── assets/img/          # 53 fotos (p01.jpg … p53.jpg)
```

### Como rodar

Basta abrir `index.html` no navegador, ou servir localmente:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

### Observações

- Carrinho e favoritos usam `localStorage` (persistem entre sessões).
- Checkout é **simulado** (protótipo front-end); pagamento e gestão de pedidos não estão integrados.
- Número de WhatsApp é um placeholder: `5511999999999` (em `js/app.js` → `configurarWhats`).
- Lighthouse: acessibilidade, boas práticas e SEO em 100.
