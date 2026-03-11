# STATUS CODIGO 01_02  EM 03/03/2026

public/assets

public/pages

```html
<!-- login.html | data: 03/03/2026 -->

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login - Software Product</title>
    <link rel="stylesheet" href="../assets/css/style.css" />
    <link rel="stylesheet" href="../assets/css/login.css" />
  </head>
  <body>
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <img
            src="../assets/image/logomarca.svg"
            alt="Re⟳Loop"
            class="login-logo"
          />
          <p>Sistema de Gerenciamento Oficina</p>
        </div>

        <form id="formLogin" class="login-form">
          <div class="form-group">
            <label for="email">Usuário</label>
            <input
              type="text"
              id="email"
              name="email"
              required
              autocomplete="username"
            />
          </div>
          <div class="form-group">
            <label for="senha">Senha</label>
            <div class="password-container">
              <input
                type="password"
                id="senha"
                name="senha"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                id="toggleSenha"
                class="toggle-password"
                aria-label="Mostrar senha"
              ></button>
            </div>
          </div>
          <button type="submit" class="btn-login">Entrar</button>
          <div class="form-footer">
            <a href="#" id="linkEsqueciSenha" class="link-esqueci"
              >Esqueci minha senha</a
            >
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Esqueci Senha -->
    <div id="modalEsqueciSenha" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Recuperar Senha</h3>
          <button type="button" class="modal-close" id="closeModal">
            &times;
          </button>
        </div>
        <form id="formResetSenha" class="modal-form">
          <div class="form-group">
            <label for="emailReset">Digite seu email:</label>
            <input
              type="email"
              id="emailReset"
              name="email"
              required
              placeholder="seu@email.com"
            />
          </div>
          <div class="modal-buttons">
            <button type="button" id="btnCancelar" class="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" class="btn-enviar">Enviar Solicitação</button>
          </div>
        </form>

        <div id="resetSucesso" class="reset-success" style="display: none">
          <div class="success-icon">✅</div>
          <h4>Solicitação Enviada!</h4>
          <p>Sua nova senha foi gerada com sucesso.</p>
          <div class="protocolo-info">
            <strong>Protocolo: <span id="numeroProtocolo"></span></strong>
            <p class="protocolo-desc">
              Anote este número para consultas futuras
            </p>
          </div>
          <button type="button" id="btnFecharSucesso" class="btn-fechar">
            Fechar
          </button>
        </div>
      </div>
    </div>

    <script src="../assets/js/config.js"></script>
    <script src="../assets/js/login.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('modalEsqueciSenha');
        const linkEsqueci = document.getElementById('linkEsqueciSenha');
        const closeModal = document.getElementById('closeModal');
        const btnCancelar = document.getElementById('btnCancelar');
        const formReset = document.getElementById('formResetSenha');
        const resetSucesso = document.getElementById('resetSucesso');
        const btnFecharSucesso = document.getElementById('btnFecharSucesso');

        linkEsqueci.addEventListener('click', (e) => {
          e.preventDefault();
          modal.style.display = 'block';
          document.getElementById('emailReset').focus();
        });

        const fecharModal = () => {
          modal.style.display = 'none';
          formReset.style.display = 'block';
          resetSucesso.style.display = 'none';
          formReset.reset();
        };

        closeModal.addEventListener('click', fecharModal);
        btnCancelar.addEventListener('click', fecharModal);
        btnFecharSucesso.addEventListener('click', fecharModal);

        modal.addEventListener('click', (e) => {
          if (e.target === modal) fecharModal();
        });

        formReset.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('emailReset').value.trim();
          const btnEnviar = formReset.querySelector('.btn-enviar');

          if (!email) {
            alert('Digite seu email');
            return;
          }

          btnEnviar.disabled = true;
          btnEnviar.textContent = 'Enviando...';

          try {
            const response = await apiRequest('/usuarios/reset-senha', {
              method: 'POST',
              body: { email },
            });
            document.getElementById('numeroProtocolo').textContent =
              response.protocolo;
            formReset.style.display = 'none';
            resetSucesso.style.display = 'block';
          } catch (error) {
            alert(error.message || 'Erro ao enviar solicitação');
          } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar Solicitação';
          }
        });
      });
    </script>
  </body>
</html>

```

