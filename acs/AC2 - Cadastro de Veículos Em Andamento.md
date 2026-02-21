# AC2 - Cadastro de Veículos * Em Andamento…

**Projeto:** TrocaOleo — Sistema de Gerenciamento de Oficina
**Instituição:** Faculdade Impacta | **Curso:** ADS
**Data:** 21/02/2026 | **Versão:** 0.1 (Em Andamento — Backend Concluído)
**Autor:** Buselli Rogerio

---

## 🎯 Objetivo do AC2

Implementar o módulo completo de gerenciamento de veículos, integrado ao dashboard existente como seção SPA (Single Page Application), garantindo:

- Cadastro de veículos vinculados a clientes (FK → dbo.Clientes)
- Validação de placa nos formatos antigo (ABC-1234) e Mercosul (ABC1D23)
- Busca por placa e por proprietário (CPF/CNPJ)
- Inativação com desvinculação de proprietário (Ativo = 0 + ClienteId = NULL)
- Reativação com vínculo a novo proprietário
- Atualização de Km a cada serviço com DataAtualizacao automática
- Interface accordion colapsável sem abertura de novas abas
- Listagem ordenável por Marca (crescente/decrescente)
- Sem delete permanente — regra de negócio: só via banco com permissão TI

---

## 📦 Stack Tecnológica

**Backend:** Node.js + Express.js + SQL Server + bcrypt
**Frontend:** HTML5 + CSS3 + JavaScript Vanilla
**Banco:** SQL Server 2019+ com triggers automáticos
**Segurança:** Rate limiting + CORS + Hash de senhas + Pool de conexões

---

## 🗂️ Board AC2 — Resumo

| Fase | O que é | Status |
| --- | --- | --- |
| Fase 1 | Escopo — definição das regras de negócio | ✅ |
| Fase 2 | Banco de Dados — tabela Veiculos | ✅ |
| Fase 3 | Backend — repository + controller + routes | ✅ |
| Fase 4 | Atualização — server.js | ✅ |
| Fase 5 | Frontend — dashboard.html (seção veículos) | ⏳ |
| Fase 6 | Frontend — veiculos.css | ⏳ |
| Fase 7 | Frontend — veiculos.js | ⏳ |
| Fase 8 | Checklist de Testes | ⏳ |
| Fase 9 | Versionamento GitHub | ⏳ |

---

## 🚀 Mapa de Implantação — Ordem Prioritária

---

## FASE 1 — Escopo e Regras de Negócio

> **Decisões tomadas antes do desenvolvimento:**
> 

**Tabela `dbo.Veiculos` — campos:**

- `VeiculoId` — PK
- `ClienteId` — FK → `dbo.Clientes` (nullable = sem proprietário)
- `Marca`, `Modelo`, `Motorizacao`, `AnoModelo`
- `Placa` — nullable, aceita formato antigo e Mercosul
- `Km` — atualizado a cada serviço
- `Ativo` — soft delete
- `DataCriacao` / `DataAtualizacao` — trigger automático

**Operações:**

- Cadastrar veículo — placa e proprietário obrigatórios
- Editar veículo
- Inativar — `Ativo = 0` + `ClienteId = NULL` (sai da lista, pode ser reativado)
- Reativar — `Ativo = 1` + vincula novo `ClienteId`
- Listar todos — ordenação crescente/decrescente por Marca
- Buscar por placa
- Buscar por proprietário (CPF/CNPJ via JOIN com Clientes)

**Regras de negócio:**

- Sem delete permanente no sistema — apenas via banco com permissão TI
- Ao inativar, sistema pergunta: *"Veículo inativo. Deseja vincular a um proprietário e reativar?"*
- Proprietário é vinculado pelo CPF/CNPJ — sistema busca o `ClienteId` e confirma o nome antes de salvar
- `NULL` no `ClienteId` = sem proprietário (sem cliente genérico no banco)
- Frota não precisa de nova tabela — é consulta sobre `dbo.Veiculos`

---

## FASE 2 — Banco de Dados

---

### 2.1 — `sql/Veiculos.sql`

