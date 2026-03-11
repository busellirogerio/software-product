# Re⟳Loop — Sistema de Gerenciamento de Oficina Automotiva
<br>
<br>
📋 O que é o projeto?
- O **Re⟳Loop** é um sistema de gerenciamento para oficinas de troca de óleo fracionado. Desenvolvido como projeto acadêmico para a 
  disciplina de Software Product na **Faculdade Impacta — ADS**.
- O nome "Re⟳Loop" representa o ciclo contínuo de relacionamento com 
  cliente: o veículo entra na oficina, recebe o serviço, e retorna periodicamente — criando um **loop de fidelização**.
<br>
<br>
🎯 A que se destina?
- Oficinas de pequeno e médio porte
- Gestão completa de clientes, veículos e serviços
- Controle de retenção (clientes sem retorno há +12 meses)
- Prospecção ativa (eventos futuros)
- Indicadores de performance (KPIs)

<br>
<br>

📦 Entregas por Etapas

✅ AC0 — Estrutura Inicial
- Estrutura de pastas e arquivos
- Configuração do ambiente (Node.js, SQL Server)
- Banco de dados com tabela Usuarios
- Sistema de login com criptografia bcrypt
- Dashboard base com navegação
- Versionamento Git/GitHub


✅ AC1 — Cadastro de Clientes
- Criptografia de senhas (bcrypt)
- Módulo Clientes:
    - 🔍 Buscar (nome, CPF/CNPJ)
    - ➕ Cadastrar
    - ✏️ Editar
    - 🚫 Inativar (soft delete)
    - 📋 Listar com ordenação
    - ♻️ Reativar


🔜 AC2 — Cadastro de Veículos [EM DESENVOLVIMENTO]
- Módulo Veículos:
    - 🔍 Buscar (placa)
    - ➕ Cadastrar (vinculado a proprietário)
    - ✏️ Editar
    - 🚫 Inativar (soft delete)
    - 📋 Listar com ordenação
    - ♻️ Reativar
- Formulário de Suporte


🔜 AC3 — Cadastro de Serviços [EM DESENVOLVIMENTO]
- Módulo Serviços:
    - 🔍 Buscar
    - ➕ Cadastrar
    - ✏️ Editar
    - 🚫 Inativar
    - 📋 Listar
- Tela de Alterar Senha


🔜 AC4 — Eventos Futuros e KPIs [EM DESENVOLVIMENTO]
- Lista de Eventos Futuros (prospecção)
- Relatório KPI geral
- Indicadores de retenção
- Performance de atendimento

<br>
<br>

🛠️ Stack Tecnológica

Backend

| Tecnologia | Função |

| Node.js | Ambiente de execução JavaScript no servidor |
| Express.js | Framework web para APIs REST |
| mssql | Driver de conexão com SQL Server |
| bcrypt | Criptografia de senhas |
| dotenv | Variáveis de ambiente |
| express-rate-limit | Proteção contra força bruta |
| cors | Controle de acesso entre origens |


Frontend

| Tecnologia | Função |

| HTML5 | Estrutura das páginas |
| CSS3 | Estilização e responsividade |
| JavaScript (Vanilla) | Interatividade e consumo de APIs |


Banco de Dados

| Tecnologia | Função |

| SQL Server 2019+ | Armazenamento relacional |
| SSMS | Administração do banco |


Ferramentas

| Ferramenta | Função |

| Git / GitHub | Controle de versão |
| Postman | Testes de API |
| VS Code | Editor de código |
| Nodemon | Reinício automático em dev |



🤔 Por que essas tecnologias?


Node.js + Express.js
- Uma única linguagem (JS) no front e back
- Assíncrono por natureza
- Ecossistema npm gigante
- Leve e rápido
- Padrão de mercado


SQL Server
- Robusto e confiável
- Suporte a triggers (auditoria automática)
- Transações ACID
- Ferramentas visuais (SSMS)
- Disponível no ambiente acadêmico


HTML + CSS + JS Vanilla
- Fundamentos primeiro
- Sem dependências externas
- Controle total do código
- Manutenção simplificada


#bcrypt + rate-limit
- Padrão da indústria para senhas
- Salting automático
- Proteção contra ataques



📁 Estrutura de Pastas [EM DESENVOLVIMENTO]