```html
<!-- dashboard.html | data: 03/03/2026 -->

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Re⟳Loop - Dashboard</title>

    <!-- ===========================
        CSS — ORDEM OBRIGATÓRIA
        1. style.css     → variáveis globais e reset
        2. dashboard.css → layout, sidebar, home IA
        3. clientes.css  → módulo AC1
        4. veiculos.css  → módulo AC2
    =========================== -->
    <link rel="stylesheet" href="../assets/css/style.css" />
    <link rel="stylesheet" href="../assets/css/dashboard.css" />
    <link rel="stylesheet" href="../assets/css/clientes.css" />
    <link rel="stylesheet" href="../assets/css/veiculos.css" />
  </head>

  <body>
    <!-- ===========================
        HEADER
        - Hambúrguer mobile (canto esquerdo)
        - Logo Re⟳Loop
        - Bem-vindo + botão sair (direita)
    =========================== -->
    <header class="header">
      <div class="header-left">
        <!-- Hambúrguer — visível apenas no mobile -->
        <button
          class="toggle-btn-mobile"
          id="toggleMobile"
          aria-label="Menu mobile"
        >
          <img src="../assets/image/menu.svg" class="nav-icon" alt="Menu" />
        </button>

        <!-- Logo da plataforma -->
        <div class="header-logo">
          <h2>Re<span class="logo-destaque">⟳</span>Loop</h2>
        </div>
      </div>

      <div class="user-info">
        <span>Bem-vindo, <strong id="nomeUsuario">Usuário</strong></span>
        <button id="btnSair" class="btn-sair">
          <img src="../assets/image/sair.svg" alt="Sair" />
        </button>
      </div>
    </header>

    <!-- ===========================
        APP BODY = SIDEBAR + MAIN
    =========================== -->
    <div class="app-body">
      <!-- ===========================
          SIDEBAR — MENU LATERAL
          Web: recolhida (56px) ↔ expandida (210px)
          controlada pela seta na borda direita
          Mobile: overlay, abre pelo hambúrguer
      =========================== -->
      <nav class="sidebar" id="sidebar">
        <!-- NAVEGAÇÃO PRINCIPAL -->
        <button class="nav-item active" data-section="home" aria-label="Início">
          <img src="../assets/image/home.svg" class="nav-icon" alt="Início" />
          <span class="nav-label">Início</span>
        </button>

        <button class="nav-item" data-section="clientes" aria-label="Clientes">
          <img
            src="../assets/image/clientes.svg"
            class="nav-icon"
            alt="Clientes"
          />
          <span class="nav-label">Clientes</span>
        </button>

        <button class="nav-item" data-section="veiculos" aria-label="Veículos">
          <img
            src="../assets/image/veiculos.svg"
            class="nav-icon"
            alt="Veículos"
          />
          <span class="nav-label">Veículos</span>
        </button>

        <button class="nav-item" data-section="servicos" aria-label="Serviços">
          <img
            src="../assets/image/servicos.svg"
            class="nav-icon"
            alt="Serviços"
          />
          <span class="nav-label">Serviços</span>
        </button>

        <button
          class="nav-item"
          data-section="eventos"
          aria-label="Eventos Futuros"
        >
          <img
            src="../assets/image/eventos.svg"
            class="nav-icon"
            alt="Eventos Futuros"
          />
          <span class="nav-label">Eventos Futuros</span>
        </button>

        <!-- KPIs — após Eventos Futuros -->
        <button class="nav-item" data-section="kpis" aria-label="KPIs">
          <img src="../assets/image/kpi.svg" class="nav-icon" alt="KPIs" />
          <span class="nav-label">KPIs</span>
        </button>

        <!-- Espaçador — empurra utilitários para o rodapé -->
        <div class="nav-spacer"></div>

        <!-- UTILITÁRIOS (rodapé) -->
        <button
          class="nav-item"
          data-section="configuracoes"
          aria-label="Configurações"
        >
          <img
            src="../assets/image/configuracao.svg"
            class="nav-icon"
            alt="Configurações"
          />
          <span class="nav-label">Configurações</span>
        </button>

        <button class="nav-item" data-section="suporte" aria-label="Suporte">
          <img
            src="../assets/image/suporte.svg"
            class="nav-icon"
            alt="Suporte"
          />
          <span class="nav-label">Suporte</span>
        </button>

        <!-- Seta de colapso — web only, borda direita da sidebar -->
        <button
          class="sidebar-toggle-arrow"
          id="toggleSidebar"
          aria-label="Expandir/Recolher menu"
        >
          ›
        </button>
      </nav>

      <!-- Overlay mobile — fecha sidebar ao clicar fora -->
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <!-- ===========================
          MAIN — ÁREA DE CONTEÚDO
      =========================== -->
      <main class="main-area">
        <!-- ===========================
            SEÇÃO: INÍCIO — IA Re⟳Loop
            Tela limpa com logo grande e input
            de chat. Input e botões bloqueados até AC5.
        =========================== -->
        <section class="section active" id="sec-home">
          <div class="ia-home">
            <!-- Logo grande centralizada -->
            <div class="ia-logo">
              <h1>Re<span class="logo-destaque">⟳</span>Loop</h1>
              <span class="ia-badge">.IA</span>
            </div>

            <!-- Input de consulta — placeholder AC5 -->
            <div class="ia-input-wrapper">
              <input
                type="text"
                class="ia-input"
                placeholder="Pergunte sobre sua oficina..."
                disabled
              />
              <button class="ia-btn-mic" disabled title="Voz — AC5">
                <img src="../assets/image/microfone.svg" alt="Microfone" />
              </button>
              <button
                class="ia-btn-assistente"
                disabled
                title="IA Assistente — AC5"
              >
                <img
                  src="../assets/image/ia_assistente.svg"
                  alt="IA Assistente"
                />
              </button>
            </div>

            <!-- Botões de ação rápida — placeholder AC5 -->
            <div class="ia-acoes">
              <button class="ia-acao-btn" disabled>Rotina</button>
              <button class="ia-acao-btn" disabled>Tarefas</button>
              <button class="ia-acao-btn" disabled>Pendências</button>
              <button class="ia-acao-btn" disabled>Critíco</button>
              <button class="ia-acao-btn" disabled>Ticket</button>
            </div>

            <p class="ia-hint">
              Inteligência artificial conectada às tabelas da oficina — AC5
            </p>
          </div>
        </section>
        <!-- /SEÇÃO INÍCIO -->

        <!-- ===========================
            SEÇÃO: CLIENTES — AC1
        =========================== -->
        <section class="section" id="sec-clientes">
          <h2 class="section-title">Clientes</h2>
          <div class="accordion">
            <!-- PAINEL 1: BUSCAR / EDITAR -->
            <div class="acc-item" id="acc-busca">
              <div class="acc-header" data-target="acc-busca">
                <div class="acc-header-left">
                  <span class="acc-icon">🔍</span> Pesquisa
                </div>
                <span class="acc-arrow">▼</span>
              </div>
              <div class="acc-body">
                <div class="busca-row">
                  <select id="tipoBusca">
                    <option value="nome">Buscar por Nome</option>
                    <option value="cpfcnpj">Buscar por CPF/CNPJ</option>
                    <option value="telefone">Buscar por Telefone</option>
                  </select>
                  <input
                    type="text"
                    id="valorBusca"
                    placeholder="Digite para buscar..."
                  />
                  <button id="btnBuscar" class="btn btn-primary">Buscar</button>
                  <button id="btnLimparBusca" class="btn btn-secondary">
                    Limpar
                  </button>
                </div>
                <div id="resultadoBusca" style="display: none"></div>
              </div>
            </div>

            <!-- PAINEL 2: CADASTRAR NOVO -->
            <div class="acc-item bloqueado" id="acc-cadastro">
              <div class="acc-header" data-target="acc-cadastro">
                <div class="acc-header-left">
                  <span class="acc-icon">➕</span> Cadastro
                </div>
                <span class="acc-arrow">▼</span>
              </div>
              <div class="acc-body">
                <form id="formCliente">
                  <input type="hidden" id="clienteId" value="" />
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="tipo">Tipo</label>
                      <select id="tipo" name="tipo">
                        <option value="PF">Pessoa Física (PF)</option>
                        <option value="PJ">Pessoa Jurídica (PJ)</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="cpfCnpj">CPF / CNPJ</label>
                      <input
                        type="text"
                        id="cpfCnpj"
                        name="cpfCnpj"
                        placeholder="Só números"
                        maxlength="18"
                      />
                    </div>
                    <div class="form-group form-group-wide">
                      <label for="nomeCompleto">Nome Completo</label>
                      <input
                        type="text"
                        id="nomeCompleto"
                        name="nomeCompleto"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div class="form-group">
                      <label for="dataNascimento">Data de Nascimento</label>
                      <input
                        type="date"
                        id="dataNascimento"
                        name="dataNascimento"
                      />
                    </div>
                    <div class="form-group">
                      <label for="genero">Gênero</label>
                      <select id="genero" name="genero">
                        <option value="">Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="telefone">Telefone</label>
                      <input
                        type="text"
                        id="telefone"
                        name="telefone"
                        placeholder="(11) 99999-0000"
                      />
                    </div>
                    <div class="form-group form-group-check">
                      <label class="check-label">
                        <input
                          type="checkbox"
                          id="telefoneWhatsApp"
                          name="telefoneWhatsApp"
                        />
                        Este número é WhatsApp
                      </label>
                    </div>
                    <div class="form-group">
                      <label for="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div class="form-group">
                      <label for="cep">CEP</label>
                      <input
                        type="text"
                        id="cep"
                        name="cep"
                        placeholder="00000-000"
                        maxlength="9"
                        autocomplete="postal-code"
                      />
                    </div>
                    <div class="form-group form-group-wide">
                      <label for="logradouro">Logradouro</label>
                      <input
                        type="text"
                        id="logradouro"
                        name="logradouro"
                        placeholder="Rua / Avenida"
                        autocomplete="street-address"
                      />
                    </div>
                    <div class="form-group">
                      <label for="numero">Número</label>
                      <input
                        type="text"
                        id="numero"
                        name="numero"
                        placeholder="Nº"
                        autocomplete="off"
                      />
                    </div>
                    <div class="form-group">
                      <label for="complemento">Complemento</label>
                      <input
                        type="text"
                        id="complemento"
                        name="complemento"
                        placeholder="Apto, sala..."
                        autocomplete="off"
                      />
                    </div>
                    <div class="form-group">
                      <label for="bairro">Bairro</label>
                      <input
                        type="text"
                        id="bairro"
                        name="bairro"
                        autocomplete="off"
                      />
                    </div>
                    <div class="form-group">
                      <label for="cidade">Cidade</label>
                      <input
                        type="text"
                        id="cidade"
                        name="cidade"
                        autocomplete="address-level2"
                      />
                    </div>
                    <div class="form-group">
                      <label for="estado">Estado (UF)</label>
                      <input
                        type="text"
                        id="estado"
                        name="estado"
                        maxlength="2"
                        placeholder="SP"
                        autocomplete="address-level1"
                      />
                    </div>
                  </div>
                  <div
                    id="formMensagem"
                    class="form-mensagem"
                    style="display: none"
                  ></div>
                  <div class="form-actions">
                    <button
                      type="button"
                      id="btnCancelar"
                      class="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      id="btnLimpar"
                      class="btn btn-secondary"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      id="btnSalvar"
                      class="btn btn-primary"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- PAINEL 3: LISTAR TODOS -->
            <div class="acc-item" id="acc-lista">
              <div class="acc-header" data-target="acc-lista">
                <div class="acc-header-left">
                  <span class="acc-icon">📋</span> Lista
                </div>
                <span class="acc-arrow">▼</span>
              </div>
              <div class="acc-body">
                <div class="tabela-wrapper">
                  <table class="tabela-clientes">
                    <thead>
                      <tr>
                        <th id="thNome" class="th-ordenavel">
                          Nome <span id="iconeOrdem">▲</span>
                        </th>
                        <th>CPF/CNPJ</th>
                        <th>Telefone</th>
                        <th>Gênero</th>
                        <th>Nascimento</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody id="tbodyClientes">
                      <tr>
                        <td colspan="6" class="tabela-vazia">Carregando...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
        <!-- /SEÇÃO CLIENTES -->

        <!-- ===========================
            SEÇÃO: VEÍCULOS — AC2
        =========================== -->
        <section class="section" id="sec-veiculos">
          <h2 class="section-title">Veículos</h2>
          <div class="accordion" id="accordion-veiculos">
            <!-- PAINEL 1: CADASTRAR NOVO -->
            <div class="acc-item" id="acc-veiculo-cadastro">
              <div class="acc-header" data-target="acc-veiculo-cadastro">
                <div class="acc-header-left">
                  <span class="acc-icon">➕</span> Cadastrar Novo Veículo
                </div>
                <span class="acc-arrow">▼</span>
              </div>
              <div class="acc-body">
                <div id="veiCadVerificar">
                  <div class="busca-row">
                    <input
                      type="text"
                      id="veiPlacaVerificar"
                      placeholder="Digite a placa para verificar..."
                      maxlength="8"
                    />
                    <button id="btnVeiVerificarPlaca" class="btn btn-primary">
                      Verificar
                    </button>
                    <button id="btnVeiCadLimpar" class="btn btn-secondary">
                      Limpar
                    </button>
                  </div>
                </div>
                <div id="veiCadExisteAtivo" style="display: none">
                  <div class="vei-aviso vei-aviso-alerta">
                    <p>
                      ⚠️ Este veículo já está
                      <strong>cadastrado e ativo</strong>.
                    </p>
                    <p id="veiCadInfoAtivo"></p>
                    <p>O que deseja fazer?</p>
                  </div>
                  <div class="form-actions">
                    <button
                      type="button"
                      id="btnVeiCadCancelarAtivo"
                      class="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      id="btnVeiCadTrocarProp"
                      class="btn btn-primary"
                    >
                      Trocar Proprietário
                    </button>
                    <button
                      type="button"
                      id="btnVeiCadInativar"
                      class="btn btn-danger"
                    >
                      Inativar Veículo
                    </button>
                  </div>
                  <div id="veiCadFormTrocarProp" style="display: none">
                    <div class="form-grid">
                      <div class="form-group">
                        <label for="veiCadTrocarCpfCnpj"
                          >CPF/CNPJ do Novo Proprietário</label
                        >
                        <input
                          type="text"
                          id="veiCadTrocarCpfCnpj"
                          placeholder="Só números"
                          maxlength="18"
                        />
                      </div>
                      <div class="form-group">
                        <label>Proprietário</label>
                        <input
                          type="text"
                          id="veiCadTrocarNomeProp"
                          readonly
                          placeholder="Nome confirmado após busca"
                          class="input-readonly"
                        />
                        <input
                          type="hidden"
                          id="veiCadTrocarClienteId"
                          value=""
                        />
                      </div>
                      <div class="form-group vei-btn-buscar-prop">
                        <label>&nbsp;</label>
                        <button
                          type="button"
                          id="btnVeiCadTrocarBuscarProp"
                          class="btn btn-secondary"
                        >
                          Buscar Proprietário
                        </button>
                      </div>
                    </div>
                    <div class="form-actions">
                      <button
                        type="button"
                        id="btnVeiCadConfirmarTroca"
                        class="btn btn-primary"
                      >
                        Confirmar Troca
                      </button>
                    </div>
                  </div>
                </div>
                <div id="veiCadExisteInativo" style="display: none">
                  <div class="vei-aviso vei-aviso-info">
                    <p>
                      ℹ️ Este veículo está
                      <strong>inativo / sem proprietário</strong>.
                    </p>
                    <p id="veiCadInfoInativo"></p>
                    <p>Deseja reativar e vincular um proprietário?</p>
                  </div>
                  <div class="form-actions">
                    <button
                      type="button"
                      id="btnVeiCadCancelarInativo"
                      class="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      id="btnVeiCadSimReativar"
                      class="btn btn-primary"
                    >
                      Sim, Reativar
                    </button>
                  </div>
                  <div id="veiCadFormReativar" style="display: none">
                    <div class="form-grid">
                      <div class="form-group">
                        <label for="veiCadReativaCpfCnpj"
                          >CPF/CNPJ do Proprietário</label
                        >
                        <input
                          type="text"
                          id="veiCadReativaCpfCnpj"
                          placeholder="Só números"
                          maxlength="18"
                        />
                      </div>
                      <div class="form-group">
                        <label>Proprietário</label>
                        <input
                          type="text"
                          id="veiCadReativaNomeProp"
                          readonly
                          placeholder="Nome confirmado após busca"
                          class="input-readonly"
                        />
                        <input
                          type="hidden"
                          id="veiCadReativaClienteId"
                          value=""
                        />
                      </div>
                      <div class="form-group vei-btn-buscar-prop">
                        <label>&nbsp;</label>
                        <button
                          type="button"
                          id="btnVeiCadReativaBuscarProp"
                          class="btn btn-secondary"
                        >
                          Buscar Proprietário
                        </button>
                      </div>
                      <div class="form-group">
                        <label for="veiCadReativaKm">Km Atual</label>
                        <input
                          type="number"
                          id="veiCadReativaKm"
                          placeholder="Ex: 45000"
                          min="0"
                        />
                      </div>
                    </div>
                    <div class="form-actions">
                      <button
                        type="button"
                        id="btnVeiCadConfirmarReativar"
                        class="btn btn-primary"
                      >
                        Confirmar Reativação
                      </button>
                    </div>
                  </div>
                </div>
                <div id="veiCadFormNovo" style="display: none">
                  <form id="formVeiculo">
                    <div class="form-grid">
                      <div class="form-group">
                        <label for="veiCpfCnpj"
                          >CPF / CNPJ do Proprietário</label
                        >
                        <input
                          type="text"
                          id="veiCpfCnpj"
                          name="veiCpfCnpj"
                          placeholder="Só números"
                          maxlength="18"
                        />
                      </div>
                      <div class="form-group">
                        <label>Proprietário</label>
                        <input
                          type="text"
                          id="veiNomeProprietario"
                          readonly
                          placeholder="Nome confirmado após busca"
                          class="input-readonly"
                        />
                        <input type="hidden" id="veiClienteId" value="" />
                      </div>
                      <div class="form-group vei-btn-buscar-prop">
                        <label>&nbsp;</label>
                        <button
                          type="button"
                          id="btnBuscarProprietario"
                          class="btn btn-secondary"
                        >
                          Buscar Proprietário
                        </button>
                      </div>
                      <div class="form-group">
                        <label for="veiMarca">Marca</label>
                        <input
                          type="text"
                          id="veiMarca"
                          name="veiMarca"
                          placeholder="Ex: Toyota"
                        />
                      </div>
                      <div class="form-group">
                        <label for="veiModelo">Modelo</label>
                        <input
                          type="text"
                          id="veiModelo"
                          name="veiModelo"
                          placeholder="Ex: Corolla"
                        />
                      </div>
                      <div class="form-group">
                        <label for="veiMotorizacao">Motorização</label>
                        <input
                          type="text"
                          id="veiMotorizacao"
                          name="veiMotorizacao"
                          placeholder="Ex: 1.8"
                        />
                      </div>
                      <div class="form-group">
                        <label for="veiAnoModelo">Ano / Modelo</label>
                        <input
                          type="text"
                          id="veiAnoModelo"
                          name="veiAnoModelo"
                          placeholder="Ex: 2020/2021"
                          maxlength="9"
                        />
                      </div>
                      <div class="form-group">
                        <label for="veiPlaca">Placa</label>
                        <input
                          type="text"
                          id="veiPlaca"
                          name="veiPlaca"
                          placeholder="ABC-1234 ou ABC1D23"
                          maxlength="8"
                          class="input-readonly"
                          readonly
                        />
                      </div>
                      <div class="form-group">
                        <label for="veiKm">Km Atual</label>
                        <input
                          type="number"
                          id="veiKm"
                          name="veiKm"
                          placeholder="Ex: 45000"
                          min="0"
                        />
                      </div>
                    </div>
                    <div
                      id="veiFormMensagem"
                      class="form-mensagem"
                      style="display: none"
                    ></div>
                    <div class="form-actions">
                      <button
                        type="button"
                        id="btnVeiLimpar"
                        class="btn btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        id="btnVeiSalvar"
                        class="btn btn-primary"
                      >
                        Salvar Veículo
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <!-- /PAINEL 1 -->

            <!-- PAINEL 2: BUSCAR -->
            <div class="acc-item" id="acc-veiculo-busca">
              <div class="acc-header" data-target="acc-veiculo-busca">
                <div class="acc-header-left">
                  <span class="acc-icon">🔍</span> Buscar / Editar Veículo
                </div>
                <span class="acc-arrow">▼</span>
              </div>
              <div class="acc-body">
                <div class="busca-row">
                  <input
                    type="text"
                    id="veiPlacaBusca"
                    placeholder="Digite a placa..."
                    maxlength="8"
                  />
                  <button id="btnVeiBuscar" class="btn btn-primary">
                    Buscar
                  </button>
                  <button id="btnVeiLimparBusca" class="btn btn-secondary">
                    Limpar
                  </button>
                </div>
                <div style="display: none">
                  <input type="text" id="veiEditMarca" />
                  <input type="text" id="veiEditModelo" />
                  <input type="text" id="veiEditMotorizacao" />
                  <input type="text" id="veiEditAnoModelo" />
                  <input type="text" id="veiEditPlaca" />
                  <input type="number" id="veiEditKm" />
                  <input type="hidden" id="veiEditClienteId" />
                  <input type="text" id="veiEditNomeProprietario" />
                  <input type="text" id="veiEditCpfCnpj" />
                  <button id="btnVeiAtualizar"></button>
                  <button id="btnVeiInativarBusca"></button>
                  <button id="btnVeiEditBuscarProprietario"></button>
                </div>
                <div
                  id="veiFormReativacao"
                  style="display: none; margin-top: 16px"
                >
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="veiReativaCpfCnpj"
                        >CPF/CNPJ do Proprietário</label
                      >
                      <input
                        type="text"
                        id="veiReativaCpfCnpj"
                        placeholder="Só números"
                        maxlength="18"
                      />
                    </div>
                    <div class="form-group">
                      <label>Proprietário</label>
                      <input
                        type="text"
                        id="veiReativaNomeProprietario"
                        readonly
                        placeholder="Nome confirmado após busca"
                        class="input-readonly"
                      />
                      <input type="hidden" id="veiReativaClienteId" value="" />
                    </div>
                    <div class="form-group vei-btn-buscar-prop">
                      <label>&nbsp;</label>
                      <button
                        type="button"
                        id="btnVeiReativaBuscarProp"
                        class="btn btn-secondary"
                      >
                        Buscar Proprietário
                      </button>
                    </div>
                    <div class="form-group">
                      <label for="veiReativaKm">Km Atual</label>
                      <input
                        type="number"
                        id="veiReativaKm"
                        placeholder="Ex: 45000"
                        min="0"
                      />
                    </div>
                  </div>
                  <div class="form-actions">
                    <button
                      type="button"
                      id="btnVeiSimReativar"
                      style="display: none"
                    ></button>
                    <button
                      type="button"
                      id="btnVeiConfirmarReativacao"
                      class="btn btn-primary"
                    >
                      Confirmar Reativação
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- /PAINEL 2 -->

            <!-- PAINEL 3: LISTAR TODOS -->
            <div class="acc-item" id="acc-veiculo-lista">
              <div class="acc-header" data-target="acc-veiculo-lista">
                <div class="acc-header-left">
                  <span class="acc-icon">📋</span> Listar Todos os Veículos
                </div>
                <span class="acc-arrow">▼</span>
              </div>
              <div class="acc-body">
                <div class="tabela-wrapper">
                  <table class="tabela-veiculos">
                    <thead>
                      <tr>
                        <th id="thMarca" class="th-ordenavel">
                          Veículo <span id="iconeOrdemVei">▲</span>
                        </th>
                        <th>Modelo</th>
                        <th>Motorização</th>
                        <th>Ano/Modelo</th>
                        <th>Placa</th>
                        <th id="thProprietario" class="th-ordenavel">
                          Proprietário <span id="iconeOrdemProp">▲</span>
                        </th>
                        <th>Última Km</th>
                        <th>Última Passagem</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody id="tbodyVeiculos">
                      <tr>
                        <td colspan="9" class="tabela-vazia">Carregando...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <!-- /PAINEL 3 -->
          </div>
        </section>
        <!-- /SEÇÃO VEÍCULOS -->

        <!-- ===========================
            SEÇÃO: SERVIÇOS — AC3
        =========================== -->
        <section class="section" id="sec-servicos">
          <h2 class="section-title">Serviços</h2>
          <div class="placeholder">
            <div class="placeholder-icon">🔧</div>
            <h3>Módulo em desenvolvimento</h3>
            <p>Será implementado no AC3</p>
          </div>
        </section>

        <!-- ===========================
            SEÇÃO: EVENTOS FUTUROS — AC4
        =========================== -->
        <section class="section" id="sec-eventos">
          <h2 class="section-title">Eventos Futuros</h2>
          <div class="placeholder">
            <div class="placeholder-icon">📅</div>
            <h3>Módulo em desenvolvimento</h3>
            <p>Será implementado no AC4</p>
          </div>
        </section>

        <!-- ===========================
            SEÇÃO: KPIs
            7 blocos colapsáveis com indicadores
            e gráficos — conectados na AC5
        =========================== -->
        <section class="section" id="sec-kpis">
          <h2 class="section-title">KPIs</h2>

          <!-- BLOCO 1: INDICADORES DA OFICINA -->
          <div class="dash-bloco" id="bloco-indicadores">
            <div class="dash-bloco-header" data-target="bloco-indicadores">
              <span>📊 Indicadores da Oficina</span>
              <span class="dash-bloco-arrow">▼</span>
            </div>
            <div class="dash-bloco-body">
              <div class="cards-grid">
                <div class="card card-total">
                  <img
                    src="../assets/image/frota.svg"
                    class="card-icon"
                    alt="Frota Total"
                  />
                  <span class="card-label"
                    >Frota Total<br /><small
                      >(Total de veículos na base)</small
                    ></span
                  >
                  <span class="card-value" id="totalFrota">0</span>
                </div>
                <div class="card card-alerta">
                  <img
                    src="../assets/image/frota.svg"
                    class="card-icon"
                    alt="Fora da Retenção"
                  />
                  <span class="card-label"
                    >Fora da Retenção<br /><small
                      >(Após 12 meses sem visita)</small
                    ></span
                  >
                  <span class="card-value" id="totalSemRelacionamento">0</span>
                </div>
                <div class="card card-ok">
                  <img
                    src="../assets/image/frota.svg"
                    class="card-icon"
                    alt="Dentro da Retenção"
                  />
                  <span class="card-label"
                    >Dentro da Retenção<br /><small
                      >(Até 12 meses sem visita)</small
                    ></span
                  >
                  <span class="card-value" id="totalComRelacionamento">0</span>
                </div>
              </div>
            </div>
          </div>
          <!-- /BLOCO 1 -->

          <!-- BLOCO 2: LVT — AC5 -->
          <div class="dash-bloco" id="bloco-lvt">
            <div class="dash-bloco-header" data-target="bloco-lvt">
              <span>📊 LVT — Lifetime Value por Cliente</span>
              <span class="dash-bloco-arrow">▼</span>
            </div>
            <div class="dash-bloco-body">
              <div class="placeholder-grafico">
                <p>Gráfico será implementado no <strong>AC5</strong></p>
              </div>
            </div>
          </div>
          <!-- /BLOCO 2 -->

          <!-- BLOCO 3: RETENÇÃO POR ANO — AC5 -->
          <div class="dash-bloco" id="bloco-retencao-ano">
            <div class="dash-bloco-header" data-target="bloco-retencao-ano">
              <span>📊 Retenção por Ano</span>
              <span class="dash-bloco-arrow">▼</span>
            </div>
            <div class="dash-bloco-body">
              <div class="placeholder-grafico">
                <p>Gráfico será implementado no <strong>AC5</strong></p>
              </div>
            </div>
          </div>
          <!-- /BLOCO 3 -->

          <!-- BLOCO 4: RETENÇÃO POR MODELO — AC5 -->
          <div class="dash-bloco" id="bloco-retencao-modelo">
            <div class="dash-bloco-header" data-target="bloco-retencao-modelo">
              <span>📊 Retenção por Modelo</span>
              <span class="dash-bloco-arrow">▼</span>
            </div>
            <div class="dash-bloco-body">
              <div class="placeholder-grafico">
                <p>Gráfico será implementado no <strong>AC5</strong></p>
              </div>
            </div>
          </div>
          <!-- /BLOCO 4 -->

          <!-- BLOCO 5: PERFORMANCE CR — AC5 -->
          <div class="dash-bloco" id="bloco-performance-cr">
            <div class="dash-bloco-header" data-target="bloco-performance-cr">
              <span>📊 Performance CR</span>
              <span class="dash-bloco-arrow">▼</span>
            </div>
            <div class="dash-bloco-body">
              <div class="placeholder-grafico">
                <p>Gráfico será implementado no <strong>AC5</strong></p>
              </div>
            </div>
          </div>
          <!-- /BLOCO 5 -->

          <!-- BLOCO 6: PERFORMANCE CIAS — AC5 -->
          <div class="dash-bloco" id="bloco-performance-cias">
            <div class="dash-bloco-header" data-target="bloco-performance-cias">
              <span>📊 Performance CIAS</span>
              <span class="dash-bloco-arrow">▼</span>
            </div>
            <div class="dash-bloco-body">
              <div class="placeholder-grafico">
                <p>Gráfico será implementado no <strong>AC5</strong></p>
              </div>
            </div>
          </div>
          <!-- /BLOCO 6 -->

          <!-- BLOCO 7: CR | METAS OPERADORAS — AC5 -->
          <div class="dash-bloco" id="bloco-cr-metas">
            <div class="dash-bloco-header" data-target="bloco-cr-metas">
              <span>📊 CR | Metas Operadoras</span>
              <span class="dash-bloco-arrow">▼</span>
            </div>
            <div class="dash-bloco-body">
              <div class="placeholder-grafico">
                <p>Gráfico será implementado no <strong>AC5</strong></p>
              </div>
            </div>
          </div>
          <!-- /BLOCO 7 -->
        </section>
        <!-- /SEÇÃO KPIs -->

        <!-- ===========================
            SEÇÃO: CONFIGURAÇÕES — futuro
        =========================== -->
        <section class="section" id="sec-configuracoes">
          <h2 class="section-title">Configurações</h2>
          <div class="placeholder">
            <div class="placeholder-icon">⚙️</div>
            <h3>Módulo em desenvolvimento</h3>
            <p>A ser definido</p>
          </div>
        </section>

        <!-- ===========================
            SEÇÃO: SUPORTE — futuro
        =========================== -->
        <section class="section" id="sec-suporte">
          <h2 class="section-title">Suporte</h2>
          <div class="placeholder">
            <div class="placeholder-icon">🛟</div>
            <h3>Módulo em desenvolvimento</h3>
            <p>A ser definido</p>
          </div>
        </section>
      </main>
      <!-- /MAIN -->
    </div>
    <!-- /APP BODY -->

    <!-- ===========================
        SCRIPTS — ORDEM OBRIGATÓRIA
        1. config.js    → API_BASE_URL e apiRequest()
        2. auth.js      → verificação de sessão e logout
        3. dashboard.js → navegação, sidebar, blocos
        4. clientes.js  → módulo AC1
        5. veiculos.js  → módulo AC2
    =========================== -->
    <script src="../assets/js/config.js"></script>
    <script src="../assets/js/auth.js"></script>
    <script src="../assets/js/dashboard.js"></script>
    <script src="../assets/js/clientes.js"></script>
    <script src="../assets/js/veiculos.js"></script>
  </body>
</html>

```

