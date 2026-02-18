// public/assets/js/clientes.js

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

  /* ===========================
    CONTROLE DE ORDENAÇÃO
    1 = A→Z | -1 = Z→A
  =========================== */
  let ordemNome = 1;

  /* ===========================
    ACCORDION — abrir/fechar painéis
  =========================== */
  document.querySelectorAll('.acc-header').forEach((header) => {
    header.addEventListener('click', () => {
      const targetId = header.dataset.target;
      const item = document.getElementById(targetId);
      if (item) {
        item.classList.toggle('open');
      }
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

  /* ===========================
    EXIBIR MENSAGEM NO FORMULÁRIO
  =========================== */
  const mostrarMensagem = (texto, tipo = 'success') => {
    formMensagem.textContent = texto;
    formMensagem.className = `form-mensagem ${tipo}`;
    formMensagem.style.display = 'block';
    setTimeout(() => {
      formMensagem.style.display = 'none';
    }, 4000);
  };

  /* ===========================
    LIMPAR FORMULÁRIO
  =========================== */
  const limparFormulario = () => {
    formCliente.reset();
    clienteId.value = '';
    btnSalvar.textContent = 'Salvar Cliente';
    formMensagem.style.display = 'none';
  };

  btnLimpar.addEventListener('click', limparFormulario);

  /* ===========================
    LIMPAR BUSCA
    Fecha painel e limpa resultados
  =========================== */
  const limparBusca = () => {
    valorBusca.value = '';
    tbodyBusca.innerHTML = '';
    resultadoBusca.style.display = 'none';
    document.getElementById('acc-busca').classList.remove('open');
  };

  btnLimparBusca.addEventListener('click', limparBusca);

  /* ===========================
    GERAR LINHA DA TABELA
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
            <button class="btn-sm btn-excluir"
              onclick="excluirCliente(${cliente.ClienteId})">
              🗑️ Excluir
            </button>
          </div>
        </td>
      </tr>
    `;
  };

  /* ===========================
    LISTA GLOBAL DE CLIENTES
    Guardada para ordenação local
  =========================== */
  let listaClientes = [];

  /* ===========================
    RENDERIZAR TABELA
    Aplica ordenação e renderiza
  =========================== */
  const renderizarTabela = () => {
    const ordenados = [...listaClientes].sort((a, b) => {
      return ordemNome * a.NomeCompleto.localeCompare(b.NomeCompleto, 'pt-BR');
    });
    tbodyClientes.innerHTML = ordenados.map(gerarLinha).join('');
  };

  /* ===========================
    CARREGAR LISTA DE CLIENTES
  =========================== */
  const carregarClientes = async () => {
    tbodyClientes.innerHTML = `
      <tr><td colspan="6" class="tabela-vazia">Carregando...</td></tr>
    `;
    try {
      listaClientes = await apiRequest('/clientes');
      if (listaClientes.length === 0) {
        tbodyClientes.innerHTML = `
          <tr><td colspan="6" class="tabela-vazia">Nenhum cliente cadastrado.</td></tr>
        `;
        return;
      }
      renderizarTabela();
    } catch (error) {
      tbodyClientes.innerHTML = `
        <tr><td colspan="6" class="tabela-vazia">Erro ao carregar clientes.</td></tr>
      `;
      console.error('Erro ao carregar clientes:', error);
    }
  };

  /* ===========================
    ORDENAR AO CLICAR NO HEADER NOME
  =========================== */
  document.getElementById('thNome').addEventListener('click', () => {
    ordemNome *= -1;
    const icone = document.getElementById('iconeOrdem');
    icone.textContent = ordemNome === 1 ? '▲' : '▼';
    renderizarTabela();
  });

  /* ===========================
    CARREGAR AO CLICAR NO MENU
  =========================== */
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (item.dataset.section === 'clientes') {
        carregarClientes();
      }
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
      } else {
        await apiRequest('/clientes', { method: 'POST', body: dados });
        mostrarMensagem('Cliente cadastrado com sucesso!', 'success');
      }

      limparFormulario();
      carregarClientes();

      // Fecha cadastro e abre lista
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
    Popula formulário + fecha busca
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

      // Fecha e limpa busca
      limparBusca();

      // Abre painel de cadastro
      document.getElementById('acc-cadastro').classList.add('open');
      document
        .getElementById('acc-cadastro')
        .scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      alert('Erro ao carregar dados do cliente.');
      console.error('Erro ao editar cliente:', error);
    }
  };

  /* ===========================
    EXCLUIR CLIENTE
    Soft delete + fecha busca
  =========================== */
  window.excluirCliente = async (id) => {
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    try {
      await apiRequest(`/clientes/${id}`, { method: 'DELETE' });

      // Fecha e limpa busca
      limparBusca();

      carregarClientes();
    } catch (error) {
      alert('Erro ao excluir cliente.');
      console.error('Erro ao excluir cliente:', error);
    }
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

    try {
      const resultado = await apiRequest(
        `/clientes/buscar?tipo=${tipo}&valor=${encodeURIComponent(valor)}`,
      );

      if (resultado.length === 0) {
        tbodyBusca.innerHTML = `
          <tr><td colspan="6" class="tabela-vazia">Nenhum cliente encontrado.</td></tr>
        `;
      } else {
        tbodyBusca.innerHTML = resultado.map(gerarLinha).join('');
      }

      resultadoBusca.style.display = 'block';
    } catch (error) {
      alert(error.message || 'Erro ao buscar cliente.');
      console.error('Erro na busca:', error);
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
