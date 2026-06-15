# DracoBits - Vertical Slice (Etapa 7) 🐉💻

Este repositório contém o protótipo digital (Vertical Slice) do jogo **DracoBits**[cite: 1, 2, 3], desenvolvido como parte da disciplina de desenvolvimento de jogos do curso de Sistemas de Informação. 

O objetivo desta etapa é validar o *core gameplay loop* do projeto: cuidar de uma criatura digital, manter suas necessidades básicas e enfrentar falhas do sistema antes do colapso[cite: 1, 3].

## 🎮 Acesso Rápido

* **Jogue no Navegador:** [Cole aqui o link do seu GitHub Pages]
* **Vídeo de Demonstração:** [Cole aqui o link do seu vídeo de 1 minuto]
* **Relatório em PDF:** [Cole o link do seu PDF no Drive, ou avise se enviou via portal da disciplina]

## 🕹️ Como Jogar

O protótipo foca exclusivamente nas mecânicas vitais[cite: 1]. Não há arte final, apenas placeholders para validar a lógica[cite: 1].

1. O quadrado Azul Neon no centro da tela representa o **Draco**[cite: 2].
2. Com o passar do tempo, as necessidades de **Fome** e **Higiene** do Draco diminuem sozinhas[cite: 1, 3].
3. Utilize o clique do mouse nos botões **ALIMENTAR** e **LIMPAR**[cite: 1] para restaurar os status para 100%.
4. **Condição de Derrota:** Se a Fome ou a Higiene chegarem a 0%, o sistema entra em colapso (Game Over)[cite: 1, 3]. Atualize a página (F5) para reiniciar o ciclo.

## 🛠️ Detalhes Técnicos

* **Engine/Linguagem:** JavaScript Vanilla (ES6) e HTML5 Canvas.
* **Arquitetura:** Loop de jogo clássico (`requestAnimationFrame`) com controle de estados simples via variáveis de tempo (timers).
* **Foco:** Sem uso de bibliotecas externas para garantir máxima leveza e facilidade de distribuição via web.

## 👩‍💻 Autoria

Desenvolvido por **Camille Silva**[cite: 1, 2, 3].