> **Por quê?** Define a estrutura completa da tabela `dbo.Veiculos` com FK para `dbo.Clientes`, suporte a placa nos dois formatos, Km com validação de valor positivo, soft delete com desvinculação de proprietário e auditoria automática via trigger. Os 4 índices otimizam as buscas mais frequentes: placa, clienteId, marca/modelo e status ativo.
> 

```sql
-- =========================================
-- BANCO: SoftwareProduct
-- TABELA: dbo.Veiculos
-- VERSÃO: 1.0 - AC2
-- DATA: 2026-02-21
-- AUTOR: Buselli Rogerio
-- =========================================

USE SoftwareProduct;
GO

-- =========================================
-- LIMPEZA — remove objetos existentes
-- =========================================
IF OBJECT_ID('dbo.TR_Veiculos_SetDataAtualizacao', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_Veiculos_SetDataAtualizacao;
GO

IF OBJECT_ID('dbo.Veiculos', 'U') IS NOT NULL
    DROP TABLE dbo.Veiculos;
GO

-- =========================================
-- CRIAÇÃO DA TABELA
-- =========================================
CREATE TABLE dbo.Veiculos
(
    VeiculoId           INT IDENTITY(1,1)  NOT NULL,
    ClienteId           INT                NULL,
    Marca               NVARCHAR(50)       NOT NULL,
    Modelo              NVARCHAR(80)       NOT NULL,
    Motorizacao         NVARCHAR(20)       NULL,
    AnoModelo           NVARCHAR(9)        NULL,
    Placa               NVARCHAR(8)        NULL,
    Km                  INT                NULL
        CONSTRAINT CK_Veiculos_Km CHECK (Km IS NULL OR Km >= 0),
    Ativo               BIT                NOT NULL
        CONSTRAINT DF_Veiculos_Ativo DEFAULT (1),
    DataCriacao         DATETIME2(0)       NOT NULL
        CONSTRAINT DF_Veiculos_DataCriacao DEFAULT (SYSDATETIME()),
    DataAtualizacao     DATETIME2(0)       NOT NULL
        CONSTRAINT DF_Veiculos_DataAtualizacao DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_Veiculos
        PRIMARY KEY CLUSTERED (VeiculoId),
    CONSTRAINT FK_Veiculos_ClienteId
        FOREIGN KEY (ClienteId)
        REFERENCES dbo.Clientes (ClienteId)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
GO

-- =========================================
-- ÍNDICES
-- =========================================
CREATE NONCLUSTERED INDEX IX_Veiculos_Placa
    ON dbo.Veiculos (Placa) WHERE Ativo = 1;
GO

CREATE NONCLUSTERED INDEX IX_Veiculos_ClienteId
    ON dbo.Veiculos (ClienteId) WHERE Ativo = 1;
GO

CREATE NONCLUSTERED INDEX IX_Veiculos_Marca_Modelo
    ON dbo.Veiculos (Marca, Modelo) WHERE Ativo = 1;
GO

CREATE NONCLUSTERED INDEX IX_Veiculos_Ativo
    ON dbo.Veiculos (Ativo)
    INCLUDE (VeiculoId, Marca, Modelo, Placa, ClienteId);
GO

-- =========================================
-- TRIGGER
-- =========================================
CREATE TRIGGER dbo.TR_Veiculos_SetDataAtualizacao
ON dbo.Veiculos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE v
        SET DataAtualizacao = SYSDATETIME()
    FROM dbo.Veiculos v
    INNER JOIN inserted i ON i.VeiculoId = v.VeiculoId;
END;
GO

PRINT '✅ Tabela dbo.Veiculos criada com sucesso!';
GO
```

---

### 2.2 — `sql/TesteVeiculos.sql`

> **Por quê?** Valida a tabela antes de subir o backend. Executa o ciclo completo de 14 passos: inserção de 2 veículos, atualização de Km, verificação do trigger de auditoria, busca por placa e proprietário, inativação, listagem crescente/decrescente e reativação. O bloco ZERAR está comentado — descomente apenas para resetar o ambiente de testes.
> 

**14 passos:**

