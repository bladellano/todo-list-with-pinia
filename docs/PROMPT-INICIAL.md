# TODO LIST COM TAGS

### **Objetivo**

Criar uma **aplicação web simples de lista de tarefas (Todo List) com suporte a tags**, focada em uso pessoal, sem overengineering, priorizando clareza, organização de código e reaproveitamento de soluções existentes.

---

### **Formato de Retorno**

* Estrutura do projeto (pastas e arquivos principais)
* Explicação breve da arquitetura escolhida
* Exemplos de código essenciais (componentes, store Pinia, persistência em `data.json`)
* Sugestão de bibliotecas já existentes quando fizer sentido
* Fluxo de telas e estados da aplicação

---

### **Avisos**

* Evitar overengineering e abstrações desnecessárias
* Não reinventar soluções já consolidadas
* Evitar repetição de código
* Manter responsabilidades bem distribuídas
* Código simples, legível e fácil de manter
* Caso algo não seja explicitamente definido, tomar a decisão mais simples possível e justificar

---

### **Contexto**

A aplicação deve conter:

#### **Autenticação**

* Autenticação inicial simples (sem foco em segurança avançada)
* Após autenticar, redirecionar para a aplicação principal

#### **Layout / UX**

* Interface construída com **Tailwind CSS**
* Layout simples e funcional
* Menu com as opções:

  * **Início**
  * **Configuração** (CRUD de Tags)
  * **Sair**

#### **Tarefas (Tela Principal)**

* Listagem de tarefas
* Cada tarefa deve permitir:

  * Editar
  * Apagar
  * Ordenar via **drag and drop**
* Ordenação padrão:

  * Por data de criação (DESC)
* O usuário pode alterar manualmente a ordem das tarefas

#### **Tags**

* CRUD de tags na tela de configuração
* Associação de tags às tarefas

#### **Persistência**

* Dados armazenados em um arquivo local `data.json`
* O arquivo **não será versionado**
* Persistir:

  * Tarefas
  * Ordem personalizada
  * Tags

#### **Gerenciamento de Estado**

* Utilizar **Pinia** para controle de estado da aplicação
