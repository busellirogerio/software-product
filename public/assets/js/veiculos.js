// veiculos.js | data: 05/03/2026

// Módulo de Veículos — AC2
// Baseado em clientes.js
// Depende de: config.js (apiRequest) + auth.js

document.addEventListener('DOMContentLoaded', () => {
  // ELEMENTOS DO DOM
  const formVeiculo = document.getElementById('formVeiculo');
  const veiculoId = document.getElementById('veiculoId');
  const btnVeiLimpar = document.getElementById('btnVeiLimpar');
  const btnVeiSalvar = document.getElementById('btnVeiSalvar');
  const veiFormMensagem = document.getElementById('veiFormMensagem');

  const veiPlacaBusca = document.getElementById('veiPlacaBusca');
  const btnVeiBuscar = document.getElementById('btnVeiBuscar');
  const btnVeiLimparBusca = document.getElementById('btnVeiLimparBusca');
  const resultadoBuscaVei = document.getElementById('resultadoBuscaVei');
  const tbodyVeiculos = document.getElementById('tbodyVeiculos');

  // CONTROLE DE ORDENAÇÃO
  let ordemMarca = 1;
  let ordemProp = 1;

  //  ACCORDION — abrir/fechar painéis
  document
    .querySelectorAll('#accordion-veiculos .acc-header')
    .forEach((header) => {
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

  //   HELPERS DE FORMATAÇÃO
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

  const formatarDocumento = (doc) => {
    if (!doc) return '—';
    const n = doc.replace(/\D/g, '');
    if (n.length === 11) return formatarCpf(n);
    if (n.length === 14) return formatarCnpj(n);
    return doc;
  };

  const formatarData = (data) => {
    if (!data) return '—';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  };

  const formatarKm = (km) => {
    if (km === null || km === undefined) return '—';
    return Number(km).toLocaleString('pt-BR');
  };

  const normalizarPlaca = (placa) => {
    return placa.replace(/[-\s]/g, '').toUpperCase().trim();
  };

  //  MÁSCARA CPF/CNPJ
  const campoVeiCpfCnpj = document.getElementById('veiCpfCnpj');

  campoVeiCpfCnpj.addEventListener('input', () => {
    const valor = campoVeiCpfCnpj.value.replace(/\D/g, '');
    if (valor.length <= 11) {
      campoVeiCpfCnpj.value = formatarCpf(valor);
    } else {
      campoVeiCpfCnpj.value = formatarCnpj(valor);
    }
  });

  //  BUSCAR PROPRIETÁRIO
  document
    .getElementById('btnVeiBuscarProprietario')
    .addEventListener('click', async () => {
      const cpfCnpj = campoVeiCpfCnpj.value.replace(/\D/g, '').trim();

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
          '⚠️ Proprietário não encontrado.\n\nCadastre-o primeiro em: Menu → Clientes → Cadastrar',
        );
      }
    });

  //  EXIBIR MENSAGEM NO FORMULÁRIO
  const mostrarMensagem = (texto, tipo = 'success') => {
    veiFormMensagem.textContent = texto;
    veiFormMensagem.className = `form-mensagem ${tipo}`;
    veiFormMensagem.style.display = 'block';
    setTimeout(() => {
      veiFormMensagem.style.display = 'none';
    }, 4000);
  };

  // LIMPAR FORMULÁRIO
  const limparFormulario = () => {
    formVeiculo.reset();
    veiculoId.value = '';
    document.getElementById('veiClienteId').value = '';
    document.getElementById('veiNomeProprietario').value = '';
    document.getElementById('veiReativando').value = '';
    btnVeiSalvar.textContent = 'Salvar';
    veiFormMensagem.style.display = 'none';
  };

  btnVeiLimpar.addEventListener('click', limparFormulario);

  // CANCELAR CADASTRO
  // Limpa, fecha e trava painel
  const cancelarCadastro = () => {
    limparFormulario();
    const accCadastro = document.getElementById('acc-veiculo-cadastro');
    accCadastro.classList.remove('open');
    accCadastro.classList.add('bloqueado');
  };

  document
    .getElementById('btnVeiCancelar')
    .addEventListener('click', cancelarCadastro);

  // CARD DE RESULTADO DA BUSCA
  let cardResultado = null;

  const ocultarCardResultado = () => {
    if (cardResultado) cardResultado.style.display = 'none';
  };

  // CARD — VEÍCULO ATIVO
  const exibirVeiculoEncontrado = (veiculo) => {
    if (!cardResultado) {
      cardResultado = document.createElement('div');
      cardResultado.id = 'cardVeiculoResultado';
      resultadoBuscaVei.parentNode.insertBefore(
        cardResultado,
        resultadoBuscaVei.nextSibling,
      );
    }

    cardResultado.className = 'vei-resultado-card';
    cardResultado.style.display = 'block';
    cardResultado.innerHTML = `
      <p>
        <strong>${veiculo.Marca} ${veiculo.Modelo}</strong> |
        Placa: <strong>${veiculo.Placa}</strong> |
        Proprietário: <strong>${veiculo.ProprietarioNome || '—'}</strong> |
        Km: <strong>${formatarKm(veiculo.Km)}</strong>
      </p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnVeiCancelarBusca" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiEditar" class="btn btn-primary">Editar</button>
        <button type="button" id="btnVeiInativar" class="btn btn-danger">Inativar</button>
      </div>
    `;

    // Cancelar
    document
      .getElementById('btnVeiCancelarBusca')
      .addEventListener('click', () => {
        limparBusca();
      });

    // Editar — colapsa busca, abre cadastro com dados
    document.getElementById('btnVeiEditar').addEventListener('click', () => {
      const accCadastro = document.getElementById('acc-veiculo-cadastro');
      accCadastro.classList.remove('bloqueado');
      editarVeiculo(veiculo.VeiculoId);
    });

    // Inativar
    document
      .getElementById('btnVeiInativar')
      .addEventListener('click', async () => {
        if (
          !confirm(
            `Inativar o veículo "${veiculo.Marca} ${veiculo.Modelo} — ${veiculo.Placa}"?\n\nO proprietário será desvinculado.`,
          )
        )
          return;

        try {
          await apiRequest(
            `/veiculos/${veiculo.VeiculoId}/inativar`,
            'PATCH',
            {},
          );
          alert('Veículo inativado com sucesso!');
          limparBusca();
          document.getElementById('acc-veiculo-busca').classList.remove('open');
          carregarVeiculos();
        } catch (error) {
          alert('Erro ao inativar: ' + error.message);
        }
      });
  };

  /* ===========================
    CARD — VEÍCULO NÃO ENCONTRADO
  =========================== */
  const exibirVeiculoNaoEncontrado = () => {
    if (!cardResultado) {
      cardResultado = document.createElement('div');
      cardResultado.id = 'cardVeiculoResultado';
      resultadoBuscaVei.parentNode.insertBefore(
        cardResultado,
        resultadoBuscaVei.nextSibling,
      );
    }

    cardResultado.className = 'vei-aviso vei-aviso-info';
    cardResultado.style.display = 'block';
    cardResultado.innerHTML = `
      <p>ℹ️ Veículo <strong>não encontrado</strong> no cadastro.</p>
      <p>Deseja cadastrá-lo agora?</p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnVeiNaoCadastrar" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiSimCadastrar" class="btn btn-primary">Cadastrar</button>
      </div>
    `;

    document
      .getElementById('btnVeiNaoCadastrar')
      .addEventListener('click', () => {
        limparBusca();
      });

    document
      .getElementById('btnVeiSimCadastrar')
      .addEventListener('click', () => {
        const placaBuscada = veiPlacaBusca.value.trim();
        limparBusca();
        const accCadastro = document.getElementById('acc-veiculo-cadastro');
        accCadastro.classList.remove('bloqueado');
        accCadastro.classList.add('open');
        document.getElementById('veiPlaca').value = placaBuscada.toUpperCase();
        accCadastro.scrollIntoView({ behavior: 'smooth' });
      });
  };

  /* ===========================
    CARD — VEÍCULO INATIVO
  =========================== */
  const exibirVeiculoInativoEncontrado = (veiculo) => {
    if (!cardResultado) {
      cardResultado = document.createElement('div');
      cardResultado.id = 'cardVeiculoResultado';
      resultadoBuscaVei.parentNode.insertBefore(
        cardResultado,
        resultadoBuscaVei.nextSibling,
      );
    }

    cardResultado.className = 'vei-aviso vei-aviso-alerta';
    cardResultado.style.display = 'block';
    cardResultado.innerHTML = `
      <p>⚠️ Veículo <strong>inativo</strong> encontrado.</p>
      <p><strong>${veiculo.Marca} ${veiculo.Modelo}</strong> | Placa: <strong>${veiculo.Placa}</strong></p>
      <p>Deseja reativar?</p>
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnVeiCancelarInativo" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiReativar" class="btn btn-primary">Reativar</button>
      </div>
    `;

    document
      .getElementById('btnVeiCancelarInativo')
      .addEventListener('click', () => {
        limparBusca();
      });

    document.getElementById('btnVeiReativar').addEventListener('click', () => {
      const accCadastro = document.getElementById('acc-veiculo-cadastro');
      accCadastro.classList.remove('bloqueado');
      document.getElementById('veiReativando').value = veiculo.VeiculoId;
      editarVeiculo(veiculo.VeiculoId);
    });
  };

  /* ===========================
    LIMPAR BUSCA
  =========================== */
  const limparBusca = () => {
    veiPlacaBusca.value = '';
    resultadoBuscaVei.style.display = 'none';
    ocultarCardResultado();
    document.getElementById('acc-veiculo-busca').classList.remove('open');
  };

  btnVeiLimparBusca.addEventListener('click', () => {
    veiPlacaBusca.value = '';
    ocultarCardResultado();
  });

  /* ===========================
    BUSCAR VEÍCULO
  =========================== */
  btnVeiBuscar.addEventListener('click', async () => {
    const placa = normalizarPlaca(veiPlacaBusca.value);

    if (!placa) {
      alert('Digite uma placa para buscar.');
      return;
    }

    btnVeiBuscar.disabled = true;
    btnVeiBuscar.textContent = 'Buscando...';
    ocultarCardResultado();

    try {
      const resultado = await apiRequest(
        `/veiculos/buscar?tipo=placa&valor=${placa}`,
      );

      if (resultado.length === 0) {
        exibirVeiculoNaoEncontrado();
      } else {
        const veiculo = resultado[0];
        if (veiculo.Ativo === false || veiculo.Ativo === 0) {
          exibirVeiculoInativoEncontrado(veiculo);
        } else {
          exibirVeiculoEncontrado(veiculo);
        }
      }
    } catch (error) {
      alert(error.message || 'Erro ao buscar veículo.');
    } finally {
      btnVeiBuscar.disabled = false;
      btnVeiBuscar.textContent = 'Buscar';
    }
  });

  // Busca ao pressionar Enter
  veiPlacaBusca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnVeiBuscar.click();
  });

  /* ===========================
    SALVAR / ATUALIZAR VEÍCULO
  =========================== */
  formVeiculo.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = veiculoId.value;
    const clienteId = document.getElementById('veiClienteId').value;

    if (!clienteId) {
      alert(
        'Associe um proprietário ao veículo.\n\n1. Digite o CPF/CNPJ\n2. Clique em "Buscar Proprietário"\n3. Depois salve',
      );
      return;
    }

    const dados = {
      clienteId: Number(clienteId),
      placa: document.getElementById('veiPlaca').value.trim().toUpperCase(),
      marca: document.getElementById('veiMarca').value.trim(),
      modelo: document.getElementById('veiModelo').value.trim(),
      motorizacao:
        document.getElementById('veiMotorizacao').value.trim() || null,
      anoModelo: document.getElementById('veiAnoModelo').value.trim() || null,
      km: document.getElementById('veiKm').value || null,
    };

    // Validações
    if (!dados.placa) {
      alert('Placa é obrigatória.');
      return;
    }
    if (!dados.marca) {
      alert('Marca é obrigatória.');
      return;
    }
    if (!dados.modelo) {
      alert('Modelo é obrigatório.');
      return;
    }

    btnVeiSalvar.disabled = true;
    btnVeiSalvar.textContent = 'Salvando...';

    try {
      const reativandoId = document.getElementById('veiReativando').value;

      if (reativandoId) {
        await apiRequest(`/veiculos/${reativandoId}/reativar`, 'PATCH', dados);
        alert('Veículo reativado com sucesso!');
        document.getElementById('veiReativando').value = '';
      } else if (id) {
        await apiRequest(`/veiculos/${id}`, 'PUT', dados);
        alert('Veículo atualizado com sucesso!');
      } else {
        await apiRequest('/veiculos', 'POST', dados);
        alert('Veículo salvo com sucesso!');
      }

      cancelarCadastro();
      carregarVeiculos();
    } catch (error) {
      alert(error.message || 'Erro ao salvar veículo.');
    } finally {
      btnVeiSalvar.disabled = false;
      btnVeiSalvar.textContent = id ? 'Atualizar' : 'Salvar';
    }
  });

  /* ===========================
    EDITAR VEÍCULO
    Colapsa busca, abre cadastro
  =========================== */
  window.editarVeiculo = async (id) => {
    try {
      const veiculo = await apiRequest(`/veiculos/${id}`);

      veiculoId.value = veiculo.VeiculoId;
      document.getElementById('veiCpfCnpj').value = formatarDocumento(
        veiculo.ProprietarioCpfCnpj,
      );
      document.getElementById('veiNomeProprietario').value =
        veiculo.ProprietarioNome || '';
      document.getElementById('veiClienteId').value = veiculo.ClienteId || '';
      document.getElementById('veiPlaca').value = veiculo.Placa || '';
      document.getElementById('veiMarca').value = veiculo.Marca || '';
      document.getElementById('veiModelo').value = veiculo.Modelo || '';
      document.getElementById('veiMotorizacao').value =
        veiculo.Motorizacao || '';
      document.getElementById('veiAnoModelo').value = veiculo.AnoModelo || '';
      document.getElementById('veiKm').value =
        veiculo.Km !== null ? veiculo.Km : '';

      btnVeiSalvar.textContent = 'Atualizar';

      // Fecha busca
      limparBusca();

      // Abre cadastro
      const accCadastro = document.getElementById('acc-veiculo-cadastro');
      accCadastro.classList.add('open');
      accCadastro.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      alert('Erro ao carregar dados do veículo.');
    }
  };

  /* ===========================
    INATIVAR VEÍCULO — global
    Usado na listagem
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
      document.getElementById('acc-veiculo-lista').classList.remove('open');
      carregarVeiculos();
    } catch (error) {
      alert('Erro ao inativar: ' + error.message);
    }
  };

  /* ===========================
    CARREGAR LISTA DE VEÍCULOS
  =========================== */
  let listaVeiculos = [];

  const carregarVeiculos = async () => {
    try {
      listaVeiculos = await apiRequest('/veiculos');
      renderizarLista();
    } catch (error) {
      tbodyVeiculos.innerHTML =
        '<tr><td colspan="8" class="tabela-vazia">Erro ao carregar veículos</td></tr>';
    }
  };

  const renderizarLista = () => {
    if (listaVeiculos.length === 0) {
      tbodyVeiculos.innerHTML =
        '<tr><td colspan="8" class="tabela-vazia">Nenhum veículo cadastrado</td></tr>';
      return;
    }

    const ordenada = [...listaVeiculos].sort(
      (a, b) => a.Marca.localeCompare(b.Marca, 'pt-BR') * ordemMarca,
    );

    tbodyVeiculos.innerHTML = ordenada
      .map(
        (v) => `
        <tr>
          <td>${v.Marca}</td>
          <td>${v.Modelo}</td>
          <td>${v.Placa || '—'}</td>
          <td>${v.ProprietarioNome || '—'}</td>
          <td>${formatarDocumento(v.ProprietarioCpfCnpj)}</td>
          <td>${formatarKm(v.Km)}</td>
          <td>${formatarData(v.DataAtualizacao)}</td>
          <td>
            <div class="acoes">
              <button class="btn-sm btn-editar" onclick="editarVeiculoLista(${v.VeiculoId})">Editar</button>
              <button class="btn-sm btn-inativar" onclick="inativarVeiculo(${v.VeiculoId}, '${v.Marca} ${v.Modelo} — ${v.Placa}')">Inativar</button>
            </div>
          </td>
        </tr>
      `,
      )
      .join('');
  };

  /* ===========================
    EDITAR DA LISTA
    Fecha lista, abre cadastro
  =========================== */
  window.editarVeiculoLista = (id) => {
    document.getElementById('acc-veiculo-lista').classList.remove('open');
    const accCadastro = document.getElementById('acc-veiculo-cadastro');
    accCadastro.classList.remove('bloqueado');
    editarVeiculo(id);
  };

  /* ===========================
    ORDENAÇÃO POR MARCA
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
    ORDENAÇÃO POR PROPRIETÁRIO
  =========================== */
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

      tbodyVeiculos.innerHTML = ordenada
        .map(
          (v) => `
          <tr>
            <td>${v.Marca}</td>
            <td>${v.Modelo}</td>
            <td>${v.Placa || '—'}</td>
            <td>${v.ProprietarioNome || '—'}</td>
            <td>${formatarDocumento(v.ProprietarioCpfCnpj)}</td>
            <td>${formatarKm(v.Km)}</td>
            <td>${formatarData(v.DataAtualizacao)}</td>
            <td>
              <div class="acoes">
                <button class="btn-sm btn-editar" onclick="editarVeiculoLista(${v.VeiculoId})">Editar</button>
                <button class="btn-sm btn-inativar" onclick="inativarVeiculo(${v.VeiculoId}, '${v.Marca} ${v.Modelo} — ${v.Placa}')">Inativar</button>
              </div>
            </td>
          </tr>
        `,
        )
        .join('');
    });
  }

  /* ===========================
    INICIALIZAÇÃO
  =========================== */
  carregarVeiculos();
});