```
software-product/
│
├── sql/
│   ├── Usuarios.sql
│   ├── Clientes.sql
│   └── Veiculos.sql [EM DESENVOLVIMENTO]
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── repositories/
│   │   ├── usuarioRepository.js
│   │   ├── clienteRepository.js
│   │   └── veiculoRepository.js [EM DESENVOLVIMENTO]
│   │
│   ├── controllers/
│   │   ├── usuarioController.js
│   │   ├── clienteController.js
│   │   └── veiculoController.js [EM DESENVOLVIMENTO]
│   │
│   └── routes/
│       ├── usuarioRoutes.js
│       ├── clienteRoutes.js
│       └── veiculoRoutes.js [EM DESENVOLVIMENTO]
│
├── public/
│   ├── pages/
│   │   ├── login.html
│   │   └── dashboard.html [EM DESENVOLVIMENTO]
│   │
│   └── assets/
│       ├── css/
│       │   ├── style.css
│       │   ├── login.css
│       │   ├── dashboard.css [EM DESENVOLVIMENTO]
│       │   ├── clientes.css
│       │   └── veiculos.css [EM DESENVOLVIMENTO]
│       │
│       ├── js/
│       │   ├── config.js
│       │   ├── auth.js
│       │   ├── login.js
│       │   ├── dashboard.js [EM DESENVOLVIMENTO]
│       │   ├── clientes.js
│       │   └── veiculos.js [EM DESENVOLVIMENTO]
│       │
│       └── image/
│
├── acs/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```



📄 Arquivos de Configuração

.env — Variáveis de Ambiente
Armazena credenciais sensíveis que **nunca** são versionadas:
- Porta do servidor
- Credenciais do banco
- Chaves de API
⚠️ **Nunca versionar este arquivo!**


.gitignore — Arquivos Ignorados
Lista o que o Git deve ignorar:
- `node_modules/`
- `.env`
- `acs/`
- Arquivos de sistema


package.json — Manifesto
Define o projeto Node.js:
- Nome e versão
- Scripts de execução
- Lista de dependências


🏗️ Arquitetura Backend

Cliente → server.js → routes → controller → repository → SQL Server
        
                                    ↓
Cliente ← server.js ← routes ← controller ← repository ← SQL Server


| Camada | Responsabilidade |
| --- | --- |
| server.js | Entrada da aplicação, middlewares |
| config/ | Pool de conexões com banco |
| routes/ | Mapeamento de URLs |
| controllers/ | Validações e respostas HTTP |
| repositories/ | Queries SQL |



🧪 Como Testar Localmente

1. Pré-requisitos
- Node.js 18+
- SQL Server 2019+
- SSMS
- Git


2. Passo a Passo
bash
Clone o repositório
git clone https://github.com/busellirogerio/software-product.git
cd software-product


Instale dependências
npm install


Execute os SQLs no SSMS (na ordem)
- Usuarios.sql
- Clientes.sql
- Veiculos.sql


Crie o .env na raiz
PORT=3000
DB_SERVER=127.0.0.1
DB_DATABASE=SoftwareProduct
DB_USER=sa
DB_PASSWORD=SuaSenhaAqui
DB_PORT=1433


Inicie o servidor
npm run dev


Acesse
http://127.0.0.1:3000


3. Credenciais de Teste
- **Usuário:** admin
- **Senha:** Senha@123


⚠️ O que Alterar para Ambiente Local


| Arquivo | Alterar |
| --- | --- |
| .env | DB_SERVER — IP do seu SQL Server |
| .env | DB_USER — seu usuário |
| .env | DB_PASSWORD — sua senha |
| .env | DB_PORT — porta (padrão 1433) |


💡 **SQL Server Express?**
Use: `DB_SERVER=localhost\SQLEXPRESS`


📡 Endpoints da API


Usuários
| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | /api/usuarios/login | Autenticação |
| POST | /api/usuarios/reset-senha | Nova senha |
| GET | /api/usuarios | Listar |
| POST | /api/usuarios | Criar |
| PUT | /api/usuarios/:id | Atualizar |
| DELETE | /api/usuarios/:id | Inativar |


Clientes
| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | /api/clientes | Listar |
| GET | /api/clientes/buscar | Buscar |
| GET | /api/clientes/:id | Por ID |
| POST | /api/clientes | Criar |
| PUT | /api/clientes/:id | Atualizar |
| DELETE | /api/clientes/:id | Inativar |
| PATCH | /api/clientes/:id/reativar | Reativar |


Veículos
| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | /api/veiculos | Listar |
| GET | /api/veiculos/buscar | Buscar placa |
| GET | /api/veiculos/cliente | Buscar proprietário |
| GET | /api/veiculos/:id | Por ID |
| POST | /api/veiculos | Criar |
| PUT | /api/veiculos/:id | Atualizar |
| PATCH | /api/veiculos/:id/inativar | Inativar |
| PATCH | /api/veiculos/:id/reativar | Reativar |


👤 Autor
- Buselli Rogerio
- Ricardo Mendes
- Gustavo Sampaio de Almeida

Faculdade Impacta — ADS — 2026

📜 Licença

Projeto acadêmico — uso educacional.