```css
/* style.css | date: 03/03/2026 */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #ffffff;
  background: #1e2a45;
  min-height: 100vh;
  overflow-x: hidden;
}

:root {
  --primary-color: #3498db;
  --primary-dark: #2980b9;
  --secondary-color: #2c3e50;
  --success-color: #2ecc71;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --white: #ffffff;
  --light-gray: #ecf0f1;
  --gray: #bdc3c7;
  --dark-gray: #7f8c8d;
  --shadow-light: 0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-medium: 0 4px 8px rgba(0, 0, 0, 0.3);
  --border-radius: 8px;
  --border-radius-large: 12px;
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
  color: #a0aec0;
  font-size: 0.9rem;
}

input,
select,
textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid #2d3748;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: inherit;
  background: #111827;
  color: #ffffff;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

```

```css
/* login.css | data: 03/03/2026 */

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #1e2a45;
  padding: var(--spacing-lg);
}

.login-box {
  background: #1e2a45;
  border-radius: var(--border-radius-large);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  padding: var(--spacing-xxl) var(--spacing-xl);
  width: 100%;
  max-width: 480px;
  animation: slideIn 0.4s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-header h1 {
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: var(--spacing-sm);
  font-weight: 700;
  letter-spacing: 1px;
}

.login-header p {
  color: #a0aec0;
  font-size: 0.85rem;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  color: #a0aec0;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.form-group input {
  background: #111827;
  border: 1px solid #2d3748;
  color: #ffffff;
  border-radius: var(--border-radius);
  padding: 14px 16px;
  font-size: 1rem;
}

.form-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

.password-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-container input {
  width: 100%;
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #a0aec0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.toggle-password:hover {
  color: var(--primary-color);
}

.btn-login {
  width: 100%;
  background: var(--primary-color);
  color: var(--white);
  border: none;
  padding: 16px;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin: var(--spacing-lg) 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.btn-login:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: var(--spacing-md);
}

.link-esqueci {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius);
  color: var(--primary-color);
  font-size: 0.9rem;
  text-decoration: none;
  text-align: center;
  transition: all var(--transition-fast);
  background: transparent;
  cursor: pointer;
}

.link-esqueci:hover {
  background: rgba(52, 152, 219, 0.1);
}

/* Login messages */
.login-message {
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  font-size: 0.9rem;
  text-align: center;
  animation: slideIn 0.3s ease;
}

.login-message.error {
  background: rgba(231, 76, 60, 0.15);
  color: #fc8181;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.login-message.success {
  background: rgba(46, 204, 113, 0.15);
  color: #68d391;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

/* Modal */
.modal {
  display: none;
  position: fixed;
  z-index: 10000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  position: relative;
  background: #ffffff;
  margin: 8% auto;
  border-radius: var(--border-radius-large);
  width: 90%;
  max-width: 480px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  animation: slideIn 0.3s ease-out;
  overflow: hidden;
  color: #2c3e50;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--primary-color);
  color: var(--white);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
}

.modal-close {
  background: none;
  border: none;
  color: var(--white);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  opacity: 0.9;
  transition: opacity var(--transition-fast);
}

.modal-close:hover {
  opacity: 1;
}

.modal-form {
  padding: var(--spacing-xl);
}

.modal-form label {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.modal-form input {
  background: #ffffff;
  border: 1px solid #cbd5e0;
  color: #2c3e50;
  border-radius: var(--border-radius);
  padding: 12px 16px;
  font-size: 1rem;
}

.modal-form input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

.modal-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
}

.btn-cancelar {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-cancelar:hover {
  background: #edf2f7;
}

.btn-enviar {
  background: var(--primary-color);
  color: var(--white);
  border: none;
  padding: 10px 24px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.btn-enviar:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-enviar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Reset Success */
.reset-success {
  padding: var(--spacing-xl);
  text-align: center;
  color: #2c3e50;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.reset-success h4 {
  color: var(--success-color);
  margin-bottom: var(--spacing-md);
  font-size: 1.25rem;
}

.protocolo-info {
  background: rgba(46, 204, 113, 0.1);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-lg);
  border-left: 4px solid var(--success-color);
}

.protocolo-info strong {
  font-size: 1.1rem;
  color: #27ae60;
  display: block;
  margin-bottom: var(--spacing-sm);
}

.btn-fechar {
  background: var(--success-color);
  color: var(--white);
  border: none;
  padding: 10px 24px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-fechar:hover {
  background: #27ae60;
}

@media (max-width: 768px) {
  .login-box {
    padding: var(--spacing-xl);
    max-width: 100%;
  }
  .modal-content {
    width: 95%;
    margin: 15% auto;
  }
  .modal-buttons {
    flex-direction: column;
  }
  .modal-buttons button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: var(--spacing-md);
    align-items: flex-start;
    padding-top: 40px;
  }
  .login-box {
    padding: var(--spacing-lg);
  }
  .login-header h1 {
    font-size: 1.5rem;
  }
  .btn-login {
    padding: 14px;
  }
}

/* Logo e título do login */
.login-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 8px;
}

.login-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 3px;
  margin: 0 0 4px 0;
}

.logo-destaque {
  color: var(--primary-color);
}

```