| Passo | O que faz |
| --- | --- |
| 1 | Verifica estado inicial |
| 2-3 | Cria 2 veículos |
| 4 | Confirma inserções com JOIN Clientes |
| 5 | Edita Km (troca após serviço) |
| 6 | Verifica trigger DataAtualizacao |
| 7 | Busca por placa |
| 8 | Busca por CPF/CNPJ do proprietário |
| 9 | Inativa (Ativo=0 + ClienteId=NULL) |
| 10 | Confirma inativação |
| 11-12 | Lista ativos crescente e decrescente |
| 13 | Reativa + vincula novo proprietário |
| 14 | Confirma reativação |

---

## FASE 3 — Backend

---

### 3.1 — `src/repositories/veiculoRepository.js`

> **Por quê?** Camada exclusiva de acesso ao banco para veículos. Toda query SQL centralizada aqui. Implementa listagem com JOIN em Clientes, buscas por placa e CPF/CNPJ, criação com dois passos (INSERT + SELECT separado por causa do trigger), atualização, inativação e reativação. A placa é normalizada (maiúsculo, sem traço) antes de qualquer operação.
> 

**Métodos implementados:**

| Método | O que faz |
| --- | --- |
| `listarTodos(ordem)` | Lista ativos com JOIN Clientes, ordem ASC/DESC |
| `buscarPorId(id)` | Busca por ID — ativos e inativos |
| `buscarPorPlaca(placa)` | Remove traço/espaço automaticamente |
| `buscarPorProprietario(cpfCnpj)` | Via JOIN com Clientes |
| `buscarClientePorCpfCnpj(cpfCnpj)` | Valida proprietário no formulário |
| `criar(dados)` | INSERT + SELECT separado (fix trigger OUTPUT) |
| `atualizar(id, dados)` | UPDATE + SELECT separado (fix trigger OUTPUT) |
| `inativar(id)` | Ativo=0 + ClienteId=NULL |
| `reativar(id, clienteId)` | Ativo=1 + vincula novo proprietário |

```jsx
// src/repositories/veiculoRepository.js
// — arquivo completo gerado no AC2
// — ver arquivo no projeto
```

---

### 3.2 — `src/controllers/veiculoController.js`

> **Por quê?** Camada intermediária entre rotas e repository. Valida todos os campos recebidos, normaliza placa (remove traço, maiúsculo), valida formato antigo (ABC1234) e Mercosul (ABC1D23) via regex, valida Km ≥ 0, verifica existência do veículo antes de atualizar/inativar/reativar. Retorna status HTTP semânticos: 400 (dados inválidos), 404 (não encontrado), 500 (erro interno).
> 

**Métodos e validações:**

| Método | Validações |
| --- | --- |
| `listarTodos` | Query `?ordem=ASC/DESC` |
| `buscar` | `?tipo=placa` ou `?tipo=proprietario` + `valor` obrigatório |
| `buscarPorId` | ID numérico válido |
| `buscarCliente` | CPF 11 ou CNPJ 14 dígitos |
| `criar` | clienteId, marca, modelo, placa obrigatórios + regex placa + Km ≥ 0 |
| `atualizar` | Mesmas validações do criar + verifica se veículo existe |
| `inativar` | Verifica se existe e se já não está inativo |
| `reativar` | clienteId obrigatório + verifica se veículo existe |

```jsx
// src/controllers/veiculoController.js
// — arquivo completo gerado no AC2
// — ver arquivo no projeto
```

---

### 3.3 — `src/routes/veiculoRoutes.js`

> **Por quê?** Registra todas as rotas da API de veículos com rate limiting (100 req/15min) e validação de body em POST/PUT/PATCH. Rotas específicas (`/buscar`, `/cliente`) declaradas antes de `/:id` para evitar conflito de parâmetro. Usa PATCH para inativar/reativar seguindo semântica REST.
> 

**Mapa de rotas:**

