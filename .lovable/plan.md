
## Problema identificado

O arquivo `src/App.css` contém estilos herdados do template padrão Vite que conflitam com o layout do dashboard:

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;       /* <-- cria padding indesejado */
  text-align: center;  /* <-- centraliza tudo */
}
```

Esses estilos fazem com que:
1. O `#root` fique limitado a 1280px e centralizado com padding
2. O `text-align: center` afeta todo o conteúdo filho
3. O layout do dashboard fica comprimido e mal posicionado

## Solução

**Arquivo:** `src/App.css`

Limpar completamente o `src/App.css`, removendo os estilos do template Vite e deixando o `#root` ocupar 100% da largura e altura sem restrições, para que o Tailwind e o dashboard funcionem corretamente.

```css
#root {
  width: 100%;
  min-height: 100vh;
}
```

Isso é tudo que precisa ser feito — uma única alteração de arquivo.
