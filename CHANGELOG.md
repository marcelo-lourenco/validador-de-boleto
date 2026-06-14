# Registro de Alterações

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

---

## 1.2.0 (2026-06-14)

### Redesign e Experiência do Usuário (UX/UI)

* **Redesign Visual Completo**: Interface modernizada com layout minimalista, "glassmorphism", bordas finas e sombras profundas.
* **Tema Escuro (Dark Theme)**: Adicionado suporte a tema claro e escuro, sincronizado automaticamente com as preferências do sistema operacional e salvando a escolha manual do usuário localmente.
* **Tipografia Aprimorada**: Integração das fontes Outfit (textos gerais) e JetBrains Mono (campos numéricos).
* **Usabilidade dos Inputs**: Inputs configurados como transparentes para encaixe perfeito de labels flutuantes, e resultados alterados para somente leitura (`readonly`) para melhor contraste de fonte.
* **Componentes Tais e Arejados**: Aumento na altura física de campos e botões principal (paddings maiores) e maior espaçamento vertical geral.

### Acessibilidade (a11y) e Interações

* **Componentes de Atalho e Copiar**:
  * Substituição dos antigos botões por botões focáveis via teclado com `aria-label` descritivos.
  * Inclusão de um novo componente Toast animado para notificação de cópia bem-sucedida.
* **Refatoração do Rodapé**: Rodapé reestruturado em 3 seções flex-aligned (Avisos e Suporte à esquerda, links para ferramentas online da Box4Dev ao centro, e estrela única de avaliação à direita).
* **Correções de Tooltips**: Ajustes específicos de margens e transições para evitar o corte/overflow dos tooltips das laterais da janela de exibição do popup.
* **Novos Ícones Personalizados**: Substituição dos ícones do rodapé por SVGs limpos com cores consistentes de hover.

### Limpeza e Otimização

* **Remoção de Código de Barras**: Remoção total da lógica de renderização de códigos de barras (e exclusão física da biblioteca `JsBarcode.all.min.js`), deixando a extensão extremamente rápida e leve.

---

## 1.0.2 (2024-09-27)

### Funcionalidade

* Ajuste "fator de vencimento" à partir de 22/02/2025

### Adiciona Arquivos

* CHANGELOG.md
* LICENSE

---

## 1.0.1 (2024-04-18)

### Construção do pacote

* Validador de Boleto
* Conversor de Linha Digitável em Código de Barras
* Conversor de Código de Barras em Linha Digitável
* Gerador de código-de-barras