```css

/* dashboard.css | data: 03/03/2026 */

/* =========================================
   dashboard.css
   Estilos exclusivos do dashboard Re⟳Loop
   Depende de: style.css (variáveis globais)
   ========================================= */

/* ===========================
   LAYOUT GERAL
   html/body ocupam 100% da tela
   sem scroll na página inteira
=========================== */
html,
body {
  height: 100%;
  overflow: hidden;
}

.app-body {
  display: flex;
  height: calc(100vh - 56px); /* desconta o header fixo */
  overflow: hidden;
  position: relative;
}

/* ===========================
   HEADER
   Linha superior fixa com 3 zonas:
   .header-left  → hambúrguer (mobile) + logo
   .user-info    → bem-vindo + botão sair
=========================== */
.header {
  height: 56px;
  background: #1e2a45;
  border-bottom: 1px solid #2d3748;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  z-index: 200;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ===========================
   LOGO Re⟳Loop — HEADER
   .logo-destaque → colore o ⟳
=========================== */
.header-logo h2 {
  font-size: 1.2rem;
  color: #ffffff;
  letter-spacing: 2px;
  margin: 0;
  font-weight: 700;
}

.logo-destaque {
  color: var(--primary-color);
}

/* ===========================
   HAMBÚRGUER — apenas mobile
   Oculta/desoculta a sidebar como overlay
=========================== */
.toggle-btn-mobile {
  display: none; /* oculto no desktop */
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0;
  transition: background 0.2s ease;
}

.toggle-btn-mobile:hover {
  background: #2d3748;
}

.toggle-btn-mobile img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

/* Área direita: "Bem-vindo, X" + botão sair */
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.85rem;
  color: #a0aec0;
}

.user-info strong {
  color: #ffffff;
}

/* Botão sair — sem fundo, só ícone sair.svg */
.btn-sair {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-sair img {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.btn-sair:hover {
  opacity: 0.7;
}

/* ===========================
   SIDEBAR — MENU LATERAL
   Web recolhida: 56px (só ícones)
   Web expandida: 210px (ícone + label)
   Mobile: overlay com translateX
=========================== */
.sidebar {
  width: 56px;
  background: #1e2a45;
  border-right: 1px solid #2d3748;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 0 16px 0;
  gap: 2px;
  flex-shrink: 0;
  overflow: visible;
  transition: width 0.25s ease;
  position: relative;
  z-index: 150;
}

.sidebar.expanded {
  width: 210px;
  align-items: flex-start;
}

/* ===========================
   SETA DE COLAPSO — WEB ONLY
   Na borda direita da sidebar
   Centralizada verticalmente
   Alterna › e ‹ via JS
=========================== */
.sidebar-toggle-arrow {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: #2d3748;
  border: 1px solid #3d4f6b;
  border-radius: 0 8px 8px 0;
  color: #a0aec0;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s ease,
    color 0.2s ease;
  z-index: 160;
  padding: 0;
  line-height: 1;
}

.sidebar-toggle-arrow:hover {
  background: #3d4f6b;
  color: #ffffff;
}

/* ===========================
   OVERLAY MOBILE
   Fundo escuro atrás da sidebar
   Fecha ao clicar
=========================== */
.sidebar-overlay {
  display: none;
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 140;
}

.sidebar-overlay.active {
  display: block;
}

/* ===========================
   ITENS DO MENU
   Recolhido: 40x40 centralizado
   Expandido: largura total com label
=========================== */
.nav-item {
  width: 40px;
  height: 40px;
  padding: 0;
  gap: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #a0aec0;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  transition:
    background 0.2s ease,
    color 0.2s ease;
  align-self: center;
}

.sidebar.expanded .nav-item {
  width: calc(100% - 16px);
  height: 40px;
  padding: 0 12px;
  gap: 12px;
  justify-content: flex-start;
  margin: 0 8px;
  align-self: auto;
}

.nav-item:hover {
  background: #2d3748;
  color: #ffffff;
}

.nav-item.active {
  background: #2d3748;
  color: var(--primary-color);
}

/* SVGs brancos — sem filtro */
.nav-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
  display: block;
}

/* Label: oculto recolhido, visível expandido */
.nav-label {
  display: none;
  font-weight: 500;
  font-size: 0.85rem;
}

.sidebar.expanded .nav-label {
  display: block;
}

/* Espaçador — empurra Configurações e Suporte para o rodapé */
.nav-spacer {
  flex: 1;
  min-height: 20px;
}

/* ===========================
   ÁREA PRINCIPAL
   Scroll interno independente
=========================== */
.main-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: #111827;
}

/* ===========================
   SEÇÕES
   Apenas .active é visível
=========================== */
.section {
  display: none;
}

.section.active {
  display: block;
}

.section-title {
  font-size: 1.4rem;
  color: #ecf0f1;
  font-weight: 600;
  margin-bottom: 28px;
}

/* ===========================
   HOME IA — Re⟳Loop.IA
   Tela limpa centralizada
   Logo grande + badge .IA + input chat
   Input desabilitado até AC5
=========================== */
.ia-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 160px);
  gap: 32px;
  text-align: center;
}

/* Logo grande centralizada */
.ia-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ia-logo h1 {
  font-size: 3.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 4px;
  margin: 0;
  line-height: 1;
}

/* Badge .IA abaixo da logo */
.ia-badge {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color);
  letter-spacing: 3px;
  text-transform: uppercase;
  opacity: 0.85;
}

/* ===========================
   INPUT CHAT
   Caixa alta — texto no topo, ícones no rodapé
   align-items: flex-end → ícones colados embaixo
   Desabilitado até AC5
=========================== */
.ia-input-wrapper {
  display: flex;
  align-items: flex-end; /* ícones alinhados no rodapé */
  gap: 8px;
  width: 100%;
  max-width: 640px;
  min-height: 80px;
  background: #1e2a45;
  border: 1px solid #2d3748;
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.2s ease;
}

.ia-input-wrapper:focus-within {
  border-color: var(--primary-color);
}

.ia-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #a0aec0;
  font-size: 0.95rem;
  padding: 0;
  align-self: flex-start; /* texto começa no topo */
}

.ia-input::placeholder {
  color: #4a5568;
}

.ia-input:disabled {
  cursor: not-allowed;
}

/* ===========================
   BOTÕES MICROFONE E IA ASSISTENTE
   Alinhados no rodapé direito do input
   Desabilitados até AC5
=========================== */
.ia-btn-mic,
.ia-btn-assistente {
  background: transparent;
  border: none;
  cursor: not-allowed;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  flex-shrink: 0;
}

.ia-btn-mic img,
.ia-btn-assistente img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

/* Hint abaixo do input */
.ia-hint {
  font-size: 0.78rem;
  color: #4a5568;
  letter-spacing: 0.5px;
}

/* ===========================
   BOTÕES DE AÇÃO RÁPIDA — IA
   5 sugestões abaixo do input
   Sem emojis, em linha
   Desabilitados até AC5
=========================== */
.ia-acoes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 640px;
  width: 100%;
}

.ia-acao-btn {
  background: transparent;
  border: 1px solid #2d3748;
  border-radius: 20px;
  color: #718096;
  font-size: 0.82rem;
  padding: 8px 16px;
  cursor: not-allowed;
  opacity: 0.6;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
  white-space: nowrap;
}

/* ===========================
   CARDS DE INDICADORES — KPIs
   Grid 3 colunas, cores translúcidas
=========================== */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 8px;
}

.card {
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  box-shadow: var(--shadow-medium);
  transition: transform var(--transition-fast);
  min-height: 154px;
}

.card:hover {
  transform: translateY(-2px);
}

.card-total {
  background: rgba(52, 152, 219, 0.15);
  border: 1px solid rgba(52, 152, 219, 0.25);
}

.card-alerta {
  background: rgba(231, 76, 60, 0.15);
  border: 1px solid rgba(231, 76, 60, 0.25);
}

.card-ok {
  background: rgba(46, 204, 113, 0.15);
  border: 1px solid rgba(46, 204, 113, 0.25);
}

img.card-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.card-label {
  font-size: 0.78rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.4;
}

.card-label small {
  font-size: 0.72rem;
  color: #4a5568;
}

.card-value {
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1;
  color: #ffffff;
}

/* ===========================
   BLOCOS COLAPSÁVEIS — KPIs
   7 blocos na seção KPIs
   Fechados por padrão
   .aberto → abre body e rotaciona seta
=========================== */
.dash-bloco {
  background: #1e2a45;
  border: 1px solid #2d3748;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
}

.dash-bloco-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  color: #a0aec0;
  font-size: 0.9rem;
  font-weight: 500;
  user-select: none;
  transition: background 0.2s ease;
}

.dash-bloco-header:hover {
  background: #253552;
}

.dash-bloco-arrow {
  font-size: 0.75rem;
  transition: transform 0.25s ease;
}

.dash-bloco.aberto .dash-bloco-arrow {
  transform: rotate(180deg);
}

.dash-bloco-body {
  display: none;
  padding: 20px;
  border-top: 1px solid #2d3748;
}

.dash-bloco.aberto .dash-bloco-body {
  display: block;
}

.placeholder-grafico {
  background: #111827;
  border: 2px dashed #2d3748;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  color: #4a5568;
  font-size: 0.85rem;
}

.placeholder-grafico strong {
  color: #718096;
}

/* ===========================
   PLACEHOLDER — módulos futuros
=========================== */
.placeholder {
  background: #1e2a45;
  border: 2px dashed #2d3748;
  border-radius: 12px;
  padding: 64px 32px;
  text-align: center;
  color: #4a5568;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.placeholder h3 {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.placeholder p {
  font-size: 0.85rem;
  color: #4a5568;
}

/* ===========================
   RESPONSIVO — MOBILE (até 768px)
=========================== */
@media (max-width: 768px) {
  .toggle-btn-mobile {
    display: flex;
  }

  .sidebar {
    position: absolute;
    height: 100%;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    width: 210px !important;
    align-items: flex-start;
    z-index: 150;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-toggle-arrow {
    display: none;
  }

  .nav-label {
    display: block;
  }

  .nav-item {
    width: calc(100% - 16px);
    height: 40px;
    padding: 0 12px;
    gap: 12px;
    justify-content: flex-start;
    margin: 0 8px;
    align-self: auto;
  }

  .ia-logo h1 {
    font-size: 2.5rem;
  }

  .ia-input-wrapper {
    max-width: 100%;
  }

  .ia-acoes {
    flex-direction: column;
    align-items: center;
  }

  .user-info {
    gap: 10px;
    font-size: 0.8rem;
  }

  .main-area {
    padding: 20px;
  }

  .card-value {
    font-size: 2.2rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }
}

/* ===========================
   RESPONSIVO — SMALL MOBILE (até 480px)
   Pendente: ajustes header mobile
   (hambúrguer maior, logo maior,
    bem-vindo abaixo da logo)
=========================== */
@media (max-width: 480px) {
  .header {
    padding: 0 16px;
  }

  .header-logo h2 {
    font-size: 0.9rem;
  }

  .main-area {
    padding: 16px;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .ia-logo h1 {
    font-size: 2rem;
    letter-spacing: 2px;
  }
}

```

```css
/* clientes.css | data: 03/03/2026 */

/* =========================================
  clientes.css
  Estilos exclusivos da seção de Clientes
  Depende de: style.css (variáveis globais)
   ========================================= */

/* ===========================
  ACCORDION
=========================== */
.accordion {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.acc-item {
  background: #1e2a45;
  border-radius: 10px;
  overflow: hidden;
}

/* ===========================
  CABEÇALHO DO PAINEL
=========================== */
.acc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-fast);
}

.acc-header:hover {
  background: #243656;
}

.acc-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #ecf0f1;
}

.acc-icon {
  font-size: 1.1rem;
}

.acc-arrow {
  color: #718096;
  font-size: 0.75rem;
  transition: transform var(--transition-normal);
}

/* Rotaciona seta quando aberto */
.acc-item.open .acc-arrow {
  transform: rotate(180deg);
}

/* ===========================
  CORPO DO PAINEL
  Oculto por padrão
  Visível quando .open
=========================== */
.acc-body {
  display: none;
  padding: 20px;
  border-top: 1px solid #2d3748;
}

.acc-item.open .acc-body {
  display: block;
}

/* ===========================
  GRID DO FORMULÁRIO
=========================== */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

/* Campo largo — ocupa 2 colunas quando possível */
.form-group-wide {
  grid-column: span 2;
}

/* Campo checkbox */
.form-group-check {
  display: flex;
  align-items: flex-end;
  padding-bottom: 4px;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a0aec0;
  font-size: 0.85rem;
  cursor: pointer;
}

.check-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

/* ===========================
  BOTÕES DO FORMULÁRIO
=========================== */
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn {
  padding: 10px 22px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--primary-color);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #2d3748;
  color: #a0aec0;
}

.btn-secondary:hover {
  background: #3d4f6b;
  color: #ffffff;
}

/* ===========================
  MENSAGEM DE FEEDBACK
  do formulário
=========================== */
.form-mensagem {
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 0.88rem;
  margin-bottom: 12px;
  animation: slideIn var(--transition-normal);
}

.form-mensagem.success {
  background: rgba(46, 204, 113, 0.15);
  color: #68d391;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.form-mensagem.error {
  background: rgba(231, 76, 60, 0.15);
  color: #fc8181;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

/* ===========================
  BARRA DE BUSCA
=========================== */
.busca-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.busca-row select {
  width: 200px;
  padding: 10px 12px;
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.88rem;
}

.busca-row input {
  flex: 1;
  min-width: 180px;
  padding: 10px 12px;
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.88rem;
}

.busca-row input:focus,
.busca-row select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

/* ===========================
  TABELA DE CLIENTES
=========================== */
.tabela-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.tabela-clientes {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.tabela-clientes thead tr {
  background: #0f1827;
}

.tabela-clientes th {
  padding: 10px 14px;
  text-align: left;
  color: #718096;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
}

.tabela-clientes td {
  padding: 10px 14px;
  border-bottom: 1px solid #1a2438;
  color: #e2e8f0;
}

.tabela-clientes tbody tr:hover td {
  background: #1a2a42;
}

/* Célula quando tabela vazia */
.tabela-vazia {
  text-align: center;
  color: #4a5568;
  padding: 32px !important;
  font-size: 0.9rem;
}

/* ===========================
  BADGES DE GÊNERO
=========================== */
.badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
}

.badge-M {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}
.badge-F {
  background: rgba(155, 89, 182, 0.2);
  color: #bb8fce;
}
.badge-O {
  background: rgba(127, 140, 141, 0.2);
  color: #aab7b8;
}

/* ===========================
  BOTÕES DE AÇÃO NA TABELA
=========================== */
.acoes {
  display: flex;
  gap: 6px;
}

.btn-sm {
  padding: 5px 12px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-editar {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.btn-editar:hover {
  background: rgba(52, 152, 219, 0.4);
}

.btn-excluir {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.btn-excluir:hover {
  background: rgba(231, 76, 60, 0.4);
}

/* ===========================
  RESPONSIVO
=========================== */

/* Tablet */
@media (max-width: 768px) {
  .form-group-wide {
    grid-column: span 1;
  }
  .busca-row {
    flex-direction: column;
  }
  .busca-row select,
  .busca-row input {
    width: 100%;
  }
  .form-actions {
    flex-direction: column;
  }
  .form-actions .btn {
    width: 100%;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .acc-header {
    padding: 14px 16px;
  }
  .acc-body {
    padding: 14px;
  }
  .tabela-clientes th,
  .tabela-clientes td {
    padding: 8px 10px;
    font-size: 0.78rem;
  }
}

/* ===========================
  HEADER ORDENÁVEL
  Coluna Nome clicável
=========================== */
.th-ordenavel {
  cursor: pointer;
  user-select: none;
  transition: color var(--transition-fast);
}

.th-ordenavel:hover {
  color: var(--primary-color);
}

/* ===========================
  PAINEL BLOQUEADO
  Cadastro travado até pesquisa
  data: 03/03/2026
=========================== */
.acc-item.bloqueado .acc-header {
  cursor: not-allowed;
  opacity: 0.6;
}

```

```css
/* veiculos.css | data: 03/03/2026 */

/* =========================================
  veiculos.css
  Estilos exclusivos da seção de Veículos
  Depende de: style.css + clientes.css (base)
   ========================================= */

/* ===========================
  INPUT READONLY
  Campo nome do proprietário
=========================== */
.input-readonly {
  background: #0f1827 !important;
  color: #718096 !important;
  cursor: not-allowed;
}

/* ===========================
  BOTÃO BUSCAR PROPRIETÁRIO
  Alinha verticalmente com inputs
=========================== */
.vei-btn-buscar-prop {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* ===========================
  BOTÃO DANGER — Inativar
=========================== */
.btn-danger {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  padding: 10px 22px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.btn-danger:hover {
  background: rgba(231, 76, 60, 0.4);
  transform: translateY(-1px);
}

/* ===========================
  BOTÃO INATIVAR NA TABELA
=========================== */
.btn-inativar {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.btn-inativar:hover {
  background: rgba(231, 76, 60, 0.4);
}

/* ===========================
  CARD DE RESULTADO
  Veículo encontrado (ativo)
=========================== */
.vei-resultado-card {
  background: #0f1827;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 16px;
  color: #a0aec0;
  font-size: 0.88rem;
  line-height: 1.6;
}

/* ===========================
  AVISOS DE RESULTADO
  Inativo e não encontrado
=========================== */
.vei-aviso {
  border-radius: 8px;
  padding: 16px 18px;
  margin-bottom: 16px;
  font-size: 0.88rem;
  line-height: 1.7;
}

/* Alerta — veículo inativo (amarelo) */
.vei-aviso-alerta {
  background: rgba(243, 156, 18, 0.1);
  border: 1px solid rgba(243, 156, 18, 0.3);
  color: #f6c26b;
}

/* Info — veículo não encontrado (azul) */
.vei-aviso-info {
  background: rgba(52, 152, 219, 0.1);
  border: 1px solid rgba(52, 152, 219, 0.3);
  color: #63b3ed;
}

/* ===========================
  TABELA DE VEÍCULOS
=========================== */
.tabela-veiculos {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.tabela-veiculos thead tr {
  background: #0f1827;
}

.tabela-veiculos th {
  padding: 10px 14px;
  text-align: left;
  color: #718096;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
}

.tabela-veiculos td {
  padding: 10px 14px;
  border-bottom: 1px solid #1a2438;
  color: #e2e8f0;
}

.tabela-veiculos tbody tr:hover td {
  background: #1a2a42;
}

/* ===========================
  RESPONSIVO
=========================== */

/* Tablet */
@media (max-width: 768px) {
  .vei-btn-buscar-prop {
    justify-content: flex-start;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .tabela-veiculos th,
  .tabela-veiculos td {
    padding: 8px 10px;
    font-size: 0.78rem;
  }
}

/* ===========================
  MAIÚSCULAS AUTOMÁTICAS
  Campos de texto do módulo veículos
=========================== */
#sec-veiculos input[type='text'] {
  text-transform: uppercase;
}

```

![image.png](image.png)

