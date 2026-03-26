// -----------------------------------------------
// clientes.js
// Tema: Módulo de Clientes — cadastro, busca, lista, frota
// Última rev: 02 | Data: 25/03/2026
// -----------------------------------------------

document.addEventListener('DOMContentLoaded', () => {


  // #region ELEMENTOS DO DOM | rev.02 | 25/03/2026

  const formCliente    = document.getElementById('formCliente');
  const clienteId      = document.getElementById('clienteId');
  let   btnLimpar      = document.getElementById('btnLimpar');
  let   btnSalvar      = document.getElementById('btnSalvar');
  const formMensagem   = document.getElementById('formMensagem');

  const tipoBusca      = document.getElementById('tipoBusca');
  const valorBusca     = document.getElementById('valorBusca');
  const btnBuscar      = document.getElementById('btnBuscar');
  const btnLimparBusca = document.getElementById('btnLimparBusca');
  const resultadoBusca = document.getElementById('resultadoBusca');
  const tbodyClientes  = document.getElementById('tbodyClientes');

  // --- ordenação: 1 = A→Z | -1 = Z→A
  let ordemNome = 1;

  // --- controle de reativação
  let cliReativando = null;

  // #endregion


  // #region ACCORDION | rev.02 | 25/03/2026

  document.querySelectorAll('#sec-clientes .acc-header').forEach((header) => {
    header.addEventListener('click', () => {
      const targetId = header.dataset.target;
      const item     = document.getElementById(targetId);

      if (item && item.classList.contains('bloqueado')) {
        alert('Efetuar a pesquisa antes!');
        return;
      }

      if (item) {
        item.classList.toggle('open');
        const fechou = !item.classList.contains('open');

        // --- ao fechar painel Lista: zera filtros e lista
        if (targetId === 'acc-lista' && fechou) {
          const filtroGenero = document.getElementById('filtroGenero');
          const filtroMes    = document.getElementById('filtroMesNasc');
          if (filtroGenero) filtroGenero.value = '';
          if (filtroMes)    filtroMes.value    = '';
          listaClientes   = [];
          listaConsultada = false;
          tbodyClientes.innerHTML = `<tr><td colspan="7" class="tabela-vazia">Selecione algum filtro e/ou clique em Consultar.</td></tr>`;
        }

        // --- ao abrir sem ter consultado: exibe mensagem
        if (targetId === 'acc-lista' && !fechou && !listaConsultada) {
          tbodyClientes.innerHTML = `<tr><td colspan="7" class="tabela-vazia">Selecione algum filtro e/ou clique em Consultar.</td></tr>`;
        }

        // --- ao fechar painel Busca: limpa busca
        if (targetId === 'acc-busca' && fechou) {
          limparBusca();
        }

        // --- ao fechar painel Cadastro: cancela
        if (targetId === 'acc-cadastro' && fechou) {
          cancelarCadastro();
        }
      }
    });
  });

  // #endregion


  // #region HELPERS DE FORMATAÇÃO | rev.02 | 25/03/2026

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

  // #endregion


  // #region FORMULÁRIO | rev.02 | 25/03/2026

  const campoCpfCnpj = document.getElementById('cpfCnpj');
  const campoTipo    = document.getElementById('tipo');

  // --- máscara CPF/CNPJ no formulário
  campoCpfCnpj.addEventListener('input', () => {
    const tipo  = campoTipo.value;
    const valor = campoCpfCnpj.value;
    campoCpfCnpj.value = tipo === 'PF' ? formatarCpf(valor) : formatarCnpj(valor);
  });

  campoTipo.addEventListener('change', () => {
    campoCpfCnpj.value = '';
    campoCpfCnpj.focus();
  });


  // --- exibir mensagem no formulário
  const mostrarMensagem = (texto, tipo = 'success') => {
    formMensagem.textContent = texto;
    formMensagem.className   = `form-mensagem ${tipo}`;
    formMensagem.style.display = 'block';
    setTimeout(() => {
      formMensagem.style.display = 'none';
    }, 4000);
  };


  // --- limpar formulário
  const limparFormulario = () => {
    formCliente.reset();
    clienteId.value = '';
    cliReativando   = null;
    formMensagem.style.display = 'none';
  };


  // --- travar / destravar campos de identificação (CPF e Tipo)
  const travarCamposIdentificacao = () => {
    campoCpfCnpj.readOnly      = true;
    campoCpfCnpj.style.opacity = '0.5';
    campoTipo.disabled         = true;
    campoTipo.style.opacity    = '0.5';
  };

  const destravarCamposIdentificacao = () => {
    campoCpfCnpj.readOnly      = false;
    campoCpfCnpj.style.opacity = '';
    campoTipo.disabled         = false;
    campoTipo.style.opacity    = '';
  };


  // --- cancelar cadastro: limpa, fecha e trava painel
  const cancelarCadastro = () => {
    limparFormulario();
    destravarCamposIdentificacao();
    renderizarBotoesForm('novo');
    const accCadastro = document.getElementById('acc-cadastro');
    accCadastro.classList.remove('open');
    accCadastro.classList.add('bloqueado');
  };


  // --- renderizar botões do formulário
  // modos: 'novo' | 'ativo' | 'bloqueado' | 'salvo' | 'inativo'
  const renderizarBotoesForm = (modo, cliente = null) => {
    const formActions = document.querySelector('#formCliente .form-actions');

    if (modo === 'novo') {
      formActions.innerHTML = `
        <button type="button" id="btnCancelar"  class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnLimpar"    class="btn btn-secondary">Limpar</button>
        <button type="submit" id="btnSalvar"    class="btn btn-primary">Cadastrar</button>
      `;
    } else if (modo === 'ativo') {
      formActions.innerHTML = `
        <button type="button" id="btnCancelar"     class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnLimpar"       class="btn btn-secondary">Limpar</button>
        <button type="submit" id="btnSalvar"       class="btn btn-primary">Salvar</button>
        <button type="button" id="btnBloquearForm" class="btn btn-warning">Bloquear</button>
        <button type="button" id="btnInativarForm" class="btn btn-danger">Inativar</button>
        <button type="button" id="btnFrotaForm"    class="btn btn-primary">Frota</button>
      `;
    } else if (modo === 'bloqueado') {
      formActions.innerHTML = `
        <button type="button" id="btnCancelar"        class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnLimpar"          class="btn btn-secondary">Limpar</button>
        <button type="submit" id="btnSalvar"          class="btn btn-primary">Salvar</button>
        <button type="button" id="btnDesbloquearForm" class="btn btn-warning">Desbloquear</button>
        <button type="button" id="btnInativarForm"    class="btn btn-danger">Inativar</button>
        <button type="button" id="btnFrotaForm"       class="btn btn-primary">Frota</button>
      `;
    } else if (modo === 'salvo') {
      const statusAtual = cliente ? cliente.Status : 'ATIVO';
      formActions.innerHTML = `
        <button type="button" id="btnFechar"       class="btn btn-success">Fechar</button>
        ${statusAtual === 'BLOQUEADO'
          ? `<button type="button" id="btnDesbloquearForm" class="btn btn-warning">Desbloquear</button>`
          : `<button type="button" id="btnBloquearForm"   class="btn btn-warning">Bloquear</button>`
        }
        <button type="button" id="btnInativarForm" class="btn btn-danger">Inativar</button>
        <button type="button" id="btnFrotaForm"    class="btn btn-primary">Frota</button>
      `;
    } else if (modo === 'inativo') {
      formActions.innerHTML = `
        <button type="button" id="btnCancelar" class="btn btn-secondary">Cancelar</button>
        <button type="submit" id="btnSalvar"   class="btn btn-primary">Reativar</button>
      `;
    }

    // --- re-query referências atualizadas
    btnLimpar = document.getElementById('btnLimpar');
    btnSalvar = document.getElementById('btnSalvar');

    // --- re-bind eventos fixos
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) btnCancelar.addEventListener('click', cancelarCadastro);
    if (btnLimpar)   btnLimpar.addEventListener('click', limparFormulario);

    const btnFechar = document.getElementById('btnFechar');
    if (btnFechar) btnFechar.addEventListener('click', cancelarCadastro);

    // --- bind botões específicos dos modos com cliente
    if ((modo === 'ativo' || modo === 'bloqueado' || modo === 'salvo') && cliente) {

      const btnInativar = document.getElementById('btnInativarForm');
      if (btnInativar) btnInativar.addEventListener('click', async () => {
        if (!confirm(`Inativar o cliente "${cliente.NomeCompleto}"?\n\nEle não aparecerá mais na lista.`)) return;
        try {
          await apiRequest(`/clientes/${cliente.ClienteId}`, { method: 'DELETE' });
          alert('Cliente inativado com sucesso!');
          cancelarCadastro();
          carregarClientes();
        } catch (error) {
          alert('Erro ao inativar: ' + error.message);
        }
      });

      const btnBloquear = document.getElementById('btnBloquearForm');
      if (btnBloquear) btnBloquear.addEventListener('click', async () => {
        if (!confirm(`Bloquear o cliente "${cliente.NomeCompleto}"?\n\nEle não receberá comunicações.`)) return;
        try {
          await apiRequest(`/clientes/${cliente.ClienteId}/bloquear`, { method: 'PATCH', body: {} });
          alert('Cliente bloqueado com sucesso!');
          cancelarCadastro();
          carregarClientes();
        } catch (error) {
          alert('Erro ao bloquear: ' + error.message);
        }
      });

      const btnDesbloquear = document.getElementById('btnDesbloquearForm');
      if (btnDesbloquear) btnDesbloquear.addEventListener('click', async () => {
        if (!confirm(`Desbloquear o cliente "${cliente.NomeCompleto}"?`)) return;
        try {
          await apiRequest(`/clientes/${cliente.ClienteId}/desbloquear`, { method: 'PATCH', body: {} });
          alert('Cliente desbloqueado com sucesso!');
          cancelarCadastro();
          carregarClientes();
        } catch (error) {
          alert('Erro ao desbloquear: ' + error.message);
        }
      });

      const btnFrota = document.getElementById('btnFrotaForm');
      if (btnFrota) btnFrota.addEventListener('click', () => {
        const cpfCnpj = document.getElementById('cpfCnpj').value.replace(/\D/g, '');
        navegarParaVeiculos(cpfCnpj);
      });
    }
  };

  // --- inicializa form em modo 'novo'
  renderizarBotoesForm('novo');

  // #endregion


  // #region CARDS DE RESULTADO | rev.02 | 25/03/2026

  let cardResultado = null;

  const ocultarCardResultado = () => {
    if (cardResultado) cardResultado.style.display = 'none';
  };


  // --- cliente ativo encontrado
  const exibirClienteEncontrado = (cliente) => {
    if (!cardResultado) {
      cardResultado    = document.createElement('div');
      cardResultado.id = 'cardClienteResultado';
      resultadoBusca.parentNode.insertBefore(cardResultado, resultadoBusca.nextSibling);
    }

    cardResultado.className    = 'vei-resultado-card';
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
      </div>
    `;

    document.getElementById('btnCliCancelar').addEventListener('click', () => {
      limparBusca();
      document.getElementById('acc-cadastro').classList.add('bloqueado');
    });

    document.getElementById('btnCliEditar').addEventListener('click', () => {
      document.getElementById('acc-cadastro').classList.remove('bloqueado');
      editarCliente(cliente.ClienteId, 'ativo');
    });
  };


  // --- cliente não encontrado
  const exibirClienteNaoEncontrado = () => {
    if (!cardResultado) {
      cardResultado    = document.createElement('div');
      cardResultado.id = 'cardClienteResultado';
      resultadoBusca.parentNode.insertBefore(cardResultado, resultadoBusca.nextSibling);
    }

    cardResultado.className    = 'vei-aviso vei-aviso-info';
    cardResultado.style.display = 'block';
    cardResultado.innerHTML = `
      <p>ℹ️ Cliente <strong>não encontrado</strong> no cadastro.</p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnCliNaoCadastrar" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnCliSimCadastrar" class="btn btn-primary">Cadastrar</button>
      </div>
    `;

    document.getElementById('btnCliNaoCadastrar').addEventListener('click', () => {
      limparBusca();
    });

    document.getElementById('btnCliSimCadastrar').addEventListener('click', () => {
      const cpfCnpjDigitado = valorBusca.value.replace(/\D/g, '');
      const tipoDocumento   = cpfCnpjDigitado.length <= 11 ? 'PF' : 'PJ';
      limparBusca();
      const accCadastro = document.getElementById('acc-cadastro');
      accCadastro.classList.remove('bloqueado');
      accCadastro.classList.add('open');
      document.getElementById('tipo').value    = tipoDocumento;
      document.getElementById('cpfCnpj').value =
        tipoDocumento === 'PF'
          ? formatarCpf(cpfCnpjDigitado)
          : formatarCnpj(cpfCnpjDigitado);
      if (cpfCnpjDigitado.length >= 11) travarCamposIdentificacao();
      accCadastro.scrollIntoView({ behavior: 'smooth' });
    });
  };


  // --- cliente inativo encontrado
  const exibirClienteInativoEncontrado = (cliente) => {
    if (!cardResultado) {
      cardResultado    = document.createElement('div');
      cardResultado.id = 'cardClienteResultado';
      resultadoBusca.parentNode.insertBefore(cardResultado, resultadoBusca.nextSibling);
    }

    cardResultado.className    = 'vei-aviso vei-aviso-alerta';
    cardResultado.style.display = 'block';
    cardResultado.innerHTML = `
      <p>⚠️ Cadastro <strong>inativo</strong> encontrado.</p>
      <p><strong>${cliente.NomeCompleto}</strong> | CPF/CNPJ: <strong>${formatarDocumento(cliente.CpfCnpj)}</strong></p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnCliCancelarInativo" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnCliEditarInativo"   class="btn btn-primary">Editar</button>
      </div>
    `;

    document.getElementById('btnCliCancelarInativo').addEventListener('click', limparBusca);

    document.getElementById('btnCliEditarInativo').addEventListener('click', () => {
      cliReativando = cliente.ClienteId;
      document.getElementById('acc-cadastro').classList.remove('bloqueado');
      editarCliente(cliente.ClienteId, 'inativo');
    });
  };


  // --- cliente bloqueado encontrado
  const exibirClienteBloqueadoEncontrado = (cliente) => {
    if (!cardResultado) {
      cardResultado    = document.createElement('div');
      cardResultado.id = 'cardClienteResultado';
      resultadoBusca.parentNode.insertBefore(cardResultado, resultadoBusca.nextSibling);
    }

    cardResultado.className    = 'vei-aviso vei-aviso-alerta';
    cardResultado.style.display = 'block';
    cardResultado.innerHTML = `
      <p>🔒 Cadastro <strong>bloqueado</strong> encontrado.</p>
      <p><strong>${cliente.NomeCompleto}</strong> | CPF/CNPJ: <strong>${formatarDocumento(cliente.CpfCnpj)}</strong></p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnCliCancelarBloqueado" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnCliEditarBloqueado"   class="btn btn-primary">Editar</button>
      </div>
    `;

    document.getElementById('btnCliCancelarBloqueado').addEventListener('click', limparBusca);

    document.getElementById('btnCliEditarBloqueado').addEventListener('click', () => {
      document.getElementById('acc-cadastro').classList.remove('bloqueado');
      editarCliente(cliente.ClienteId, 'bloqueado');
    });
  };

  // #endregion


  // #region BUSCA | rev.02 | 25/03/2026

  // --- limpar busca
  const limparBusca = () => {
    valorBusca.value = '';
    resultadoBusca.style.display = 'none';
    ocultarCardResultado();
    document.getElementById('acc-busca').classList.remove('open');
  };

  btnLimparBusca.addEventListener('click', limparBusca);


  // --- máscara CPF/CNPJ no campo de busca
  valorBusca.addEventListener('input', () => {
    const n = valorBusca.value.replace(/\D/g, '').slice(0, 14);
    if (n.length <= 11) {
      valorBusca.value = n
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      valorBusca.value = n
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  });

  // --- busca ao pressionar Enter
  valorBusca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnBuscar.click();
  });


  // --- executar busca
  btnBuscar.addEventListener('click', async () => {
    const tipo  = tipoBusca.value;
    const valor = valorBusca.value.trim();

    if (!valor) {
      alert('Digite um valor para buscar.');
      return;
    }

    btnBuscar.disabled    = true;
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
        if (cliente.Ativo === 0 || cliente.Ativo === false) {
          exibirClienteInativoEncontrado(cliente);
        } else if (cliente.Bloqueado === 1 || cliente.Bloqueado === true) {
          exibirClienteBloqueadoEncontrado(cliente);
        } else {
          exibirClienteEncontrado(cliente);
        }
      }
    } catch (error) {
      alert(error.message || 'Erro ao buscar cliente.');
    } finally {
      btnBuscar.disabled    = false;
      btnBuscar.textContent = 'Buscar';
    }
  });

  // #endregion


  // #region LISTA | rev.02 | 25/03/2026

  let listaClientes   = [];
  let ordemNasc       = 0; // 0 = sem ordem | 1 = asc | -1 = desc
  let ordemGenero     = 0; // 0 = sem ordem | 1 = asc | -1 = desc
  let listaConsultada = false;


  // --- gerar linha da tabela
  const gerarLinha = (cliente) => {
    const genero    = cliente.Genero
      ? `<span class="badge badge-${cliente.Genero}">${cliente.Genero}</span>`
      : '—';
    const bloqueado = cliente.Bloqueado === 1 || cliente.Bloqueado === true;

    return `
      <tr${bloqueado ? ' style="opacity:0.7;"' : ''}>
        <td>${bloqueado ? '🔒 ' : ''}${cliente.NomeCompleto || '—'}</td>
        <td>${formatarDocumento(cliente.CpfCnpj)}</td>
        <td>${cliente.Telefone || '—'}</td>
        <td>${cliente.Email || '—'}</td>
        <td>${genero}</td>
        <td>${formatarData(cliente.DataNascimento)}</td>
        <td>
          <button class="btn-sm btn-editar" title="Editar"
            onclick="editarClienteDaLista(${cliente.ClienteId})">
            ✏️
          </button>
        </td>
      </tr>
    `;
  };


  // --- renderizar tabela (aplica filtros e ordenação)
  const renderizarTabela = () => {
    const filtroGenero = document.getElementById('filtroGenero')?.value  || '';
    const filtroMes    = document.getElementById('filtroMesNasc')?.value || '';

    let filtrados = listaClientes.filter((c) => {
      if (filtroGenero && c.Genero !== filtroGenero) return false;
      if (filtroMes && c.DataNascimento) {
        const mes = c.DataNascimento.split('T')[0].split('-')[1];
        if (mes !== filtroMes) return false;
      } else if (filtroMes && !c.DataNascimento) {
        return false;
      }
      return true;
    });

    if (ordemNasc !== 0) {
      filtrados.sort((a, b) => {
        const da = a.DataNascimento || '';
        const db = b.DataNascimento || '';
        return ordemNasc * da.localeCompare(db);
      });
    } else if (ordemGenero !== 0) {
      filtrados.sort((a, b) => {
        const ga = a.Genero || 'Z';
        const gb = b.Genero || 'Z';
        return ordemGenero * ga.localeCompare(gb);
      });
    } else {
      filtrados.sort(
        (a, b) => ordemNome * a.NomeCompleto.localeCompare(b.NomeCompleto, 'pt-BR'),
      );
    }

    tbodyClientes.innerHTML = filtrados.length
      ? filtrados.map(gerarLinha).join('')
      : `<tr><td colspan="7" class="tabela-vazia">Nenhum cliente encontrado com este filtro.</td></tr>`;
  };


  // --- carregar lista de clientes
  const carregarClientes = async () => {
    tbodyClientes.innerHTML = `<tr><td colspan="7" class="tabela-vazia">Carregando...</td></tr>`;
    try {
      listaClientes = await apiRequest('/clientes');
      if (listaClientes.length === 0) {
        tbodyClientes.innerHTML = `<tr><td colspan="7" class="tabela-vazia">Nenhum cliente cadastrado.</td></tr>`;
        return;
      }
      renderizarTabela();
    } catch (error) {
      tbodyClientes.innerHTML = `<tr><td colspan="7" class="tabela-vazia">Erro ao carregar clientes.</td></tr>`;
    }
  };


  // --- ordenação ao clicar nos headers
  document.getElementById('thNome').addEventListener('click', () => {
    ordemNasc   = 0;
    ordemGenero = 0;
    ordemNome  *= -1;
    document.getElementById('iconeOrdem').textContent       = ordemNome === 1 ? '▲' : '▼';
    document.getElementById('iconeOrdemNasc').textContent   = '↕';
    document.getElementById('iconeOrdemGenero').textContent = '↕';
    renderizarTabela();
  });

  document.getElementById('thNascimento').addEventListener('click', () => {
    ordemNasc   = ordemNasc === 1 ? -1 : 1;
    ordemGenero = 0;
    document.getElementById('iconeOrdemNasc').textContent   = ordemNasc === 1 ? '▲' : '▼';
    document.getElementById('iconeOrdem').textContent       = '↕';
    document.getElementById('iconeOrdemGenero').textContent = '↕';
    renderizarTabela();
  });

  document.getElementById('thGenero').addEventListener('click', () => {
    ordemNasc   = 0;
    ordemGenero = ordemGenero === 1 ? -1 : 1;
    document.getElementById('iconeOrdemGenero').textContent = ordemGenero === 1 ? '▲' : '▼';
    document.getElementById('iconeOrdem').textContent       = '↕';
    document.getElementById('iconeOrdemNasc').textContent   = '↕';
    renderizarTabela();
  });


  // --- botão Consultar: aplica filtros e abre o painel
  document.getElementById('btnConsultarLista').addEventListener('click', (e) => {
    e.stopPropagation();
    const accLista = document.getElementById('acc-lista');
    accLista.classList.add('open');
    listaConsultada = true;
    carregarClientes();
  });


  // --- exportar Excel
  document.getElementById('btnExcelClientes').addEventListener('click', (e) => {
    e.stopPropagation();
    if (listaClientes.length === 0) {
      alert('Nenhum cliente para exportar.');
      return;
    }

    const linhas = [
      ['Nome', 'CPF/CNPJ', 'Celular', 'E-mail', 'Gênero', 'Nascimento'],
      ...listaClientes.map((c) => [
        c.NomeCompleto || '',
        formatarDocumento(c.CpfCnpj),
        c.Telefone || '',
        c.Email || '',
        c.Genero || '',
        formatarData(c.DataNascimento),
      ]),
    ];

    const tabela = `<table>${linhas.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
    const blob   = new Blob([tabela], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href     = url;
    a.download = `clientes_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // #endregion


  // #region SUBMIT | rev.02 | 25/03/2026

  formCliente.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id          = clienteId.value;
    const reativandoId = cliReativando;

    const dados = {
      tipo:             document.getElementById('tipo').value,
      cpfCnpj:          document.getElementById('cpfCnpj').value,
      nomeCompleto:     document.getElementById('nomeCompleto').value,
      dataNascimento:   document.getElementById('dataNascimento').value || null,
      genero:           document.getElementById('genero').value || null,
      telefone:         document.getElementById('telefone').value || null,
      telefoneWhatsApp: document.getElementById('telefoneWhatsApp').checked,
      email:            document.getElementById('email').value || null,
      cep:              document.getElementById('cep').value || null,
      logradouro:       document.getElementById('logradouro').value || null,
      numero:           document.getElementById('numero').value || null,
      complemento:      document.getElementById('complemento').value || null,
      bairro:           document.getElementById('bairro').value || null,
      cidade:           document.getElementById('cidade').value || null,
      estado:           document.getElementById('estado').value || null,
    };

    btnSalvar.disabled    = true;
    btnSalvar.textContent = 'Salvando...';

    try {
      let idSalvo;

      // --- REATIVAR — PATCH /reativar
      if (reativandoId) {
        await apiRequest(`/clientes/${reativandoId}/reativar`, {
          method: 'PATCH',
          body: dados,
        });
        cliReativando = null;
        idSalvo = reativandoId;

      // --- ATUALIZAR — PUT
      } else if (id) {
        await apiRequest(`/clientes/${id}`, { method: 'PUT', body: dados });
        idSalvo = id;

      // --- CRIAR — POST
      } else {
        const resp = await apiRequest('/clientes', { method: 'POST', body: dados });
        idSalvo = resp.ClienteId || resp.id || resp.insertId;
      }

      carregarClientes();

      if (idSalvo) {
        const clienteSalvo = await apiRequest(`/clientes/${idSalvo}`);
        clienteId.value = clienteSalvo.ClienteId;
        travarCamposIdentificacao();
        mostrarMensagem('Salvo com sucesso!', 'success');
        renderizarBotoesForm('salvo', clienteSalvo);
      } else {
        cancelarCadastro();
      }
    } catch (error) {
      mostrarMensagem(error.message || 'Erro ao salvar cliente.', 'error');
      btnSalvar.disabled = false;
    }
  });

  // #endregion


  // #region EDITAR | INATIVAR | rev.02 | 25/03/2026

  // --- editar cliente: colapsa busca, abre cadastro preenchido
  window.editarCliente = async (id, modo = 'ativo') => {
    try {
      const cliente = await apiRequest(`/clientes/${id}`);

      clienteId.value = cliente.ClienteId;
      document.getElementById('tipo').value          = cliente.Tipo || 'PF';
      document.getElementById('cpfCnpj').value        = formatarDocumento(cliente.CpfCnpj);
      document.getElementById('nomeCompleto').value   = cliente.NomeCompleto || '';
      document.getElementById('dataNascimento').value = cliente.DataNascimento
        ? cliente.DataNascimento.split('T')[0]
        : '';
      document.getElementById('genero').value         = cliente.Genero || '';
      document.getElementById('telefone').value        = cliente.Telefone || '';
      document.getElementById('telefoneWhatsApp').checked =
        cliente.TelefoneWhatsApp === true || cliente.TelefoneWhatsApp === 1;
      document.getElementById('email').value       = cliente.Email || '';
      document.getElementById('cep').value         = cliente.Cep || '';
      document.getElementById('logradouro').value  = cliente.Logradouro || '';
      document.getElementById('numero').value      = cliente.Numero || '';
      document.getElementById('complemento').value = cliente.Complemento || '';
      document.getElementById('bairro').value      = cliente.Bairro || '';
      document.getElementById('cidade').value      = cliente.Cidade || '';
      document.getElementById('estado').value      = cliente.Estado || '';

      // --- trava CPF/Tipo ao editar (documento nunca se altera)
      if (modo === 'ativo' || modo === 'bloqueado' || modo === 'inativo') {
        travarCamposIdentificacao();
      } else {
        destravarCamposIdentificacao();
      }

      renderizarBotoesForm(modo, cliente);
      limparBusca();

      const accCadastro = document.getElementById('acc-cadastro');
      accCadastro.classList.remove('bloqueado');
      accCadastro.classList.add('open');
      accCadastro.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      alert('Erro ao carregar dados do cliente.');
    }
  };


  // --- editar da lista: fecha lista, abre cadastro
  window.editarClienteDaLista = (id) => {
    document.getElementById('acc-lista').classList.remove('open');
    const accCadastro = document.getElementById('acc-cadastro');
    accCadastro.classList.remove('bloqueado');
    const cli  = listaClientes.find((c) => c.ClienteId === id);
    const modo = cli && cli.Status === 'BLOQUEADO' ? 'bloqueado' : 'ativo';
    editarCliente(id, modo);
  };


  // --- inativar cliente (global — usado na listagem)
  window.inativarCliente = async (id, nome) => {
    if (!confirm(`Inativar o cliente "${nome}"?\n\nEle não aparecerá mais nas buscas.`)) return;
    try {
      await apiRequest(`/clientes/${id}`, { method: 'DELETE' });
      alert('Cliente inativado com sucesso!');
      carregarClientes();
    } catch (error) {
      alert('Erro ao inativar: ' + error.message);
    }
  };

  // #endregion


  // #region NAVEGAÇÃO | rev.02 | 25/03/2026

  // --- navegar para seção Veículos pré-filtrando por proprietário
  const navegarParaVeiculos = (cpfCnpj) => {
    document.querySelectorAll('.nav-item').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.section').forEach((s)   => s.classList.remove('active'));

    const btnVeiculos = document.querySelector('.nav-item[data-section="veiculos"]');
    const secVeiculos = document.getElementById('sec-veiculos');
    if (btnVeiculos) btnVeiculos.classList.add('active');
    if (secVeiculos) secVeiculos.classList.add('active');

    const veiTipoBusca  = document.getElementById('veiTipoBusca');
    const veiValorBusca = document.getElementById('veiValorBusca');
    const btnVeiBuscar  = document.getElementById('btnVeiBuscar');
    const accBusca      = document.getElementById('acc-veiculo-busca');

    if (veiTipoBusca)  veiTipoBusca.value  = 'proprietario';
    if (veiValorBusca) veiValorBusca.value = cpfCnpj;
    if (accBusca)      accBusca.classList.add('open');
    if (btnVeiBuscar)  btnVeiBuscar.click();
  };

  // #endregion


});
