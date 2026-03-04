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