```jsx
// auth.js | data: 03/03/2026

// Proteção de rotas e gerenciamento de autenticação
document.addEventListener('DOMContentLoaded', () => {
  // Configurações de autenticação
  const AUTH_CONFIG = {
    sessionKey: 'usuario',
    maxSessionTime: 24 * 60 * 60 * 1000, // 24 horas
    checkInterval: 5 * 60 * 1000, // Verifica sessão a cada 5 minutos
  };

  // Função para obter usuário logado
  const getUsuarioLogado = () => {
    try {
      const usuarioJson = sessionStorage.getItem(AUTH_CONFIG.sessionKey);
      if (!usuarioJson) return null;

      const sessionData = JSON.parse(usuarioJson);

      // Valida estrutura básica da sessão
      if (!sessionData.usuario || !sessionData.loginTime) {
        console.warn('⚠️ Sessão inválida detectada');
        clearSession();
        return null;
      }

      // Verifica se sessão expirou
      const now = Date.now();
      const sessionAge = now - sessionData.loginTime;

      if (sessionAge > AUTH_CONFIG.maxSessionTime) {
        console.warn('⚠️ Sessão expirada');
        clearSession();
        showMessage('Sessão expirada. Faça login novamente.');
        return null;
      }

      return sessionData.usuario;
    } catch (error) {
      console.error('❌ Erro ao recuperar sessão:', error);
      clearSession();
      return null;
    }
  };

  // Função para limpar sessão
  const clearSession = () => {
    sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
    localStorage.removeItem('usuarioLogado'); // Remove legacy storage
  };

  // Função para exibir mensagens
  const showMessage = (message, type = 'error') => {
    const existingAlert = document.querySelector('.auth-alert');
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement('div');
    alert.className = `auth-alert alert-${type}`;
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
      color: white;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 300px;
    `;
    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => alert.remove(), 4000);
  };

  // Função para redirecionar para login
  const redirectToLogin = () => {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('login.html')) {
      console.log('🔒 Redirecionando para login');
      window.location.href = 'http://127.0.0.1:3000/pages/login.html';
    }
  };

  // Função principal de verificação
  const verificarAutenticacao = () => {
    const usuario = getUsuarioLogado();

    if (!usuario) {
      redirectToLogin();
      return false;
    }

    // Atualizar nome do usuário no header
    const nomeEl = document.getElementById('nomeUsuario');
    if (nomeEl) {
      const nomeDisplay = usuario.NomeCompleto || usuario.Login || 'Usuário';
      nomeEl.textContent = nomeDisplay;
      nomeEl.title = `Logado como: ${usuario.Email || usuario.Login}`;
    }

    // Log de atividade
    console.log('✅ Usuário autenticado:', usuario.Login);
    return true;
  };

  // Função de logout
  const logout = () => {
    try {
      const usuario = getUsuarioLogado();
      if (usuario) {
        console.log('👋 Logout realizado:', usuario.Login);
      }

      clearSession();
      showMessage('Logout realizado com sucesso.', 'success');

      // Pequeno delay para mostrar a mensagem
      setTimeout(() => {
        window.location.href = 'http://127.0.0.1:3000/pages/login.html';
      }, 1500);
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      clearSession();
      window.location.href = 'http://127.0.0.1:3000/pages/login.html';
    }
  };

  // Verificar se estamos em uma página protegida
  const currentPath = window.location.pathname;
  const isProtectedPage =
    currentPath.includes('dashboard.html') ||
    currentPath.includes('admin.html') ||
    currentPath.includes('usuarios.html');

  // Executar verificação se estiver em página protegida
  if (isProtectedPage) {
    const isAuthenticated = verificarAutenticacao();

    if (isAuthenticated) {
      // Configurar verificação periódica da sessão
      setInterval(() => {
        const usuario = getUsuarioLogado();
        if (!usuario) {
          showMessage('Sessão perdida. Redirecionando...');
          setTimeout(redirectToLogin, 2000);
        }
      }, AUTH_CONFIG.checkInterval);
    }
  }

  // Configurar botão de sair
  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', (e) => {
      e.preventDefault();

      // Confirmação opcional para logout
      if (confirm('Deseja realmente sair do sistema?')) {
        logout();
      }
    });
  }

  // Detectar tentativa de acesso direto a páginas protegidas
  window.addEventListener('beforeunload', () => {
    if (isProtectedPage && getUsuarioLogado()) {
      // Atualiza timestamp da sessão
      const sessionData = JSON.parse(
        sessionStorage.getItem(AUTH_CONFIG.sessionKey),
      );
      sessionData.lastActivity = Date.now();
      sessionStorage.setItem(
        AUTH_CONFIG.sessionKey,
        JSON.stringify(sessionData),
      );
    }
  });

  // Detectar mudanças na sessionStorage (múltiplas abas)
  window.addEventListener('storage', (e) => {
    if (e.key === AUTH_CONFIG.sessionKey && !e.newValue && isProtectedPage) {
      showMessage('Sessão encerrada em outra aba.');
      setTimeout(redirectToLogin, 2000);
    }
  });

  // Expor funções globais necessárias
  window.logout = logout;
  window.getUsuarioLogado = getUsuarioLogado;
  window.verificarAutenticacao = verificarAutenticacao;
});

```

```jsx
// config.js | data: 03/03/2026

const API_BASE_URL =
  window.location.port === '3000'
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:3000/api';

const CONFIG = {
  api: {
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  auth: {
    sessionKey: 'usuario',
    tokenExpiry: 24 * 60 * 60 * 1000,
  },
  validation: {
    minPasswordLength: 6,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  messages: {
    networkError: 'Erro de conexão. Verifique sua internet.',
    serverError: 'Erro interno do servidor. Tente novamente.',
    sessionExpired: 'Sessão expirada. Faça login novamente.',
    invalidCredentials: 'Email ou senha inválidos.',
  },
};

// ===============================
// apiRequest — suporta dois formatos:
// 1) apiRequest('/endpoint', { method: 'POST', body: payload })
// 2) apiRequest('/endpoint', 'POST', payload)
// ===============================
const apiRequest = async (endpoint, methodOrOptions = {}, bodyArg) => {
  const url = `${CONFIG.api.baseURL}${endpoint}`;

  let options = {};

  // Formato 2: apiRequest(url, 'METHOD', body)
  if (typeof methodOrOptions === 'string') {
    options.method = methodOrOptions;
    if (bodyArg !== undefined) {
      options.body = bodyArg;
    }
  } else {
    // Formato 1: apiRequest(url, { method, body })
    options = { ...methodOrOptions };
  }

  const finalOptions = {
    method: 'GET',
    headers: { ...CONFIG.api.headers },
    ...options,
  };

  // Serializa body se for objeto
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  try {
    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error(CONFIG.messages.networkError);
    }
    throw error;
  }
};

const isValidEmail = (email) => CONFIG.validation.emailRegex.test(email);

const isValidPassword = (password) =>
  password && password.length >= CONFIG.validation.minPasswordLength;

window.CONFIG = CONFIG;
window.apiRequest = apiRequest;
window.isValidEmail = isValidEmail;
window.isValidPassword = isValidPassword;

```

```jsx
// login.js | data: 03/03/2026

document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = sessionStorage.getItem('usuario');
  if (usuarioLogado) {
    window.location.href = 'http://127.0.0.1:3000/pages/dashboard.html';
    return;
  }

  const form = document.getElementById('formLogin');
  const inputEmail = document.getElementById('email');
  const inputSenha = document.getElementById('senha');
  const toggleSenha = document.getElementById('toggleSenha');
  const btnLogin = form.querySelector('button[type="submit"]');

  const eyeOpen = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const eyeClosed = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 4L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  inputSenha.type = 'password';
  toggleSenha.innerHTML = eyeClosed;

  toggleSenha.addEventListener('click', () => {
    const isPassword = inputSenha.type === 'password';
    inputSenha.type = isPassword ? 'text' : 'password';
    toggleSenha.innerHTML = isPassword ? eyeOpen : eyeClosed;
  });

  const showMessage = (message, type = 'error') => {
    const existingMessage = document.querySelector('.login-message');
    if (existingMessage) existingMessage.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `login-message ${type}`;
    messageEl.textContent = message;
    form.insertBefore(messageEl, btnLogin);
    setTimeout(() => messageEl.remove(), 5000);
  };

  const setLoadingState = (loading) => {
    btnLogin.disabled = loading;
    btnLogin.style.opacity = loading ? '0.6' : '1';
    btnLogin.textContent = loading ? 'Entrando...' : 'Entrar';
    inputEmail.disabled = loading;
    inputSenha.disabled = loading;
  };

  const saveUserSession = (usuario) => {
    const sessionData = {
      usuario: usuario,
      loginTime: Date.now(),
      lastActivity: Date.now(),
    };
    sessionStorage.setItem('usuario', JSON.stringify(sessionData));
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    if (!email || !senha) {
      showMessage('Usuário e senha são obrigatórios', 'error');
      return;
    }

    setLoadingState(true);

    try {
      const usuario = await apiRequest('/usuarios/login', {
        method: 'POST',
        body: { email, senha },
      });

      showMessage('Login realizado com sucesso!', 'success');
      saveUserSession(usuario);
      setTimeout(() => {
        window.location.href = 'http://127.0.0.1:3000/pages/dashboard.html';
      }, 1000);
    } catch (error) {
      if (
        error.message.includes('401') ||
        error.message.includes('inválidos')
      ) {
        showMessage('Usuário ou senha incorretos', 'error');
      } else if (error.message.includes('429')) {
        showMessage('Muitas tentativas. Aguarde alguns minutos.', 'error');
      } else if (
        error.message.includes('rede') ||
        error.message.includes('conexão')
      ) {
        showMessage('Erro de conexão. Verifique sua internet.', 'error');
      } else {
        showMessage('Erro interno. Tente novamente.', 'error');
      }
    } finally {
      setLoadingState(false);
    }
  });

  setTimeout(() => inputEmail.focus(), 300);
});

```

```jsx
// dashboard.js | data: 03/03/2026

// ===============================
// dashboard.js
// Controle geral do dashboard Re⟳Loop
// Depende de: config.js, auth.js
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  /* ===========================
     EXIBIR NOME DO USUÁRIO
     Lê sessão gravada pelo auth.js no login
  =========================== */
  const sessionData = sessionStorage.getItem('usuario');
  if (sessionData) {
    const { usuario } = JSON.parse(sessionData);
    const nomeEl = document.getElementById('nomeUsuario');
    if (nomeEl) {
      nomeEl.textContent = usuario.NomeCompleto || usuario.Login || 'Usuário';
    }
  }

  /* ===========================
     INDICADORES — DADOS FIXOS
     Serão conectados à API na AC4
  =========================== */
  document.getElementById('totalFrota').textContent = '0';
  document.getElementById('totalSemRelacionamento').textContent = '0';
  document.getElementById('totalComRelacionamento').textContent = '0';

  /* ===========================
     NAVEGAÇÃO ENTRE SEÇÕES
     Cada .nav-item tem data-section
     indicando qual section exibir
  =========================== */
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const target = item.dataset.section;

      // Remove active de todos os itens e seções
      navItems.forEach((n) => n.classList.remove('active'));
      sections.forEach((s) => s.classList.remove('active'));

      // Ativa o item clicado e a seção correspondente
      item.classList.add('active');
      const targetSection = document.getElementById('sec-' + target);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // Mobile: fecha a sidebar ao clicar em qualquer item
      if (window.innerWidth <= 768) {
        fecharSidebarMobile();
      }
    });
  });

  /* ===========================
     SETA LATERAL — WEB
     Posicionada na borda direita da sidebar
     1 clique: recolhe ↔ expande
     Seta vira direção conforme estado
  =========================== */
  const sidebar = document.getElementById('sidebar');
  const setaBtn = document.getElementById('toggleSidebar');

  if (setaBtn) {
    setaBtn.addEventListener('click', () => {
      sidebar.classList.toggle('expanded');

      // Alterna o caractere da seta conforme estado
      setaBtn.textContent = sidebar.classList.contains('expanded') ? '‹' : '›';
    });
  }

  /* ===========================
     HAMBÚRGUER — MOBILE
     Botão no header (canto superior esquerdo)
     Oculta e desoculta a sidebar como overlay
  =========================== */
  const toggleMobile = document.getElementById('toggleMobile');
  const overlay = document.getElementById('sidebarOverlay');

  // Abre sidebar mobile
  if (toggleMobile) {
    toggleMobile.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
    });
  }

  // Fecha sidebar mobile ao clicar no overlay
  if (overlay) {
    overlay.addEventListener('click', () => {
      fecharSidebarMobile();
    });
  }

  // Função reutilizável para fechar sidebar no mobile
  function fecharSidebarMobile() {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  }

  /* ===========================
     BLOCOS COLAPSÁVEIS — GRÁFICOS
     Usados na seção home:
       - Bloco LVT
       - Bloco Retenção por Ano
       - Bloco Retenção por Modelo
     Clique no header: toggle classe .aberto
     CSS controla visibilidade do body e rotação da seta
  =========================== */
  const blocosHeaders = document.querySelectorAll('.dash-bloco-header');

  blocosHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      // Encontra o bloco pai do header clicado
      const bloco = header.closest('.dash-bloco');
      if (bloco) {
        bloco.classList.toggle('aberto');
      }
    });
  });
});

```

```jsx
// clientes.js | data: 03/03/2026