| Método | Endpoint | Ação |
| --- | --- | --- |
| GET | `/api/veiculos` | Lista todos (`?ordem=ASC/DESC`) |
| GET | `/api/veiculos/buscar` | Busca por placa ou proprietário |
| GET | `/api/veiculos/cliente` | Busca cliente por CPF/CNPJ |
| GET | `/api/veiculos/:id` | Busca por ID |
| POST | `/api/veiculos` | Cria veículo |
| PUT | `/api/veiculos/:id` | Atualiza veículo |
| PATCH | `/api/veiculos/:id/inativar` | Inativa (Ativo=0 + ClienteId=NULL) |
| PATCH | `/api/veiculos/:id/reativar` | Reativa + vincula proprietário |

```jsx
// src/routes/veiculoRoutes.js
// — arquivo completo gerado no AC2
// — ver arquivo no projeto
```

---

## FASE 4 — Atualização: server.js

> **Por quê?** O `server.js` recebeu 3 alterações para suportar o módulo de veículos. O restante permanece idêntico ao AC1.
> 

**Alterações aplicadas (marcadas com `// AC2`):**

```jsx
// Linha 11 — import
const veiculoRoutes = require('./src/routes/veiculoRoutes'); // AC2

// Linha 38 — CORS: PATCH adicionado
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // AC2

// Linha 82 — registro da rota
app.use('/api/veiculos', veiculoRoutes); // AC2
```

---

## FASE 5 a 7 — Frontend ⏳

> Pendente. Será desenvolvido na continuação do AC2.
> 

**Arquivos a criar:**

- `public/pages/dashboard.html` — seção veículos (atualização)
- `public/assets/css/veiculos.css`
- `public/assets/js/veiculos.js`

**Funcionalidades previstas:**

- Accordion: Cadastrar Novo / Buscar-Editar / Listar Todos
- Campo CPF/CNPJ no formulário → busca cliente → confirma nome antes de salvar
- Busca por placa detecta veículo inativo → pergunta se deseja reativar
- Ordenação crescente/decrescente por Marca
- Máscara de placa automática

---

## FASE 8 — Checklist de Testes

---

### 🗄️ Banco de Dados — SSMS ✅

- [x]  Executar `Veiculos.sql` — tabela criada sem erros
- [x]  FK `ClienteId` → `dbo.Clientes` criada
- [x]  Índices criados
- [x]  Trigger `TR_Veiculos_SetDataAtualizacao` funcionando

---

### ⚙️ Backend — Postman ✅

- [x]  `GET /api/veiculos` — `200 OK`
- [x]  `POST /api/veiculos` — `201 Created`
- [x]  `PUT /api/veiculos/1` — `200 OK` — Km atualizado
- [x]  `PATCH /api/veiculos/1/inativar` — `200 OK` — `Ativo=0` + `ClienteId=NULL`
- [x]  `PATCH /api/veiculos/1/reativar` — `200 OK` — `Ativo=1` + `ClienteId` vinculado

---

### 🌐 Frontend — Navegador ⏳

> Pendente. Será validado na continuação do AC2.
> 

---

## FASE 9 — Versionamento GitHub ⏳

> Pendente. Será executado ao concluir o frontend.
> 

**Arquivos a versionar:**

| Arquivo | Tipo | Descrição |
| --- | --- | --- |
| `sql/Veiculos.sql` | SQL | Tabela, trigger e índices |
| `sql/TesteVeiculos.sql` | SQL | Script de validação (14 passos) |
| `src/repositories/veiculoRepository.js` | Backend | Queries SQL |
| `src/controllers/veiculoController.js` | Backend | Validações e respostas HTTP |
| `src/routes/veiculoRoutes.js` | Backend | Rotas da API |
| `public/assets/css/veiculos.css` | Frontend | Estilos do módulo ⏳ |
| `public/assets/js/veiculos.js` | Frontend | Lógica do módulo ⏳ |
| `server.js` | Config | 3 alterações AC2 |
| `public/pages/dashboard.html` | Frontend | Seção veículos ⏳ |

```bash
git add .
git commit -m "AC2: módulo cadastro de veículos completo - CRUD + busca + inativar/reativar"
git push origin main
```

---

## Autor

Buselli Rogerio — Faculdade Impacta — ADS 2026

*AC2 — Versão 0.1 | 21/02/2026 | Backend concluído — Frontend pendente*