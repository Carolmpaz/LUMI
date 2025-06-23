## 1. Título do Projeto

**LUMI – Sua Luz na Jornada da Alfabetização**


## 2. Objetivo do Projeto

O projeto visa criar uma inteligência artificial adaptativa para auxiliar na alfabetização de crianças neurodivergentes, considerando suas necessidades e estilos de aprendizagem. A solução permite que a IA avalie o nível de conhecimento da criança e identifique quais estímulos — visuais, sonoros ou sensoriais digitais — são mais eficazes para ela. A partir disso, adapta atividades personalizadas que promovem o aprendizado de forma inclusiva, interativa e eficiente. O público-alvo são crianças de 4 a 15 anos, acompanhadas por pais, cuidadores ou educadores.



## 3. Descrição do Projeto

### 3.1. Escopo da Solução

A solução consiste em um aplicativo que utiliza IA para avaliar, acompanhar e personalizar atividades de alfabetização para crianças neurodivergentes. O sistema oferece atividades digitais baseadas em estímulos que melhor funcionam para cada criança, com geração de relatórios de progresso e histórico de evolução.

### 3.2. Fora do Escopo

* Atendimento presencial
* Atividades físicas fora do ambiente digital
* Intervenções terapêuticas clínicas

### 3.3. Problema do Público-Alvo

Crianças neurodivergentes enfrentam desafios na alfabetização quando expostas a métodos tradicionais, que não consideram suas formas únicas de aprender. Faltam ferramentas adaptativas que reconheçam seus ritmos, estilos de aprendizagem e preferências sensoriais.

### 3.4. Proposta de Valor com IA

A IA aprende, por meio de reforço e análise de desempenho, quais estímulos são mais eficazes para a criança e ajusta as atividades automaticamente. A geração dinâmica de conteúdos adaptados diferencia o projeto de soluções tradicionais ou com conteúdo fixo.

### 3.5. Impacto Esperado

- Acelerar e facilitar a alfabetização de crianças neurodivergentes.
- Reduzir frustrações no processo de ensino-aprendizagem.
- Promover clareza aos pais, cuidadores e educadores com dados claros sobre o progresso da criança.

### 3.6. Relevância e Atualidade

O projeto atende a uma demanda crescente por tecnologias educacionais inclusivas, especialmente no contexto pós-pandemia, onde o ensino remoto e híbrido se tornou mais presente. Ele também está alinhado com as diretrizes de inclusão educacional e acessibilidade.



## 4. Análise de Mercado

### 4.1.  Metodologia: Design Research Methodology (DRM)

* **Exploração:** Análise de mercado sobre tecnologias assistivas para educação.
* **Modelagem:** Mapeamento das soluções existentes e identificação de lacunas.
* **Implementação:** Desenvolvimento de uma IA adaptativa focada na alfabetização.
* **Avaliação:** Validação com pais, educadores e especialistas em neurodivergência.

### 4.2. Metodologia: Customer Development

* **Descoberta:** Entrevistas com pais, educadores e terapeutas.
* **Validação:** Testes com MVP para confirmar as necessidades.
* **Criação:** Desenvolvimento iterativo com feedback constante.

### 4.3. Dimensionamento de Mercado – TAM, SAM e SOM

| Termo   | Definição                                                                             | Aplicação no Projeto                                                  |
| ------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **TAM** | Todas as crianças neurodivergentes no Brasil (\~2,5 milhões).                         | População-alvo total potencial.                                       |
| **SAM** | Crianças neurodivergentes com acesso à internet e dispositivos (\~1,5 milhão).        | População que tecnicamente pode acessar o app.                        |
| **SOM** | Meta inicial de impacto social: alcançar 3% a 5% do SAM (\~45 mil a 75 mil crianças). | Foco inicial para testes, escalabilidade e impacto social mensurável. |




## 5. Público-Alvo

### 5.1. Persona 1 – Sofia, a Mãe Protetora

* **Idade:** 38 anos
* **Profissão:** Assistente administrativa
* **Localização:** Belo Horizonte – MG
* **Formação:** Ensino médio completo
* **Perfil tecnológico:** Usa redes sociais e aplicativos no celular
* **Dores:** Dificuldade em encontrar ferramentas adaptadas para o filho de 7 anos, diagnosticado com TEA.
* **Objetivos:** Que o filho aprenda a ler e escrever no seu ritmo, sem frustração.
* **Solução:** Lumi oferece atividades personalizadas, fáceis de usar e com acompanhamento do progresso.