document.addEventListener('DOMContentLoaded', () => {
  /* ===========================
    ELEMENTOS DO DOM
  =========================== */
  const formCliente = document.getElementById('formCliente');
  const clienteId = document.getElementById('clienteId');
  const btnLimpar = document.getElementById('btnLimpar');
  const btnSalvar = document.getElementById('btnSalvar');
  const formMensagem = document.getElementById('formMensagem');

  const tipoBusca = document.getElementById('tipoBusca');
  const valorBusca = document.getElementById('valorBusca');
  const btnBuscar = document.getElementById('btnBuscar');
  const btnLimparBusca = document.getElementById('btnLimparBusca');
  const resultadoBusca = document.getElementById('resultadoBusca');
  const tbodyBusca = document.getElementById('tbodyBusca');
  const tbodyClientes = document.getElementById('tbodyClientes');

  // CONTROLE DE ORDENAÇÃO
  // 1 = A→Z | -1 = Z→A

  let ordemNome = 1;

  // ACCORDION — abrir/fechar painéis
  // ALTERADO EM: 03/03/2026

  document.querySelectorAll('#sec-clientes .acc-header').forEach((header) => {
    header.addEventListener('click', () => {
      const targetId = header.dataset.target;
      const item = document.getElementById(targetId);

      // Bloqueia painel Cadastro se não pesquisou
      if (item && item.classList.contains('bloqueado')) {
        alert('Efetuar a pesquisa antes!');
        return;
      }

      if (item) item.classList.toggle('open');
    });
  });

  /* ===========================
    HELPERS DE FORMATAÇÃO
  =========================== */
  const formatarCpf = (valor) => {
    const n = valor.replace(/\D/g, '').slice(0, 11);
    return n
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatarCnpj = (valor) => {
    const n = valor.replace(/\D/g, '').slice(0, 14);
    return n
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const formatarData = (data) => {
    if (!data) return '—';
    const [ano, mes, dia] = data.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarDocumento = (doc) => {
    if (!doc) return '—';
    const n = doc.replace(/\D/g, '');
    if (n.length === 11) return formatarCpf(n);
    if (n.length === 14) return formatarCnpj(n);
    return doc;
  };

  /* ===========================
    MÁSCARA CPF/CNPJ no campo
  =========================== */
  const campoCpfCnpj = document.getElementById('cpfCnpj');
  const campoTipo = document.getElementById('tipo');

  campoCpfCnpj.addEventListener('input', () => {
    const tipo = campoTipo.value;
    const valor = campoCpfCnpj.value;
    campoCpfCnpj.value =
      tipo === 'PF' ? formatarCpf(valor) : formatarCnpj(valor);
  });

  campoTipo.addEventListener('change', () => {
    campoCpfCnpj.value = '';
    campoCpfCnpj.focus();
  });

  // EXIBIR MENSAGEM NO FORMULÁRIO

  const mostrarMensagem = (texto, tipo = 'success') => {
    formMensagem.textContent = texto;
    formMensagem.className = `form-mensagem ${tipo}`;
    formMensagem.style.display = 'block';
    setTimeout(() => {
      formMensagem.style.display = 'none';
    }, 4000);
  };

  // LIMPAR FORMULÁRIO
  // alterado: 03/03/2026

  const limparFormulario = () => {
    formCliente.reset();
    clienteId.value = '';
    btnSalvar.textContent = 'Salvar';
    formMensagem.style.display = 'none';
  };

  btnLimpar.addEventListener('click', limparFormulario);

  // CANCELAR CADASTRO
  // Limpa, fecha e trava painel

  const cancelarCadastro = () => {
    formCliente.reset();
    clienteId.value = '';
    btnSalvar.textContent = 'Salvar';
    formMensagem.style.display = 'none';

    // Fecha e bloqueia painel Cadastro
    const accCadastro = document.getElementById('acc-cadastro');
    accCadastro.classList.remove('open');
    accCadastro.classList.add('bloqueado');
  };

  document
    .getElementById('btnCancelar')
    .addEventListener('click', cancelarCadastro);

  // CARD DE RESULTADO DA BUSCA
  // reutilizável (criado uma vez)

  let cardResultado = null;

  const ocultarCardResultado = () => {
    if (cardResultado) cardResultado.style.display = 'none';
  };

  const exibirClienteEncontrado = (cliente) => {
    if (!cardResultado) {
      cardResultado = document.createElement('div');
      cardResultado.id = 'cardClienteResultado';
      resultadoBusca.parentNode.insertBefore(
        cardResultado,
        resultadoBusca.nextSibling,
      );
    }

    cardResultado.className = 'vei-resultado-card';
    cardResultado.style.display = 'block';
    cardResultado.innerHTML = `
      <p>
        <strong>${cliente.NomeCompleto}</strong> |
        CPF/CNPJ: <strong>${formatarDocumento(cliente.CpfCnpj)}</strong> |
        Telefone: <strong>${cliente.Telefone || '—'}</strong>
      </p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnCliCancelar" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnCliEditar"   class="btn btn-primary">Editar</button>
        <button type="button" id="btnCliInativar" class="btn btn-danger">Inativar</button>
      </div>
    `;

    // Cancelar
    // Alterado em: 03/03/2026
    document.getElementById('btnCliCancelar').addEventListener('click', () => {
      limparBusca();
      const accCadastro = document.getElementById('acc-cadastro');
      accCadastro.classList.add('bloqueado');
    });

    // Editar — colapsa busca, abre cadastro com dados
    document.getElementById('btnCliEditar').addEventListener('click', () => {
      const accCadastro = document.getElementById('acc-cadastro');
      accCadastro.classList.remove('bloqueado');
      editarCliente(cliente.ClienteId);
    });

    // Inativar
    document
      .getElementById('btnCliInativar')
      .addEventListener('click', async () => {
        if (
          !confirm(
            `Inativar o cliente "${cliente.NomeCompleto}"?\n\nEle não aparecerá mais nas buscas.`,
          )
        )
          return;
        try {
          await apiRequest(`/clientes/${cliente.ClienteId}`, {
            method: 'DELETE',
          });
          alert('Cliente inativado com sucesso!');
          limparBusca();
          carregarClientes();
        } catch (error) {
          alert('Erro ao inativar: ' + error.message);
        }
      });
  };

  const exibirClienteNaoEncontrado = () => {
    if (!cardResultado) {
      cardResultado = document.createElement('div');
      cardResultado.id = 'cardClienteResultado';
      resultadoBusca.parentNode.insertBefore(
        cardResultado,
        resultadoBusca.nextSibling,
      );
    }

    cardResultado.className = 'vei-aviso vei-aviso-info';
    cardResultado.style.display = 'block';
    cardResultado.innerHTML = `
      <p>ℹ️ Cliente <strong>não encontrado</strong> no cadastro.</p>
      <p>Deseja cadastrá-lo agora?</p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnCliNaoCadastrar" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnCliSimCadastrar" class="btn btn-primary">Cadastrar</button>
      </div>
    `;

    document
      .getElementById('btnCliNaoCadastrar')
      .addEventListener('click', () => {
        limparBusca();
      });

    document
      .getElementById('btnCliSimCadastrar')
      .addEventListener('click', () => {
        limparBusca();
        const accCadastro = document.getElementById('acc-cadastro');
        accCadastro.classList.remove('bloqueado');
        accCadastro.classList.add('open');
        accCadastro.scrollIntoView({ behavior: 'smooth' });
      });
  };

  /* ===========================
    LIMPAR BUSCA
  =========================== */
  const limparBusca = () => {
    valorBusca.value = '';
    // tbodyBusca.innerHTML  =''; > removida em 03/03/2026
    resultadoBusca.style.display = 'none';
    ocultarCardResultado();
    document.getElementById('acc-busca').classList.remove('open');
  };

  btnLimparBusca.addEventListener('click', limparBusca);

  /* ===========================
    GERAR LINHA — Listar Todos
  =========================== */
  const gerarLinha = (cliente) => {
    const genero = cliente.Genero
      ? `<span class="badge badge-${cliente.Genero}">${cliente.Genero}</span>`
      : '—';

    return `
      <tr>
        <td>${cliente.NomeCompleto || '—'}</td>
        <td>${formatarDocumento(cliente.CpfCnpj)}</td>
        <td>${cliente.Telefone || '—'}</td>
        <td>${genero}</td>
        <td>${formatarData(cliente.DataNascimento)}</td>
        <td>
          <div class="acoes">
            <button class="btn-sm btn-editar"
              onclick="editarCliente(${cliente.ClienteId})">
              ✏️ Editar
            </button>
            <button class="btn-sm btn-inativar"
              onclick="inativarCliente(${cliente.ClienteId}, '${cliente.NomeCompleto.replace(/'/g, "\\'")}')">
              Inativar
            </button>
          </div>
        </td>
      </tr>
    `;
  };

  /* ===========================
    RENDERIZAR TABELA
  =========================== */
  const renderizarTabela = () => {
    const ordenados = [...listaClientes].sort(
      (a, b) =>
        ordemNome * a.NomeCompleto.localeCompare(b.NomeCompleto, 'pt-BR'),
    );
    tbodyClientes.innerHTML = ordenados.map(gerarLinha).join('');
  };

  /* ===========================
    CARREGAR LISTA DE CLIENTES
  =========================== */
  let listaClientes = [];

  const carregarClientes = async () => {
    tbodyClientes.innerHTML = `<tr><td colspan="6" class="tabela-vazia">Carregando...</td></tr>`;
    try {
      listaClientes = await apiRequest('/clientes');
      if (listaClientes.length === 0) {
        tbodyClientes.innerHTML = `<tr><td colspan="6" class="tabela-vazia">Nenhum cliente cadastrado.</td></tr>`;
        return;
      }
      renderizarTabela();
    } catch (error) {
      tbodyClientes.innerHTML = `<tr><td colspan="6" class="tabela-vazia">Erro ao carregar clientes.</td></tr>`;
    }
  };

  /* ===========================
    ORDENAR AO CLICAR NO HEADER
  =========================== */
  document.getElementById('thNome').addEventListener('click', () => {
    ordemNome *= -1;
    document.getElementById('iconeOrdem').textContent =
      ordemNome === 1 ? '▲' : '▼';
    renderizarTabela();
  });

  /* ===========================
    CARREGAR AO CLICAR NO MENU
  =========================== */
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (item.dataset.section === 'clientes') carregarClientes();
    });
  });

  /* ===========================
    SUBMIT DO FORMULÁRIO
  =========================== */
  formCliente.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = clienteId.value;

    const dados = {
      tipo: document.getElementById('tipo').value,
      cpfCnpj: document.getElementById('cpfCnpj').value,
      nomeCompleto: document.getElementById('nomeCompleto').value,
      dataNascimento: document.getElementById('dataNascimento').value || null,
      genero: document.getElementById('genero').value || null,
      telefone: document.getElementById('telefone').value || null,
      telefoneWhatsApp: document.getElementById('telefoneWhatsApp').checked,
      email: document.getElementById('email').value || null,
      cep: document.getElementById('cep').value || null,
      logradouro: document.getElementById('logradouro').value || null,
      numero: document.getElementById('numero').value || null,
      complemento: document.getElementById('complemento').value || null,
      bairro: document.getElementById('bairro').value || null,
      cidade: document.getElementById('cidade').value || null,
      estado: document.getElementById('estado').value || null,
    };

    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    try {
      if (id) {
        await apiRequest(`/clientes/${id}`, { method: 'PUT', body: dados });
        mostrarMensagem('Cliente atualizado com sucesso!', 'success');
        cancelarCadastro();
      } else {
        await apiRequest('/clientes', { method: 'POST', body: dados });
        mostrarMensagem('Cliente cadastrado com sucesso!', 'success');
        cancelarCadastro();
      }

      limparFormulario();
      carregarClientes();

      document.getElementById('acc-cadastro').classList.remove('open');
      document.getElementById('acc-lista').classList.add('open');
    } catch (error) {
      mostrarMensagem(error.message || 'Erro ao salvar cliente.', 'error');
    } finally {
      btnSalvar.disabled = false;
      btnSalvar.textContent = id ? 'Atualizar Cliente' : 'Salvar Cliente';
    }
  });

  /* ===========================
    EDITAR CLIENTE
    Colapsa busca, abre cadastro
  =========================== */
  window.editarCliente = async (id) => {
    try {
      const cliente = await apiRequest(`/clientes/${id}`);

      clienteId.value = cliente.ClienteId;
      document.getElementById('tipo').value = cliente.Tipo || 'PF';
      document.getElementById('cpfCnpj').value = formatarDocumento(
        cliente.CpfCnpj,
      );
      document.getElementById('nomeCompleto').value =
        cliente.NomeCompleto || '';
      document.getElementById('dataNascimento').value = cliente.DataNascimento
        ? cliente.DataNascimento.split('T')[0]
        : '';
      document.getElementById('genero').value = cliente.Genero || '';
      document.getElementById('telefone').value = cliente.Telefone || '';
      document.getElementById('telefoneWhatsApp').checked =
        cliente.TelefoneWhatsApp === true || cliente.TelefoneWhatsApp === 1;
      document.getElementById('email').value = cliente.Email || '';
      document.getElementById('cep').value = cliente.Cep || '';
      document.getElementById('logradouro').value = cliente.Logradouro || '';
      document.getElementById('numero').value = cliente.Numero || '';
      document.getElementById('complemento').value = cliente.Complemento || '';
      document.getElementById('bairro').value = cliente.Bairro || '';
      document.getElementById('cidade').value = cliente.Cidade || '';
      document.getElementById('estado').value = cliente.Estado || '';

      btnSalvar.textContent = 'Atualizar Cliente';

      // Fecha busca + limpa
      limparBusca();

      // Abre cadastro
      document.getElementById('acc-cadastro').classList.add('open');
      document
        .getElementById('acc-cadastro')
        .scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      alert('Erro ao carregar dados do cliente.');
    }
  };

  /* ===========================
    INATIVAR CLIENTE — global
    Usado na listagem
  =========================== */
  window.inativarCliente = async (id, nome) => {
    if (
      !confirm(
        `Inativar o cliente "${nome}"?\n\nEle não aparecerá mais nas buscas.`,
      )
    )
      return;
    try {
      await apiRequest(`/clientes/${id}`, { method: 'DELETE' });
      alert('Cliente inativado com sucesso!');
      carregarClientes();
    } catch (error) {
      alert('Erro ao inativar: ' + error.message);
    }
  };

  /* ===========================
    CARD — CLIENTE INATIVO
    Encontrou mas está inativo
  =========================== */
  const exibirClienteInativoEncontrado = (cliente) => {
    if (!cardResultado) {
      cardResultado = document.createElement('div');
      cardResultado.id = 'cardClienteResultado';
      resultadoBusca.parentNode.insertBefore(
        cardResultado,
        resultadoBusca.nextSibling,
      );
    }

    cardResultado.className = 'vei-aviso vei-aviso-alerta';
    cardResultado.style.display = 'block';
    cardResultado.innerHTML = `
      <p>⚠️ Cadastro <strong>inativo</strong> encontrado.</p>
      <p><strong>${cliente.NomeCompleto}</strong> | CPF/CNPJ: <strong>${formatarDocumento(cliente.CpfCnpj)}</strong></p>
      <p>Deseja reativar?</p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnCliCancelarInativo" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnCliReativar" class="btn btn-primary">Reativar</button>
      </div>
    `;

    // Cancelar
    document
      .getElementById('btnCliCancelarInativo')
      .addEventListener('click', () => {
        limparBusca();
      });

    // Reativar — abre cadastro com dados para atualizar
    document.getElementById('btnCliReativar').addEventListener('click', () => {
      const accCadastro = document.getElementById('acc-cadastro');
      accCadastro.classList.remove('bloqueado');
      editarCliente(cliente.ClienteId);
    });
  };

  /* ===========================
    BUSCAR CLIENTE
  =========================== */
  btnBuscar.addEventListener('click', async () => {
    const tipo = tipoBusca.value;
    const valor = valorBusca.value.trim();

    if (!valor) {
      alert('Digite um valor para buscar.');
      return;
    }

    btnBuscar.disabled = true;
    btnBuscar.textContent = 'Buscando...';
    ocultarCardResultado();
    resultadoBusca.style.display = 'none';

    try {
      const resultado = await apiRequest(
        `/clientes/buscar?tipo=${tipo}&valor=${encodeURIComponent(valor)}`,
      );

      if (resultado.length === 0) {
        exibirClienteNaoEncontrado();
      } else {
        const cliente = resultado[0];
        if (cliente.Ativo === false || cliente.Ativo === 0) {
          exibirClienteInativoEncontrado(cliente);
        } else {
          exibirClienteEncontrado(cliente);
        }
      }
    } catch (error) {
      alert(error.message || 'Erro ao buscar cliente.');
    } finally {
      btnBuscar.disabled = false;
      btnBuscar.textContent = 'Buscar';
    }
  });

  // Busca ao pressionar Enter
  valorBusca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnBuscar.click();
  });
});

```

```jsx
// veiculos.js | data:03/03/2026

// Módulo completo de Veículos — AC2
// Depende de: config.js (apiRequest) + auth.js

