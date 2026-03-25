// veiculos.js | data: 22/03/2026

// Módulo de Veículos — AC2
// Baseado em clientes.js
// Depende de: config.js (apiRequest) + auth.js

document.addEventListener('DOMContentLoaded', () => {
  // ELEMENTOS DO DOM
  const formVeiculo     = document.getElementById('formVeiculo');
  const veiculoId       = document.getElementById('veiculoId');
  const veiFormMensagem = document.getElementById('veiFormMensagem');

  const veiValorBusca   = document.getElementById('veiValorBusca');
  const btnVeiBuscar    = document.getElementById('btnVeiBuscar');
  const btnVeiLimparBusca = document.getElementById('btnVeiLimparBusca');
  const resultadoBuscaVei = document.getElementById('resultadoBuscaVei');
  const tbodyVeiculos   = document.getElementById('tbodyVeiculos');

  // CONTROLE DE ORDENAÇÃO
  // 0 = sem ordem | 1 = asc | -1 = desc
  let ordemAtiva = 'marca'; // campo ativo
  let ordemMarca = 1;
  let ordemProp  = 0;
  let ordemKm    = 0;
  let ordemAno   = 0;

  // CONTROLE DE REATIVAÇÃO
  let veiReativando = null;

  //  ACCORDION — abrir/fechar painéis
  document
    .querySelectorAll('#accordion-veiculos .acc-header')
    .forEach((header) => {
      header.addEventListener('click', () => {
        const targetId = header.dataset.target;
        const item = document.getElementById(targetId);

        if (item && item.classList.contains('bloqueado')) {
          alert('Efetuar a pesquisa antes!');
          return;
        }

        if (item) {
          item.classList.toggle('open');
          const fechou = !item.classList.contains('open');
          // Zera filtros e lista ao fechar o painel Lista
          if (targetId === 'acc-veiculo-lista' && fechou) {
            const filtroMarca = document.getElementById('filtroMarcaVei');
            const filtroAno   = document.getElementById('filtroAnoVei');
            if (filtroMarca) filtroMarca.value = '';
            if (filtroAno)   filtroAno.value   = '';
            listaVeiculos   = [];
            listaConsultada = false;
            tbodyVeiculos.innerHTML = '<tr><td colspan="8" class="tabela-vazia">Selecione algum filtro e/ou clique em Consultar.</td></tr>';
          }
          // Ao abrir sem ter consultado, mostra mensagem
          if (targetId === 'acc-veiculo-lista' && !fechou && !listaConsultada) {
            tbodyVeiculos.innerHTML = '<tr><td colspan="8" class="tabela-vazia">Selecione algum filtro e/ou clique em Consultar.</td></tr>';
          }
          // Limpa busca ao fechar o painel Pesquisa
          if (targetId === 'acc-veiculo-busca' && fechou) {
            limparBusca();
          }
          // Limpa form ao fechar o painel Cadastro
          if (targetId === 'acc-veiculo-cadastro' && fechou) {
            cancelarCadastro();
          }
        }
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

  const formatarKm = (km) => {
    if (km === null || km === undefined) return '—';
    return Number(km).toLocaleString('pt-BR');
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

  //  BUSCAR PROPRIETÁRIO (botão no cadastro)
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

        const cpfParaCadastro = campoVeiCpfCnpj.value;

        let cardProp = document.getElementById('cardPropNaoEncontrado');
        if (!cardProp) {
          cardProp = document.createElement('div');
          cardProp.id = 'cardPropNaoEncontrado';
          cardProp.className = 'vei-aviso vei-aviso-alerta';
          const formGrid = document.getElementById('btnVeiBuscarProprietario').closest('.form-grid');
          formGrid.parentNode.insertBefore(cardProp, formGrid.nextSibling);
        }

        cardProp.style.display = 'block';
        cardProp.innerHTML = `
          <p>⚠️ Proprietário não encontrado. Deseja cadastrar o proprietário?</p>
          <div class="form-actions" style="margin-top:10px;">
            <button type="button" id="btnPropCancelar"  class="btn btn-secondary">Cancelar</button>
            <button type="button" id="btnPropCadastrar" class="btn btn-primary">Cadastrar</button>
          </div>
        `;

        document.getElementById('btnPropCancelar').addEventListener('click', () => {
          cardProp.style.display = 'none';
          cancelarCadastro();
        });

        document.getElementById('btnPropCadastrar').addEventListener('click', () => {
          cardProp.style.display = 'none';
          cancelarCadastro();
          document.querySelector('.nav-item[data-section="clientes"]')?.click();
          setTimeout(() => {
            const accCli = document.getElementById('acc-cadastro');
            if (accCli) {
              accCli.classList.remove('bloqueado');
              accCli.classList.add('open');
            }
            const campoCpf = document.getElementById('cpfCnpj');
            if (campoCpf) {
              campoCpf.value = cpfParaCadastro;
              campoCpf.dispatchEvent(new Event('input'));
            }
          }, 300);
        });
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
    veiReativando = null;
    document.getElementById('veiClienteId').value = '';
    document.getElementById('veiNomeProprietario').value = '';
    veiFormMensagem.style.display = 'none';
    document.getElementById('veiPlaca').readOnly = false;
    document.getElementById('veiCpfCnpj').readOnly = false;
  };

  // TRAVAR / DESTRAVAR campos CPF e Placa
  const travarCamposVeiculo = () => {
    campoVeiCpfCnpj.readOnly = true;
    campoVeiCpfCnpj.style.opacity = '0.5';
    document.getElementById('veiPlaca').readOnly = true;
    document.getElementById('veiPlaca').style.opacity = '0.5';
  };

  const destravarCamposVeiculo = () => {
    campoVeiCpfCnpj.readOnly = false;
    campoVeiCpfCnpj.style.opacity = '';
    document.getElementById('veiPlaca').readOnly = false;
    document.getElementById('veiPlaca').style.opacity = '';
  };

  /* ===========================
    RENDERIZAR BOTÕES DO FORM
    Modos: 'novo' | 'ativo' | 'salvo' | 'reativar'
  =========================== */
  const renderizarBotoesVei = (modo, veiculo = null) => {
    const formActions = document.getElementById('veiFormActions');

    if (modo === 'novo') {
      formActions.innerHTML = `
        <button type="button" id="btnVeiCancelar" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiLimpar"   class="btn btn-secondary">Limpar</button>
        <button type="submit"  id="btnVeiSalvar"  class="btn btn-primary">Salvar</button>
        <button type="button" id="btnVeiServicos" class="btn btn-primary" disabled>Serviços</button>
      `;
    } else if (modo === 'ativo') {
      formActions.innerHTML = `
        <button type="button" id="btnVeiCancelar" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiLimpar"   class="btn btn-secondary">Limpar</button>
        <button type="submit"  id="btnVeiSalvar"  class="btn btn-primary">Salvar</button>
        <button type="button" id="btnVeiInativar" class="btn btn-danger">Inativar</button>
        <button type="button" id="btnVeiServicos" class="btn btn-primary" disabled>Serviços</button>
      `;
    } else if (modo === 'reativar') {
      formActions.innerHTML = `
        <button type="button" id="btnVeiCancelar"  class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiLimpar"    class="btn btn-secondary">Limpar</button>
        <button type="submit"  id="btnVeiReativar" class="btn btn-primary">Reativar</button>
        <button type="button" id="btnVeiServicos"  class="btn btn-primary" disabled>Serviços</button>
      `;
    } else if (modo === 'salvo') {
      formActions.innerHTML = `
        <button type="button" id="btnVeiFechar"   class="btn btn-success">Fechar</button>
        <button type="button" id="btnVeiInativar" class="btn btn-danger">Inativar</button>
        <button type="button" id="btnVeiServicos" class="btn btn-primary" disabled>Serviços</button>
      `;
    }

    // Re-bind eventos fixos
    const btnCancelar = document.getElementById('btnVeiCancelar');
    const btnLimpar   = document.getElementById('btnVeiLimpar');
    const btnFechar   = document.getElementById('btnVeiFechar');

    if (btnCancelar) btnCancelar.addEventListener('click', cancelarCadastro);
    if (btnLimpar)   btnLimpar.addEventListener('click', limparFormulario);
    if (btnFechar)   btnFechar.addEventListener('click', fecharCadastro);

    // Bind Inativar
    if ((modo === 'ativo' || modo === 'salvo') && veiculo) {
      document.getElementById('btnVeiInativar').addEventListener('click', async () => {
        if (!confirm(`Inativar o veículo "${veiculo.Marca} ${veiculo.Modelo} — ${veiculo.Placa}"?\n\nO proprietário será desvinculado.`)) return;
        try {
          await apiRequest(`/veiculos/${veiculo.VeiculoId}/inativar`, { method: 'PATCH', body: {} });
          alert('Veículo inativado com sucesso!');
          cancelarCadastro();
          carregarVeiculos();
        } catch (error) {
          alert('Erro ao inativar: ' + error.message);
        }
      });
    }
  };

  // CANCELAR CADASTRO — limpa, fecha e trava painel
  const cancelarCadastro = () => {
    limparFormulario();
    destravarCamposVeiculo();
    renderizarBotoesVei('novo');
    const accCadastro = document.getElementById('acc-veiculo-cadastro');
    accCadastro.classList.remove('open');
    accCadastro.classList.add('bloqueado');
  };

  // FECHAR CADASTRO — só colapsa, sem limpar
  const fecharCadastro = () => {
    document.getElementById('acc-veiculo-cadastro').classList.remove('open');
  };

  // Inicializa form em modo 'novo'
  renderizarBotoesVei('novo');

  // CARD DE RESULTADO DA BUSCA
  let cardResultado = null;

  const ocultarCardResultado = () => {
    if (cardResultado) cardResultado.style.display = 'none';
  };

  /* ===========================
    CARD — VEÍCULO ATIVO (resultado único por placa)
  =========================== */
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
        <button type="button" id="btnVeiEditar"        class="btn btn-primary">Editar</button>
      </div>
    `;

    document.getElementById('btnVeiCancelarBusca').addEventListener('click', limparBusca);

    document.getElementById('btnVeiEditar').addEventListener('click', () => {
      const accCadastro = document.getElementById('acc-veiculo-cadastro');
      accCadastro.classList.remove('bloqueado');
      editarVeiculo(veiculo.VeiculoId, 'ativo');
    });
  };

  /* ===========================
    LISTA — MÚLTIPLOS VEÍCULOS (busca por proprietário)
  =========================== */
  const exibirListaVeiculos = (veiculos) => {
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

    const linhas = veiculos.map((v, i) => `
      <div class="vei-lista-row" style="display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid #eee;">
        <span style="flex:1;">
          <strong>${v.Marca} ${v.Modelo}</strong> |
          Placa: <strong>${v.Placa || '—'}</strong> |
          Km: <strong>${formatarKm(v.Km)}</strong>
        </span>
        <button type="button" class="btn btn-secondary btn-vei-cancelar-item" data-idx="${i}">Cancelar</button>
        <button type="button" class="btn btn-primary btn-vei-editar-item"   data-id="${v.VeiculoId}" data-ativo="${v.Ativo}">Editar</button>
      </div>
    `).join('');

    cardResultado.innerHTML = `
      <p><strong>Veículos encontrados (${veiculos.length})</strong></p>
      ${linhas}
    `;

    cardResultado.querySelectorAll('.btn-vei-cancelar-item').forEach((btn) => {
      btn.addEventListener('click', limparBusca);
    });

    cardResultado.querySelectorAll('.btn-vei-editar-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id   = Number(btn.dataset.id);
        const ativo = btn.dataset.ativo === '1' || btn.dataset.ativo === 'true';
        const accCadastro = document.getElementById('acc-veiculo-cadastro');
        accCadastro.classList.remove('bloqueado');
        editarVeiculo(id, ativo ? 'ativo' : 'reativar');
      });
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
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnVeiNaoCadastrar"  class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiSimCadastrar"  class="btn btn-primary">Cadastrar</button>
      </div>
    `;

    document.getElementById('btnVeiNaoCadastrar').addEventListener('click', limparBusca);

    document.getElementById('btnVeiSimCadastrar').addEventListener('click', () => {
      const placa = veiValorBusca.value.replace(/[-\s]/g, '').toUpperCase();
      limparBusca();
      const accCadastro = document.getElementById('acc-veiculo-cadastro');
      accCadastro.classList.remove('bloqueado');
      accCadastro.classList.add('open');
      document.getElementById('veiPlaca').value = placa;
      document.getElementById('veiPlaca').readOnly = true;
      document.getElementById('veiPlaca').style.opacity = '0.5';
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
      <div class="form-actions" style="margin-top: 12px;">
        <button type="button" id="btnVeiCancelarInativo" class="btn btn-secondary">Cancelar</button>
        <button type="button" id="btnVeiEditarInativo"   class="btn btn-primary">Editar</button>
      </div>
    `;

    document.getElementById('btnVeiCancelarInativo').addEventListener('click', limparBusca);

    document.getElementById('btnVeiEditarInativo').addEventListener('click', () => {
      veiReativando = veiculo.VeiculoId;
      const accCadastro = document.getElementById('acc-veiculo-cadastro');
      accCadastro.classList.remove('bloqueado');
      editarVeiculo(veiculo.VeiculoId, 'reativar');
    });
  };

  /* ===========================
    LIMPAR BUSCA
  =========================== */
  const limparBusca = () => {
    veiValorBusca.value = '';
    resultadoBuscaVei.style.display = 'none';
    ocultarCardResultado();
    document.getElementById('acc-veiculo-busca').classList.remove('open');
  };

  btnVeiLimparBusca.addEventListener('click', () => {
    veiValorBusca.value = '';
    ocultarCardResultado();
  });

  /* ===========================
    PLACEHOLDER DINÂMICO — troca ao mudar tipo
  =========================== */
  document.getElementById('veiTipoBusca').addEventListener('change', () => {
    const tipo = document.getElementById('veiTipoBusca').value;
    veiValorBusca.placeholder = tipo === 'placa'
      ? 'Mercosul: ABC1D23'
      : '000.000.000-00 ou 00.000.000/0000-00';
    veiValorBusca.value = '';
    ocultarCardResultado();
  });

  // Máscara dinâmica no campo de busca de veículos
  veiValorBusca.addEventListener('input', () => {
    const tipo = document.getElementById('veiTipoBusca').value;
    if (tipo === 'placa') {
      veiValorBusca.value = veiValorBusca.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
    } else {
      const n = veiValorBusca.value.replace(/\D/g, '').slice(0, 14);
      if (n.length <= 11) {
        veiValorBusca.value = n
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      } else {
        veiValorBusca.value = n
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
      }
    }
  });

  /* ===========================
    BUSCAR VEÍCULO
  =========================== */
  const executarBusca = async () => {
    const tipo  = document.getElementById('veiTipoBusca').value;
    const valor = veiValorBusca.value.trim();

    if (!valor) {
      alert(tipo === 'placa' ? 'Digite a placa para buscar.' : 'Digite o CPF ou CNPJ para buscar.');
      return;
    }

    // Validação de formato
    if (tipo === 'placa') {
      const mercosul = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i;
      if (!mercosul.test(valor.replace(/[-\s]/g, ''))) {
        veiValorBusca.style.borderColor = 'red';
        veiValorBusca.title = 'Formato inválido. Use o padrão Mercosul: ABC1D23';
        alert('Placa inválida. Use o formato Mercosul: ABC1D23');
        return;
      }
    } else {
      const digits = valor.replace(/\D/g, '');
      if (digits.length !== 11 && digits.length !== 14) {
        veiValorBusca.style.borderColor = 'red';
        veiValorBusca.title = 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos';
        alert('CPF/CNPJ inválido. CPF: 11 dígitos | CNPJ: 14 dígitos');
        return;
      }
    }

    veiValorBusca.style.borderColor = '';
    veiValorBusca.title = '';

    const valorNormalizado = tipo === 'placa'
      ? valor.replace(/[-\s]/g, '').toUpperCase()
      : valor.replace(/\D/g, '');

    btnVeiBuscar.disabled = true;
    btnVeiBuscar.textContent = 'Buscando...';
    ocultarCardResultado();

    try {
      const resultado = await apiRequest(
        `/veiculos/buscar?tipo=${tipo}&valor=${valorNormalizado}`,
      );

      if (resultado.length === 0) {
        exibirVeiculoNaoEncontrado();
      } else if (resultado.length > 1) {
        exibirListaVeiculos(resultado);
      } else {
        const veiculo = resultado[0];
        if (veiculo.Ativo === false || veiculo.Ativo === 0 || !veiculo.ClienteId) {
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
  };

  btnVeiBuscar.addEventListener('click', executarBusca);

  // Enter na busca
  veiValorBusca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executarBusca();
  });

  /* ===========================
    SALVAR / ATUALIZAR VEÍCULO
  =========================== */
  formVeiculo.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = veiculoId.value;
    let clienteId = document.getElementById('veiClienteId').value;

    // No modo reativar: busca proprietário automaticamente pelo CPF/CNPJ digitado
    if (veiReativando && !clienteId) {
      const cpfCnpj = campoVeiCpfCnpj.value.replace(/\D/g, '').trim();
      if (!cpfCnpj) {
        alert('Digite o CPF/CNPJ do novo proprietário antes de salvar.');
        return;
      }
      try {
        const cliente = await apiRequest(`/veiculos/cliente?cpfCnpj=${cpfCnpj}`);
        document.getElementById('veiNomeProprietario').value = cliente.NomeCompleto;
        document.getElementById('veiClienteId').value = cliente.ClienteId;
        clienteId = String(cliente.ClienteId);
      } catch (error) {
        alert('Proprietário não encontrado. Verifique o CPF/CNPJ.');
        return;
      }
    }

    if (!clienteId) {
      alert('Associe um proprietário ao veículo.\n\n1. Digite o CPF/CNPJ\n2. Clique em "Buscar Proprietário"\n3. Depois salve');
      return;
    }

    const dados = {
      clienteId:    Number(clienteId),
      placa:        document.getElementById('veiPlaca').value.trim().toUpperCase(),
      marca:        document.getElementById('veiMarca').value.trim(),
      modelo:       document.getElementById('veiModelo').value.trim(),
      motorizacao:  document.getElementById('veiMotorizacao').value.trim() || null,
      anoModelo:    document.getElementById('veiAnoModelo').value.trim() || null,
      km:           document.getElementById('veiKm').value || null,
    };

    if (!dados.placa)   { alert('Placa é obrigatória.');   return; }
    if (!dados.marca)   { alert('Marca é obrigatória.');   return; }
    if (!dados.modelo)  { alert('Modelo é obrigatório.');  return; }

    const btnSalvar = document.getElementById('btnVeiSalvar');
    if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.textContent = 'Salvando...'; }

    try {
      let idSalvo;

      if (veiReativando) {
        await apiRequest(`/veiculos/${veiReativando}/reativar`, { method: 'PATCH', body: dados });
        idSalvo = veiReativando;
        veiReativando = null;
      } else if (id) {
        await apiRequest(`/veiculos/${id}`, { method: 'PUT', body: dados });
        idSalvo = id;
      } else {
        const resp = await apiRequest('/veiculos', { method: 'POST', body: dados });
        idSalvo = resp.VeiculoId || resp.id || resp.insertId;
      }

      carregarVeiculos();

      if (idSalvo) {
        const veiculoSalvo = await apiRequest(`/veiculos/${idSalvo}`);
        veiculoId.value = veiculoSalvo.VeiculoId;
        travarCamposVeiculo();
        mostrarMensagem('Salvo com sucesso!', 'success');
        renderizarBotoesVei('salvo', veiculoSalvo);
      } else {
        cancelarCadastro();
      }
    } catch (error) {
      mostrarMensagem(error.message || 'Erro ao salvar veículo.', 'error');
      if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = id ? 'Atualizar' : 'Salvar'; }
    }
  });

  /* ===========================
    EDITAR VEÍCULO
    Colapsa busca, abre cadastro
  =========================== */
  window.editarVeiculo = async (id, modo = 'ativo') => {
    try {
      const veiculo = await apiRequest(`/veiculos/${id}`);

      veiculoId.value = veiculo.VeiculoId;
      document.getElementById('veiCpfCnpj').value = modo === 'reativar' ? '' : formatarDocumento(veiculo.ProprietarioCpfCnpj);
      document.getElementById('veiNomeProprietario').value = modo === 'reativar' ? '' : (veiculo.ProprietarioNome || '');
      document.getElementById('veiClienteId').value = modo === 'reativar' ? '' : (veiculo.ClienteId || '');
      document.getElementById('veiPlaca').value      = veiculo.Placa || '';
      document.getElementById('veiMarca').value      = veiculo.Marca || '';
      document.getElementById('veiModelo').value     = veiculo.Modelo || '';
      document.getElementById('veiMotorizacao').value = veiculo.Motorizacao || '';
      document.getElementById('veiAnoModelo').value  = veiculo.AnoModelo || '';
      document.getElementById('veiKm').value         = veiculo.Km !== null ? veiculo.Km : '';

      // No modo reativar: libera CPF/CNPJ e nome, trava placa
      if (modo === 'reativar') {
        document.getElementById('veiCpfCnpj').readOnly = false;
        document.getElementById('veiCpfCnpj').style.opacity = '';
        document.getElementById('veiNomeProprietario').readOnly = false;
        document.getElementById('veiNomeProprietario').style.opacity = '';
        document.getElementById('veiPlaca').readOnly = true;
        document.getElementById('veiPlaca').style.opacity = '0.5';
      } else {
        travarCamposVeiculo();
      }

      renderizarBotoesVei(modo, veiculo);

      limparBusca();

      const accCadastro = document.getElementById('acc-veiculo-cadastro');
      accCadastro.classList.remove('bloqueado');
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
    if (!confirm(`Inativar o veículo "${nome}"?\n\nO proprietário será desvinculado.`)) return;

    try {
      await apiRequest(`/veiculos/${id}/inativar`, { method: 'PATCH', body: {} });
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
  let listaConsultada = false;

  const carregarVeiculos = async () => {
    tbodyVeiculos.innerHTML = '<tr><td colspan="8" class="tabela-vazia">Carregando...</td></tr>';
    try {
      listaVeiculos = await apiRequest('/veiculos');
      // Salva filtros selecionados antes de recriar os dropdowns
      const marcaSalva = document.getElementById('filtroMarcaVei')?.value || '';
      const anoSalvo   = document.getElementById('filtroAnoVei')?.value   || '';
      popularFiltros();
      // Restaura seleção após recriar
      if (marcaSalva) document.getElementById('filtroMarcaVei').value = marcaSalva;
      if (anoSalvo)   document.getElementById('filtroAnoVei').value   = anoSalvo;
      renderizarLista();
    } catch (error) {
      tbodyVeiculos.innerHTML = '<tr><td colspan="8" class="tabela-vazia">Erro ao carregar veículos</td></tr>';
    }
  };

  /* ===========================
    POPULAR FILTROS
  =========================== */
  const popularFiltros = () => {
    const selMarca = document.getElementById('filtroMarcaVei');
    const selAno   = document.getElementById('filtroAnoVei');

    const marcas = [...new Set(listaVeiculos.map(v => v.Marca).filter(Boolean))].sort();
    const anos   = [...new Set(listaVeiculos.map(v => v.AnoModelo).filter(Boolean))].sort();

    selMarca.innerHTML = '<option value="">Marca</option>'      + marcas.map(m => `<option value="${m}">${m}</option>`).join('');
    selAno.innerHTML   = '<option value="">Ano/Modelo</option>' + anos.map(a => `<option value="${a}">${a}</option>`).join('');
  };

  /* ===========================
    RENDERIZAR LISTA
  =========================== */
  const renderizarLista = () => {
    const filtroMarca = document.getElementById('filtroMarcaVei')?.value || '';
    const filtroAno   = document.getElementById('filtroAnoVei')?.value || '';

    let filtrados = listaVeiculos.filter((v) => {
      if (filtroMarca && v.Marca     !== filtroMarca) return false;
      if (filtroAno   && v.AnoModelo !== filtroAno)   return false;
      return true;
    });

    // Ordenação ativa
    filtrados.sort((a, b) => {
      if (ordemAtiva === 'km') {
        return ordemKm * ((a.Km || 0) - (b.Km || 0));
      }
      if (ordemAtiva === 'ano') {
        return ordemAno * (a.AnoModelo || '').localeCompare(b.AnoModelo || '', 'pt-BR');
      }
      if (ordemAtiva === 'prop') {
        return ordemProp * (a.ProprietarioNome || '').localeCompare(b.ProprietarioNome || '', 'pt-BR');
      }
      // padrão: marca
      return ordemMarca * a.Marca.localeCompare(b.Marca, 'pt-BR');
    });

    if (filtrados.length === 0) {
      tbodyVeiculos.innerHTML = '<tr><td colspan="8" class="tabela-vazia">Nenhum veículo encontrado com este filtro.</td></tr>';
      return;
    }

    tbodyVeiculos.innerHTML = filtrados.map((v) => `
      <tr>
        <td>${v.Marca}</td>
        <td>${v.Modelo}</td>
        <td>${v.Placa || '—'}</td>
        <td>${v.ProprietarioNome || '—'}</td>
        <td>${formatarDocumento(v.ProprietarioCpfCnpj)}</td>
        <td>${formatarKm(v.Km)}</td>
        <td>${v.AnoModelo || '—'}</td>
        <td>
          <div class="acoes">
            <button class="btn-sm btn-editar" title="Editar" onclick="editarVeiculoLista(${v.VeiculoId})">✏️</button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  /* ===========================
    EDITAR DA LISTA
    Fecha lista, abre cadastro
  =========================== */
  window.editarVeiculoLista = (id) => {
    document.getElementById('acc-veiculo-lista').classList.remove('open');
    const accCadastro = document.getElementById('acc-veiculo-cadastro');
    accCadastro.classList.remove('bloqueado');
    editarVeiculo(id, 'ativo');
  };

  /* ===========================
    ORDENAÇÃO — clique nos headers
  =========================== */
  const configurarOrdem = (thId, iconeId, campo) => {
    const th = document.getElementById(thId);
    if (!th) return;
    th.addEventListener('click', () => {
      // Salva valor atual antes de resetar
      let valorAtual = 0;
      if (campo === 'marca') valorAtual = ordemMarca;
      if (campo === 'prop')  valorAtual = ordemProp;
      if (campo === 'km')    valorAtual = ordemKm;
      if (campo === 'ano')   valorAtual = ordemAno;

      // Reseta ícones e variáveis de outros campos
      ['iconeOrdemMarca', 'iconeOrdemPropVei', 'iconeOrdemKm', 'iconeOrdemAno'].forEach(id => {
        const el = document.getElementById(id);
        if (el && id !== iconeId) el.textContent = '↕';
      });
      ordemMarca = 0; ordemProp = 0; ordemKm = 0; ordemAno = 0;
      ordemAtiva = campo;

      // Alterna asc/desc usando valor salvo
      let ordemAtual;
      if (campo === 'marca')  { ordemMarca = valorAtual === 1 ? -1 : 1; ordemAtual = ordemMarca; }
      if (campo === 'prop')   { ordemProp  = valorAtual === 1 ? -1 : 1; ordemAtual = ordemProp;  }
      if (campo === 'km')     { ordemKm    = valorAtual === 1 ? -1 : 1; ordemAtual = ordemKm;    }
      if (campo === 'ano')    { ordemAno   = valorAtual === 1 ? -1 : 1; ordemAtual = ordemAno;   }

      document.getElementById(iconeId).textContent = ordemAtual === 1 ? '▲' : '▼';
      renderizarLista();
    });
  };

  configurarOrdem('thMarcaVei',       'iconeOrdemMarca',   'marca');
  configurarOrdem('thProprietarioVei','iconeOrdemPropVei',  'prop');
  configurarOrdem('thKmVei',          'iconeOrdemKm',       'km');
  configurarOrdem('thAnoVei',         'iconeOrdemAno',      'ano');

  /* ===========================
    FILTROS — aplicados apenas ao clicar em Consultar
  =========================== */

  /* ===========================
    BOTÃO CONSULTAR
  =========================== */
  document.getElementById('btnConsultarVeiculos').addEventListener('click', (e) => {
    e.stopPropagation();
    const accLista = document.getElementById('acc-veiculo-lista');
    accLista.classList.add('open');
    listaConsultada = true;
    if (listaVeiculos.length === 0) {
      carregarVeiculos();
    } else {
      renderizarLista();
    }
  });

  /* ===========================
    EXPORTAR EXCEL
  =========================== */
  document.getElementById('btnExcelVeiculos').addEventListener('click', (e) => {
    e.stopPropagation();
    if (listaVeiculos.length === 0) {
      alert('Nenhum veículo para exportar. Clique em Consultar primeiro.');
      return;
    }

    const linhas = [
      ['Marca', 'Modelo', 'Placa', 'Proprietário', 'CPF/CNPJ', 'Km', 'Ano/Modelo'],
      ...listaVeiculos.map((v) => [
        v.Marca || '',
        v.Modelo || '',
        v.Placa || '',
        v.ProprietarioNome || '',
        formatarDocumento(v.ProprietarioCpfCnpj),
        v.Km !== null && v.Km !== undefined ? v.Km : '',
        v.AnoModelo || '',
      ]),
    ];

    const tabela = `<table>${linhas.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
    const blob = new Blob([tabela], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veiculos_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  });

  /* ===========================
    INICIALIZAÇÃO
  =========================== */
  tbodyVeiculos.innerHTML = '<tr><td colspan="8" class="tabela-vazia">Selecione algum filtro e/ou clique em Consultar.</td></tr>';

  // Carrega dados em background só para popular os filtros — sem exibir a lista
  (async () => {
    try {
      listaVeiculos = await apiRequest('/veiculos');
      popularFiltros();
    } catch (_) { /* silencioso */ }
  })();
});