### 5.2. Persona 2 – João, o Professor Empático

* **Idade:** 45 anos
* **Profissão:** Professor de educação inclusiva
* **Localização:** São Paulo – SP
* **Formação:** Licenciatura em Pedagogia com especialização em Educação Especial
* **Perfil tecnológico:** Familiarizado com plataformas educacionais
* **Dores:** Turmas heterogêneas, dificuldade em atender todos os alunos de forma personalizada.
* **Objetivos:** Que seus alunos neurodivergentes avancem na alfabetização.
* **Solução:** Lumi auxilia oferecendo atividades adaptativas, liberando tempo para acompanhamento mais qualitativo.



## 6. Requisitos do Sistema

### 6.1 Requisitos Funcionais

| Código | Descrição                                    | Prioridade | Observações                   |
| ------ | -------------------------------------------- | ---------- | ----------------------------- |
| RF01   | Avaliar o nível de conhecimento da criança   | Alta       | Na primeira interação         |
| RF02   | Identificar quais estímulos funcionam melhor | Alta       | Análise baseada em respostas  |
| RF03   | Gerar atividades personalizadas              | Alta       | Com base no perfil da criança |
| RF04   | Oferecer feedback em tempo real              | Média      | Feedback lúdico e sonoro      |
| RF05   | Gerar relatórios de progresso                | Alta       | Para pais e educadores        |
| RF06   | Armazenar histórico de interações            | Alta       | Para personalização contínua  |

### 6.2 Requisitos Não Funcionais

| Código | Descrição                                         | Tipo          | Observações            |
| ------ | ------------------------------------------------- | ------------- | ---------------------- |
| RNF01  | Tempo de resposta inferior a 2 segundos           | Desempenho    | Fluidez nas interações |
| RNF02  | Interface acessível e intuitiva                   | Usabilidade   | Adaptada para crianças |
| RNF03  | Proteção dos dados pessoais e sensíveis           | Segurança     | LGPD e privacidade     |
| RNF04  | Compatibilidade com dispositivos móveis e tablets | Portabilidade | Android e iOS          |



## 7. Componente de Inteligência Artificial

### 7.1 Técnica de IA Aplicada

- **Machine Learning** (Aprendizado por Reforço + Classificação)
- Algoritmos de **Recomendação Adaptativa**
- Análise de desempenho para adaptação de atividades

### 7.2 Justificativa da Técnica

O aprendizado por reforço é ideal, pois permite que o sistema ajuste as atividades com base nas escolhas, erros e acertos da criança, oferecendo experiências personalizadas. Sistemas de recomendação identificam padrões de quais estímulos (visual, sonoro, sensorial) funcionam melhor para cada criança. Essas técnicas são mais eficazes do que modelos supervisionados tradicionais, pois se adaptam dinamicamente ao usuário.

### 7.3 Métricas de Avaliação

- **Taxa de acerto nas atividades**
- **Tempo médio de conclusão das tarefas**
- **Nível de engajamento (interações por sessão)**
- **Acurácia na identificação do estilo de aprendizagem**
- **Precisão na recomendação de estímulos**

---

## 8. Orçamento Estimado

| Item                              | Custo Mensal (R\$) |
| --------------------------------- | ------------------ |
| Servidor em nuvem (AWS/GCP)       | 500                |
| Licenciamento de APIs (IA, voz)   | 700                |
| Banco de dados seguro             | 300                |
| Desenvolvimento inicial (6 meses) | 60.000 (total)     |
| Manutenção e suporte              | 2.000              |
| **Total Mensal Após Lançamento**  | **3.500**          |


Fontes potenciais de financiamento:

- Editais: Finep, CNPq, FAPESP, FINEP Startup, Sebrae, etc.
- Fundos internacionais: UNICEF, UNESCO, Gates Foundation.
- Empresas: via projetos ESG, responsabilidade social e marketing de impacto.
- Setor público: Prefeituras, Secretarias de Educação, MEC.
- ONGs e Instituições do Terceiro Setor.