document.addEventListener('DOMContentLoaded', () => {
  /* ===========================
     ACCORDION — abrir/fechar
  =========================== */
  const accItems = document.querySelectorAll('#accordion-veiculos .acc-item');

  accItems.forEach((item) => {
    const header = item.querySelector('.acc-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Fecha todos + limpa
      accItems.forEach((i) => i.classList.remove('open'));
      ocultarCadastroSub();
      ocultarCardBusca();
      limparCamposCadastro();
      limparCamposBusca();

      if (!isOpen) {
        item.classList.add('open');
        if (item.id === 'acc-veiculo-lista') {
          carregarVeiculos();
        }
      }
    });
  });

  /* ===========================
     HELPERS
  =========================== */
  const normalizarPlaca = (placa) =>
    placa.replace(/[-\s]/g, '').toUpperCase().trim();

  const formatarData = (dataStr) => {
    if (!dataStr) return '—';
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR');
  };

  const formatarKm = (km) => {
    if (km === null || km === undefined) return '—';
    return Number(km).toLocaleString('pt-BR');
  };

  const exibirMensagem = (tipo, texto) => {
    const el = document.getElementById('veiFormMensagem');
    el.className = `form-mensagem ${tipo}`;
    el.textContent = texto;
    el.style.display = 'block';
    setTimeout(() => {
      el.style.display = 'none';
    }, 4000);
  };

  /* ===========================
     HELPER — OCULTAR SUBPAINÉIS
     DO CADASTRO
  =========================== */
  const ocultarCadastroSub = () => {
    document.getElementById('veiCadExisteAtivo').style.display = 'none';
    document.getElementById('veiCadExisteInativo').style.display = 'none';
    document.getElementById('veiCadFormNovo').style.display = 'none';
    document.getElementById('veiCadFormTrocarProp').style.display = 'none';
    document.getElementById('veiCadFormReativar').style.display = 'none';
  };

  /* ===========================
     HELPER — LIMPAR CAMPOS
     DO PAINEL 1 (CADASTRO)
  =========================== */
  const limparCamposCadastro = () => {
    const veiPlacaVerificar = document.getElementById('veiPlacaVerificar');
    if (veiPlacaVerificar) veiPlacaVerificar.value = '';

    const formVeiculo = document.getElementById('formVeiculo');
    if (formVeiculo) {
      formVeiculo.reset();
      formVeiculo.dataset.editId = '';
    }

    document.getElementById('veiNomeProprietario').value = '';
    document.getElementById('veiClienteId').value = '';
    document.getElementById('veiCadTrocarCpfCnpj').value = '';
    document.getElementById('veiCadTrocarNomeProp').value = '';
    document.getElementById('veiCadTrocarClienteId').value = '';
    document.getElementById('veiCadReativaCpfCnpj').value = '';
    document.getElementById('veiCadReativaNomeProp').value = '';
    document.getElementById('veiCadReativaClienteId').value = '';
    document.getElementById('veiCadReativaKm').value = '';
    document.getElementById('veiFormMensagem').style.display = 'none';
    document.getElementById('btnVeiSalvar').textContent = 'Salvar Veículo';
    veiculoCadId = null;
  };

  /* ===========================
     HELPER — LIMPAR CAMPOS
     DO PAINEL 2 (BUSCA)
  =========================== */
  const limparCamposBusca = () => {
    const veiPlacaBusca = document.getElementById('veiPlacaBusca');
    if (veiPlacaBusca) veiPlacaBusca.value = '';

    document.getElementById('veiEditMarca').value = '';
    document.getElementById('veiEditModelo').value = '';
    document.getElementById('veiEditMotorizacao').value = '';
    document.getElementById('veiEditAnoModelo').value = '';
    document.getElementById('veiEditPlaca').value = '';
    document.getElementById('veiEditKm').value = '';
    document.getElementById('veiEditClienteId').value = '';
    document.getElementById('veiEditNomeProprietario').value = '';
    document.getElementById('veiEditCpfCnpj').value = '';
    document.getElementById('veiReativaCpfCnpj').value = '';
    document.getElementById('veiReativaNomeProprietario').value = '';
    document.getElementById('veiReativaClienteId').value = '';
    document.getElementById('veiReativaKm').value = '';
    document.getElementById('veiFormReativacao').style.display = 'none';
  };

  /* ===========================
     CARD DE RESULTADO DA BUSCA
     reutilizável
  =========================== */
  let cardBusca = null;

  const ocultarCardBusca = () => {
    if (cardBusca) cardBusca.style.display = 'none';
    document.getElementById('veiFormReativacao').style.display = 'none';
  };

  const criarCardBusca = () => {
    if (!cardBusca) {
      cardBusca = document.createElement('div');
      cardBusca.id = 'cardVeiculoBusca';
      const buscaRow = document.querySelector('#acc-veiculo-busca .busca-row');
      buscaRow.parentNode.insertBefore(cardBusca, buscaRow.nextSibling);
    }
    return cardBusca;
  };

  /* ===========================
     PAINEL 2 — VEÍCULO ATIVO
     card + Cancelar / Editar / Inativar
  =========================== */
  const exibirVeiculoAtivoBusca = (v) => {
    const card = criarCardBusca();
    card.className = 'vei-resultado-card';
    card.style.display = 'block';
    card.innerHTML = `
      <p>
        <strong>${v.Marca} ${v.Modelo}</strong> |
        Placa: <strong>${v.Placa}</strong> |
        Proprietário: <strong>${v.ProprietarioNome || 'Sem proprietário'}</strong> |
        Km: <strong>${formatarKm(v.Km)}</strong>
      </p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnVeiBuscaCancelar" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiBuscaEditar"   class="btn btn-primary">Editar</button>
        <button type="button" id="btnVeiBuscaInativar" class="btn btn-danger">Inativar</button>
      </div>
    `;

    // Cancelar
    document
      .getElementById('btnVeiBuscaCancelar')
      .addEventListener('click', () => {
        ocultarCardBusca();
        limparCamposBusca();
        document.getElementById('acc-veiculo-busca').classList.remove('open');
      });

    // Editar — colapsa busca, abre Painel 1 com dados preenchidos
    document
      .getElementById('btnVeiBuscaEditar')
      .addEventListener('click', () => {
        // Fecha busca
        ocultarCardBusca();
        limparCamposBusca();
        document.getElementById('acc-veiculo-busca').classList.remove('open');

        // Abre Painel 1
        ocultarCadastroSub();
        const accCadastro = document.getElementById('acc-veiculo-cadastro');
        accCadastro.classList.add('open');

        // Preenche formulário com dados do veículo
        document.getElementById('veiCadFormNovo').style.display = 'block';
        document.getElementById('veiPlaca').value = v.Placa || '';
        document.getElementById('veiMarca').value = v.Marca || '';
        document.getElementById('veiModelo').value = v.Modelo || '';
        document.getElementById('veiMotorizacao').value = v.Motorizacao || '';
        document.getElementById('veiAnoModelo').value = v.AnoModelo || '';
        document.getElementById('veiKm').value = v.Km !== null ? v.Km : '';
        document.getElementById('veiNomeProprietario').value =
          v.ProprietarioNome || '';
        document.getElementById('veiClienteId').value = v.ClienteId || '';

        // Marca como edição
        document.getElementById('formVeiculo').dataset.editId = v.VeiculoId;
        document.getElementById('btnVeiSalvar').textContent =
          'Atualizar Veículo';

        accCadastro.scrollIntoView({ behavior: 'smooth' });
      });

    // Inativar
    document
      .getElementById('btnVeiBuscaInativar')
      .addEventListener('click', async () => {
        if (
          !confirm(
            `Inativar o veículo "${v.Marca} ${v.Modelo} — ${v.Placa}"?\n\nO proprietário será desvinculado.`,
          )
        )
          return;
        try {
          await apiRequest(`/veiculos/${v.VeiculoId}/inativar`, 'PATCH', {});
          alert('Veículo inativado com sucesso!');
          ocultarCardBusca();
          limparCamposBusca();
          document.getElementById('acc-veiculo-busca').classList.remove('open');
          carregarVeiculos();
        } catch (error) {
          alert('Erro ao inativar: ' + error.message);
        }
      });
  };

  /* ===========================
     PAINEL 2 — VEÍCULO INATIVO
     card + Cancelar / Reativar
  =========================== */
  const exibirVeiculoInativoBusca = (v) => {
    const card = criarCardBusca();
    card.className = 'vei-aviso vei-aviso-alerta';
    card.style.display = 'block';
    card.innerHTML = `
      <p>⚠️ Este veículo está <strong>inativo / sem proprietário</strong>.</p>
      <p><strong>${v.Marca} ${v.Modelo}</strong> | Placa: <strong>${v.Placa}</strong></p>
      <p>Deseja vincular um proprietário e reativar?</p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnVeiBuscaCancelarInativo" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiBuscaReativar"        class="btn btn-primary">Reativar</button>
      </div>
    `;

    // Cancelar
    document
      .getElementById('btnVeiBuscaCancelarInativo')
      .addEventListener('click', () => {
        ocultarCardBusca();
        limparCamposBusca();
        document.getElementById('acc-veiculo-busca').classList.remove('open');
      });

    // Reativar — exibe formulário de reativação
    document
      .getElementById('btnVeiBuscaReativar')
      .addEventListener('click', () => {
        document.getElementById('btnVeiSimReativar').dataset.id = v.VeiculoId;
        document.getElementById('veiFormReativacao').style.display = 'block';
        document
          .getElementById('veiFormReativacao')
          .scrollIntoView({ behavior: 'smooth' });
      });
  };

  /* ===========================
     PAINEL 2 — NÃO ENCONTRADO
     card + Cancelar / Cadastrar
  =========================== */
  const exibirVeiculoNaoEncontrado = (placa) => {
    const card = criarCardBusca();
    card.className = 'vei-aviso vei-aviso-info';
    card.style.display = 'block';
    card.innerHTML = `
      <p>ℹ️ Veículo <strong>não encontrado</strong> no cadastro.</p>
      <p>Deseja cadastrá-lo agora?</p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnVeiBuscaNaoCadastrar" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiBuscaSimCadastrar" class="btn btn-primary">Cadastrar</button>
      </div>
    `;

    // Cancelar
    document
      .getElementById('btnVeiBuscaNaoCadastrar')
      .addEventListener('click', () => {
        ocultarCardBusca();
        limparCamposBusca();
        document.getElementById('acc-veiculo-busca').classList.remove('open');
      });

    // Cadastrar — colapsa busca, abre cadastro com placa preenchida
    document
      .getElementById('btnVeiBuscaSimCadastrar')
      .addEventListener('click', () => {
        ocultarCardBusca();
        document.getElementById('acc-veiculo-busca').classList.remove('open');
        limparCamposBusca();

        const accCadastro = document.getElementById('acc-veiculo-cadastro');
        accCadastro.classList.add('open');
        veiPlacaVerificar.value = placa;
        btnVerificarPlaca.click();
      });
  };

  /* ===========================
     PAINEL 1 — VERIFICAR PLACA
  =========================== */
  const btnVerificarPlaca = document.getElementById('btnVeiVerificarPlaca');
  const veiPlacaVerificar = document.getElementById('veiPlacaVerificar');

  let veiculoCadId = null;

  btnVerificarPlaca.addEventListener('click', async () => {
    const placa = normalizarPlaca(veiPlacaVerificar.value);

    if (!placa) {
      alert('Digite a placa para verificar.');
      return;
    }

    ocultarCadastroSub();
    veiculoCadId = null;

    try {
      const resultado = await apiRequest(
        `/veiculos/buscar?tipo=placa&valor=${placa}`,
      );

      if (resultado && resultado.length > 0) {
        const v = resultado[0];
        veiculoCadId = v.VeiculoId;

        if (v.Ativo === true || v.Ativo === 1) {
          document.getElementById('veiCadInfoAtivo').innerHTML =
            `<strong>${v.Marca} ${v.Modelo}</strong> | Placa: <strong>${v.Placa}</strong> | ` +
            `Proprietário: <strong>${v.ProprietarioNome || 'Sem proprietário'}</strong>`;
          document.getElementById('veiCadExisteAtivo').style.display = 'block';
        } else {
          document.getElementById('veiCadInfoInativo').innerHTML =
            `<strong>${v.Marca} ${v.Modelo}</strong> | Placa: <strong>${v.Placa}</strong>`;
          document.getElementById('veiCadExisteInativo').style.display =
            'block';
        }
      } else {
        abrirFormNovo(placa);
      }
    } catch (error) {
      abrirFormNovo(placa);
    }
  });

  veiPlacaVerificar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnVerificarPlaca.click();
  });

  /* ===========================
     PAINEL 1 — BOTÃO LIMPAR
  =========================== */
  document.getElementById('btnVeiCadLimpar').addEventListener('click', () => {
    ocultarCadastroSub();
    limparCamposCadastro();
  });

  /* ===========================
     PAINEL 1 — CENÁRIO ATIVO
     Cancelar
  =========================== */
  document
    .getElementById('btnVeiCadCancelarAtivo')
    .addEventListener('click', () => {
      ocultarCadastroSub();
      limparCamposCadastro();
    });

  /* ===========================
     PAINEL 1 — CENÁRIO ATIVO
     Trocar Proprietário
  =========================== */
  document
    .getElementById('btnVeiCadTrocarProp')
    .addEventListener('click', () => {
      document.getElementById('veiCadFormTrocarProp').style.display = 'block';
    });

  document
    .getElementById('btnVeiCadTrocarBuscarProp')
    .addEventListener('click', async () => {
      const cpfCnpj = document
        .getElementById('veiCadTrocarCpfCnpj')
        .value.replace(/\D/g, '')
        .trim();
      if (!cpfCnpj) {
        alert('Digite o CPF ou CNPJ do novo proprietário.');
        return;
      }

      try {
        const cliente = await apiRequest(
          `/veiculos/cliente?cpfCnpj=${cpfCnpj}`,
        );
        document.getElementById('veiCadTrocarNomeProp').value =
          cliente.NomeCompleto;
        document.getElementById('veiCadTrocarClienteId').value =
          cliente.ClienteId;
      } catch (error) {
        document.getElementById('veiCadTrocarNomeProp').value = '';
        document.getElementById('veiCadTrocarClienteId').value = '';
        alert(
          `⚠️ Proprietário não encontrado.\n\nCadastre-o primeiro em: Menu → Clientes → Cadastrar Novo Cliente`,
        );
      }
    });

  document
    .getElementById('btnVeiCadConfirmarTroca')
    .addEventListener('click', async () => {
      const clienteId = document.getElementById('veiCadTrocarClienteId').value;
      if (!clienteId) {
        alert('Busque e confirme o novo proprietário antes de confirmar.');
        return;
      }

      try {
        const veiculo = await apiRequest(`/veiculos/${veiculoCadId}`);
        const payload = {
          clienteId: Number(clienteId),
          marca: veiculo.Marca,
          modelo: veiculo.Modelo,
          motorizacao: veiculo.Motorizacao || null,
          anoModelo: veiculo.AnoModelo || null,
          placa: veiculo.Placa,
          km: veiculo.Km !== null ? veiculo.Km : null,
        };
        await apiRequest(`/veiculos/${veiculoCadId}`, 'PUT', payload);
        alert('Proprietário atualizado com sucesso!');
        ocultarCadastroSub();
        limparCamposCadastro();
        carregarVeiculos();
      } catch (error) {
        alert('Erro ao trocar proprietário: ' + error.message);
      }
    });

  /* ===========================
     PAINEL 1 — CENÁRIO ATIVO
     Inativar
  =========================== */
  document
    .getElementById('btnVeiCadInativar')
    .addEventListener('click', async () => {
      const info = document.getElementById('veiCadInfoAtivo').textContent;
      if (
        !confirm(
          `Inativar este veículo?\n\n${info}\n\nO proprietário será desvinculado.`,
        )
      )
        return;

      try {
        await apiRequest(`/veiculos/${veiculoCadId}/inativar`, 'PATCH', {});
        alert('Veículo inativado com sucesso!');
        ocultarCadastroSub();
        limparCamposCadastro();
        carregarVeiculos();
      } catch (error) {
        alert('Erro ao inativar: ' + error.message);
      }
    });

  /* ===========================
     PAINEL 1 — CENÁRIO INATIVO
     Cancelar / Reativar
  =========================== */
  document
    .getElementById('btnVeiCadCancelarInativo')
    .addEventListener('click', () => {
      ocultarCadastroSub();
      limparCamposCadastro();
    });

  document
    .getElementById('btnVeiCadSimReativar')
    .addEventListener('click', () => {
      document.getElementById('veiCadFormReativar').style.display = 'block';
    });

  document
    .getElementById('btnVeiCadReativaBuscarProp')
    .addEventListener('click', async () => {
      const cpfCnpj = document
        .getElementById('veiCadReativaCpfCnpj')
        .value.replace(/\D/g, '')
        .trim();
      if (!cpfCnpj) {
        alert('Digite o CPF ou CNPJ do proprietário.');
        return;
      }

      try {
        const cliente = await apiRequest(
          `/veiculos/cliente?cpfCnpj=${cpfCnpj}`,
        );
        document.getElementById('veiCadReativaNomeProp').value =
          cliente.NomeCompleto;
        document.getElementById('veiCadReativaClienteId').value =
          cliente.ClienteId;
      } catch (error) {
        document.getElementById('veiCadReativaNomeProp').value = '';
        document.getElementById('veiCadReativaClienteId').value = '';
        alert(
          `⚠️ Proprietário não encontrado.\n\nCadastre-o primeiro em: Menu → Clientes → Cadastrar Novo Cliente`,
        );
      }
    });

  document
    .getElementById('btnVeiCadConfirmarReativar')
    .addEventListener('click', async () => {
      const clienteId = document.getElementById('veiCadReativaClienteId').value;
      const kmRaw = document.getElementById('veiCadReativaKm').value;
      if (!clienteId) {
        alert('Busque e confirme o proprietário antes de reativar.');
        return;
      }

      const payload = {
        clienteId: Number(clienteId),
        km: kmRaw !== '' ? Number(kmRaw) : null,
      };

      try {
        await apiRequest(
          `/veiculos/${veiculoCadId}/reativar`,
          'PATCH',
          payload,
        );
        alert('Veículo reativado com sucesso!');
        ocultarCadastroSub();
        limparCamposCadastro();
        carregarVeiculos();
      } catch (error) {
        alert('Erro ao reativar: ' + error.message);
      }
    });

  /* ===========================
     PAINEL 1 — CENÁRIO NOVO
  =========================== */
  const abrirFormNovo = (placa) => {
    document.getElementById('veiCadFormNovo').style.display = 'block';
    document.getElementById('veiPlaca').value = placa;
    document.getElementById('veiCpfCnpj').focus();
  };

  document
    .getElementById('btnBuscarProprietario')
    .addEventListener('click', async () => {
      const cpfCnpj = document
        .getElementById('veiCpfCnpj')
        .value.replace(/\D/g, '')
        .trim();
      if (!cpfCnpj) {
        alert('Digite o CPF ou CNPJ do proprietário.');
        return;
      }

      try {
        const cliente = await apiRequest(
          `/veiculos/cliente?cpfCnpj=${cpfCnpj}`,
        );
        document.getElementById('veiNomeProprietario').value =
          cliente.NomeCompleto;
        document.getElementById('veiClienteId').value = cliente.ClienteId;
      } catch (error) {
        document.getElementById('veiNomeProprietario').value = '';
        document.getElementById('veiClienteId').value = '';
        alert(
          `⚠️ Proprietário não encontrado.\n\nCadastre-o primeiro em: Menu → Clientes → Cadastrar Novo Cliente`,
        );
      }
    });

  /* ===========================
     PAINEL 1 — FORM NOVO / EDIÇÃO
     Submissão — POST ou PUT
  =========================== */
  const formVeiculo = document.getElementById('formVeiculo');

  formVeiculo.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = formVeiculo.dataset.editId;
    const clienteId = document.getElementById('veiClienteId').value;
    const marca = document.getElementById('veiMarca').value.trim();
    const modelo = document.getElementById('veiModelo').value.trim();
    const placa = normalizarPlaca(document.getElementById('veiPlaca').value);
    const kmRaw = document.getElementById('veiKm').value;

    if (!clienteId) {
      exibirMensagem(
        'error',
        'Busque e confirme o proprietário antes de salvar.',
      );
      return;
    }
    if (!marca || !modelo) {
      exibirMensagem('error', 'Marca e Modelo são obrigatórios.');
      return;
    }
    if (!placa) {
      exibirMensagem('error', 'Placa é obrigatória.');
      return;
    }

    const payload = {
      clienteId: Number(clienteId),
      marca: marca.toUpperCase(),
      modelo: modelo.toUpperCase(),
      motorizacao:
        document.getElementById('veiMotorizacao').value.trim().toUpperCase() ||
        null,
      anoModelo: document.getElementById('veiAnoModelo').value.trim() || null,
      placa: placa,
      km: kmRaw !== '' ? Number(kmRaw) : null,
    };

    const btnSalvar = document.getElementById('btnVeiSalvar');

    try {
      btnSalvar.disabled = true;
      btnSalvar.textContent = 'Salvando...';

      // Se editId existe → PUT, senão → POST
      if (editId) {
        await apiRequest(`/veiculos/${editId}`, 'PUT', payload);
        alert('Veículo atualizado com sucesso!');
      } else {
        await apiRequest('/veiculos', 'POST', payload);
        alert('Veículo cadastrado com sucesso!');
      }

      ocultarCadastroSub();
      limparCamposCadastro();
      carregarVeiculos();
    } catch (error) {
      exibirMensagem('error', 'Erro ao salvar: ' + error.message);
    } finally {
      btnSalvar.disabled = false;
      btnSalvar.textContent = 'Salvar Veículo';
    }
  });

  document.getElementById('btnVeiLimpar').addEventListener('click', () => {
    ocultarCadastroSub();
    limparCamposCadastro();
  });

  /* ===========================
     PAINEL 2 — BUSCAR POR PLACA
  =========================== */
  const btnVeiBuscar = document.getElementById('btnVeiBuscar');
  const veiPlacaBusca = document.getElementById('veiPlacaBusca');

  btnVeiBuscar.addEventListener('click', async () => {
    const placa = normalizarPlaca(veiPlacaBusca.value);
    if (!placa) {
      alert('Digite a placa para buscar.');
      return;
    }

    ocultarCardBusca();

    try {
      const resultado = await apiRequest(
        `/veiculos/buscar?tipo=placa&valor=${placa}`,
      );

      if (resultado && resultado.length > 0) {
        const v = resultado[0];
        if (v.Ativo === true || v.Ativo === 1) {
          exibirVeiculoAtivoBusca(v);
        } else {
          exibirVeiculoInativoBusca(v);
        }
      } else {
        exibirVeiculoNaoEncontrado(placa);
      }
    } catch (error) {
      exibirVeiculoNaoEncontrado(placa);
    }
  });

  veiPlacaBusca.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnVeiBuscar.click();
  });

  /* ===========================
     PAINEL 2 — BOTÃO LIMPAR
  =========================== */
  document.getElementById('btnVeiLimparBusca').addEventListener('click', () => {
    ocultarCardBusca();
    limparCamposBusca();
  });

  /* ===========================
     PAINEL 2 — BUSCAR PROPRIETÁRIO
     na edição (formulário inline)
  =========================== */
  document
    .getElementById('btnVeiEditBuscarProprietario')
    .addEventListener('click', async () => {
      const cpfCnpj = document
        .getElementById('veiEditCpfCnpj')
        .value.replace(/\D/g, '')
        .trim();
      if (!cpfCnpj) {
        alert('Digite o CPF ou CNPJ do novo proprietário.');
        return;
      }

      try {
        const cliente = await apiRequest(
          `/veiculos/cliente?cpfCnpj=${cpfCnpj}`,
        );
        document.getElementById('veiEditNomeProprietario').value =
          cliente.NomeCompleto;
        document.getElementById('veiEditClienteId').value = cliente.ClienteId;
      } catch (error) {
        document.getElementById('veiEditNomeProprietario').value = '';
        document.getElementById('veiEditClienteId').value = '';
        alert(
          `⚠️ Proprietário não encontrado.\n\nCadastre-o primeiro em: Menu → Clientes → Cadastrar Novo Cliente`,
        );
      }
    });

  /* ===========================
     PAINEL 2 — REATIVAÇÃO
     (vindo do card inativo)
  =========================== */
  document
    .getElementById('btnVeiReativaBuscarProp')
    .addEventListener('click', async () => {
      const cpfCnpj = document
        .getElementById('veiReativaCpfCnpj')
        .value.replace(/\D/g, '')
        .trim();
      if (!cpfCnpj) {
        alert('Digite o CPF ou CNPJ do proprietário.');
        return;
      }

      try {
        const cliente = await apiRequest(
          `/veiculos/cliente?cpfCnpj=${cpfCnpj}`,
        );
        document.getElementById('veiReativaNomeProprietario').value =
          cliente.NomeCompleto;
        document.getElementById('veiReativaClienteId').value =
          cliente.ClienteId;
      } catch (error) {
        document.getElementById('veiReativaNomeProprietario').value = '';
        document.getElementById('veiReativaClienteId').value = '';
        alert(
          `⚠️ Proprietário não encontrado.\n\nCadastre-o primeiro em: Menu → Clientes → Cadastrar Novo Cliente`,
        );
      }
    });

  document
    .getElementById('btnVeiConfirmarReativacao')
    .addEventListener('click', async () => {
      const id = document.getElementById('btnVeiSimReativar').dataset.id;
      const clienteId = document.getElementById('veiReativaClienteId').value;
      const kmRaw = document.getElementById('veiReativaKm').value;

      if (!clienteId) {
        alert('Busque e confirme o proprietário antes de reativar.');
        return;
      }

      const payload = {
        clienteId: Number(clienteId),
        km: kmRaw !== '' ? Number(kmRaw) : null,
      };

      try {
        await apiRequest(`/veiculos/${id}/reativar`, 'PATCH', payload);
        alert('Veículo reativado com sucesso!');
        ocultarCardBusca();
        limparCamposBusca();
        carregarVeiculos();
      } catch (error) {
        alert('Erro ao reativar: ' + error.message);
      }
    });

  /* ===========================
     PAINEL 3 — LISTAR TODOS
  =========================== */
  let listaVeiculos = [];
  let ordemMarca = 1;

  const carregarVeiculos = async () => {
    try {
      listaVeiculos = await apiRequest('/veiculos');
      renderizarLista();
    } catch (error) {
      document.getElementById('tbodyVeiculos').innerHTML =
        '<tr><td colspan="9" class="tabela-vazia">Erro ao carregar veículos</td></tr>';
    }
  };

  const renderizarLista = () => {
    const ordenada = [...listaVeiculos].sort(
      (a, b) => a.Marca.localeCompare(b.Marca, 'pt-BR') * ordemMarca,
    );

    const tbody = document.getElementById('tbodyVeiculos');

    tbody.innerHTML = ordenada.length
      ? ordenada
          .map(
            (v) => `
          <tr>
            <td>${v.Marca}</td>
            <td>${v.Modelo}</td>
            <td>${v.Motorizacao || '—'}</td>
            <td>${v.AnoModelo || '—'}</td>
            <td>${v.Placa || '—'}</td>
            <td>${v.ProprietarioNome || '—'}</td>
            <td>${formatarKm(v.Km)}</td>
            <td>${formatarData(v.DataAtualizacao)}</td>
            <td>
              <div class="acoes">
                <button class="btn-sm btn-editar"
                  onclick="editarVeiculo(${v.VeiculoId}, '${v.Placa}')">
                  Editar
                </button>
                <button class="btn-sm btn-inativar"
                  onclick="inativarVeiculo(${v.VeiculoId}, '${v.Marca} ${v.Modelo} — ${v.Placa}')">
                  Inativar
                </button>
              </div>
            </td>
          </tr>
        `,
          )
          .join('')
      : '<tr><td colspan="9" class="tabela-vazia">Nenhum veículo cadastrado</td></tr>';
  };

  /* ===========================
     PAINEL 3 — ORDENAÇÃO MARCA
  =========================== */
  const thMarca = document.getElementById('thMarca');
  if (thMarca) {
    thMarca.addEventListener('click', () => {
      ordemMarca *= -1;
      document.getElementById('iconeOrdemVei').textContent =
        ordemMarca === 1 ? '▲' : '▼';
      renderizarLista();
    });
  }

  /* ===========================
     PAINEL 3 — ORDENAÇÃO PROPRIETÁRIO
  =========================== */
  let ordemProp = 1;

  const thProprietario = document.getElementById('thProprietario');
  if (thProprietario) {
    thProprietario.addEventListener('click', () => {
      ordemProp *= -1;
      document.getElementById('iconeOrdemProp').textContent =
        ordemProp === 1 ? '▲' : '▼';

      const ordenada = [...listaVeiculos].sort(
        (a, b) =>
          (a.ProprietarioNome || '').localeCompare(
            b.ProprietarioNome || '',
            'pt-BR',
          ) * ordemProp,
      );

      const tbody = document.getElementById('tbodyVeiculos');
      tbody.innerHTML = ordenada
        .map(
          (v) => `
          <tr>
            <td>${v.Marca}</td>
            <td>${v.Modelo}</td>
            <td>${v.Motorizacao || '—'}</td>
            <td>${v.AnoModelo || '—'}</td>
            <td>${v.Placa || '—'}</td>
            <td>${v.ProprietarioNome || '—'}</td>
            <td>${formatarKm(v.Km)}</td>
            <td>${formatarData(v.DataAtualizacao)}</td>
            <td>
              <div class="acoes">
                <button class="btn-sm btn-editar"
                  onclick="editarVeiculo(${v.VeiculoId}, '${v.Placa}')">
                  Editar
                </button>
                <button class="btn-sm btn-inativar"
                  onclick="inativarVeiculo(${v.VeiculoId}, '${v.Marca} ${v.Modelo} — ${v.Placa}')">
                  Inativar
                </button>
              </div>
            </td>
          </tr>
        `,
        )
        .join('');
    });
  }

  /* ===========================
     PAINEL 3 — EDITAR
     Colapsa lista, abre busca
  =========================== */
  window.editarVeiculo = (id, placa) => {
    document.getElementById('acc-veiculo-lista').classList.remove('open');
    document.getElementById('acc-veiculo-busca').classList.add('open');
    veiPlacaBusca.value = placa || '';
    btnVeiBuscar.click();
  };

  /* ===========================
     PAINEL 3 — INATIVAR
  =========================== */
  window.inativarVeiculo = async (id, nome) => {
    if (
      !confirm(
        `Inativar o veículo "${nome}"?\n\nO proprietário será desvinculado.`,
      )
    )
      return;

    try {
      await apiRequest(`/veiculos/${id}/inativar`, 'PATCH', {});
      alert('Veículo inativado com sucesso!');
      carregarVeiculos();
    } catch (error) {
      alert('Erro ao inativar: ' + error.message);
    }
  };
});

```