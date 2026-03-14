// clientes.js | última revisão data: 13/03/2026

document.addEventListener('DOMContentLoaded', () => {
  //  ELEMENTOS DO DOM

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

  // CONTROLE DE REATIVAÇÃO
  let cliReativando = null;

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
    cliReativando = null;
    btnSalvar.textContent = 'Salvar';
    formMensagem.style.display = 'none';
  };

  btnLimpar.addEventListener('click', limparFormulario);

  // CANCELAR CADASTRO
  // Limpa, fecha e trava painel

  const cancelarCadastro = () => {
    formCliente.reset();
    clienteId.value = '';
    cliReativando = null;
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
        // Captura ANTES de limpar
        const cpfCnpjDigitado = valorBusca.value.replace(/\D/g, '');
        const tipoDocumento = cpfCnpjDigitado.length <= 11 ? 'PF' : 'PJ';
        limparBusca();
        const accCadastro = document.getElementById('acc-cadastro');
        accCadastro.classList.remove('bloqueado');
        accCadastro.classList.add('open');
        // Preenche formulário com documento digitado
        document.getElementById('tipo').value = tipoDocumento;
        document.getElementById('cpfCnpj').value =
          tipoDocumento === 'PF'
            ? formatarCpf(cpfCnpjDigitado)
            : formatarCnpj(cpfCnpjDigitado);
        accCadastro.scrollIntoView({ behavior: 'smooth' });
      });
  };

  /* ===========================
    LIMPAR BUSCA
  =========================== */
  const limparBusca = () => {
    valorBusca.value = '';
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
      // REATIVAR — PATCH /reativar
      if (cliReativando) {
        await apiRequest(`/clientes/${cliReativando}/reativar`, {
          method: 'PATCH',
          body: dados,
        });
        alert('Cliente reativado com sucesso!');
        cliReativando = null;
      }
      // ATUALIZAR — PUT
      else if (id) {
        await apiRequest(`/clientes/${id}`, { method: 'PUT', body: dados });
        mostrarMensagem('Cliente atualizado com sucesso!', 'success');
      }
      // CRIAR — POST
      else {
        await apiRequest('/clientes', { method: 'POST', body: dados });
        mostrarMensagem('Cliente cadastrado com sucesso!', 'success');
      }

      cancelarCadastro();
      limparFormulario();
      carregarClientes();

      document.getElementById('acc-cadastro').classList.remove('open');
      //document.getElementById('acc-lista').classList.add('open');
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

    // Reativar — marca flag e abre cadastro com dados
    document.getElementById('btnCliReativar').addEventListener('click', () => {
      cliReativando = cliente.ClienteId;
      const accCadastro = document.getElementById('acc-cadastro');
      accCadastro.classList.remove('bloqueado');
      editarCliente(cliente.ClienteId);
      btnSalvar.textContent = 'Reativar Cliente';
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
