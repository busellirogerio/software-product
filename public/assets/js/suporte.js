// -----------------------------------------------
// suporte.js
// Tema: Módulo de Suporte — Abrir Chamado + Meus Chamados
// Última rev: 02 | Data: 25/03/2026
// -----------------------------------------------

document.addEventListener('DOMContentLoaded', () => {


  // #region ELEMENTOS DO DOM | rev.02 | 25/03/2026

  // --- abrir chamado
  const accItem     = document.getElementById('acc-suporte-chamado');
  const form        = document.getElementById('formSuporte');
  const supUsuario  = document.getElementById('supUsuario');
  const supNome     = document.getElementById('supNome');
  const supEmail    = document.getElementById('supEmail');
  const supTelefone = document.getElementById('supTelefone');
  const supWhatsApp = document.getElementById('supWhatsApp');
  const supCanal    = document.getElementById('supCanalContato');
  const supHorario  = document.getElementById('supHorarioContato');
  const supLocal    = document.getElementById('supLocalProblema');
  const supNivel    = document.getElementById('supNivelProblema');
  const supDescricao= document.getElementById('supDescricao');
  const supMensagem = document.getElementById('supFormMensagem');
  const btnCancelar = document.getElementById('btnSupCancelar');
  const btnEnviar   = document.getElementById('btnSupEnviar');

  // #endregion


  // #region SESSÃO | rev.02 | 25/03/2026

  // --- preencher usuário e nome da sessão (sempre bloqueados)
  function preencherSessao() {
    const sessionData = sessionStorage.getItem('usuario');
    if (!sessionData) return;
    const { usuario } = JSON.parse(sessionData);
    if (supUsuario) supUsuario.value = usuario.Login        || '';
    if (supNome)    supNome.value    = usuario.NomeCompleto || usuario.Login || '';
  }

  preencherSessao();

  // #endregion


  // #region FORMULÁRIO | rev.02 | 25/03/2026

  // --- máscara telefone: (11) 99999-0000
  if (supTelefone) {
    supTelefone.addEventListener('input', () => {
      let v = supTelefone.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) {
        v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        v = `(${v}`;
      }
      supTelefone.value = v;
    });
  }

  // --- zerar campos editáveis (nunca apaga Usuário e Nome)
  function zerarForm() {
    if (supEmail)    supEmail.value    = '';
    if (supTelefone) supTelefone.value = '';
    if (supWhatsApp) supWhatsApp.checked = false;
    if (supCanal)    supCanal.value    = '';
    if (supHorario)  supHorario.value  = '';
    if (supLocal)    supLocal.value    = '';
    if (supNivel)    supNivel.value    = '';
    if (supDescricao)supDescricao.value= '';
    if (supMensagem) {
      supMensagem.style.display = 'none';
      supMensagem.textContent   = '';
      supMensagem.className     = 'form-mensagem';
    }
    // Garante que Usuário e Nome permanecem preenchidos
    preencherSessao();
  }

  // --- fechar accordion + zerar
  function fecharAccordion() {
    if (accItem && accItem.classList.contains('open')) {
      accItem.classList.remove('open');
    }
    zerarForm();
  }

  // --- botão Cancelar
  if (btnCancelar) {
    btnCancelar.addEventListener('click', fecharAccordion);
  }

  // --- fechar accordion pela seta: zera ao fechar
  // sobrescreve o listener genérico do dashboard.js
  if (accItem) {
    const header = accItem.querySelector('.acc-header');
    if (header) {
      header.addEventListener('click', () => {
        // Se estava aberto, vai fechar — zera
        if (accItem.classList.contains('open')) {
          setTimeout(zerarForm, 0);
        }
      });
    }
  }

  // --- sair da seção Suporte: fecha e zera
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (item.dataset.section !== 'suporte') {
        fecharAccordion();
      }
    });
  });

  // --- validação
  function validar() {
    const obrigatorios = [
      { el: supEmail,    label: 'E-mail' },
      { el: supTelefone, label: 'Telefone' },
      { el: supCanal,    label: 'Melhor Canal para Contato' },
      { el: supHorario,  label: 'Melhor Horário para Contato' },
      { el: supLocal,    label: 'Local do Problema' },
      { el: supNivel,    label: 'Nível do Problema' },
      { el: supDescricao,label: 'Descrição do Problema' },
    ];

    for (const { el, label } of obrigatorios) {
      if (!el || !el.value.trim()) {
        mostrarMensagem(`Campo obrigatório: ${label}`, 'error');
        el && el.focus();
        return false;
      }
    }

    if (supDescricao && supDescricao.value.trim().length < 20) {
      mostrarMensagem('Descrição deve ter no mínimo 20 caracteres.', 'error');
      supDescricao.focus();
      return false;
    }

    return true;
  }

  // --- mensagem de feedback
  function mostrarMensagem(texto, tipo) {
    if (!supMensagem) return;
    supMensagem.textContent   = texto;
    supMensagem.className     = `form-mensagem ${tipo}`;
    supMensagem.style.display = 'block';
  }

  // --- gerar protocolo aleatório: SUP-YYYYMMDD-XXXXX
  function gerarProtocolo() {
    const hoje = new Date();
    const data = hoje.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `SUP-${data}-${rand}`;
  }

  // --- submit: enviar chamado
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validar()) return;

      const protocolo = gerarProtocolo();

      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Enviando...';

      try {
        await apiRequest('/suporte/chamado', {
          method: 'POST',
          body: {
            usuario:       supUsuario.value,
            nome:          supNome.value,
            email:         supEmail.value,
            telefone:      supTelefone.value,
            whatsapp:      supWhatsApp.checked,
            canalContato:  supCanal.value,
            horarioContato:supHorario.value,
            localProblema: supLocal.value,
            nivelProblema: supNivel.value,
            descricao:     supDescricao.value,
            protocolo,
          },
        });

        alert(`✅ Chamado enviado com sucesso!\n\nProtocolo: ${protocolo}\n\nGuarde este número para acompanhamento.`);
        zerarForm();
        fecharAccordion();
      } catch (error) {
        mostrarMensagem(error.message || 'Erro ao enviar o chamado. Tente novamente.', 'error');
      } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar Chamado';
      }
    });
  }

  // #endregion


  // #region MEUS CHAMADOS | rev.02 | 25/03/2026

  // --- elementos do histórico
  const listaChamados        = document.getElementById('listaChamados');
  const btnConsultarChamados = document.getElementById('btnConsultarChamados');
  const btnPdfChamados       = document.getElementById('btnPdfChamados');
  const supDataInicial       = document.getElementById('supDataInicial');
  const supDataFinal         = document.getElementById('supDataFinal');

  let chamadosCarregados = [];

  // --- formatar data
  function formatarData(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR');
  }

  // --- renderizar estrelas
  function renderStars(chamadoId, qualidadeAtual) {
    return [1, 2, 3, 4, 5].map((n) => {
      const preenchida = qualidadeAtual && n <= qualidadeAtual;
      return `<span class="estrela" data-id="${chamadoId}" data-val="${n}" style="cursor:pointer;font-size:18px;color:${preenchida ? '#f5a623' : '#ccc'};">★</span>`;
    }).join('');
  }

  // --- renderizar lista de chamados
  function renderizarChamados(lista) {
    if (!listaChamados) return;

    if (lista.length === 0) {
      listaChamados.innerHTML = '<p class="tabela-vazia">Nenhum chamado encontrado.</p>';
      return;
    }

    const linhas = lista.map((c) => `
      <div class="vei-lista-row" data-chamado-id="${c.ChamadoId}" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #eee;">
        <span style="flex:1;">
          <strong>${c.Protocolo}</strong> |
          Data: <strong>${formatarData(c.DataEnvio)}</strong> |
          Local: <strong>${c.LocalProblema}</strong> |
          Nível: <strong>${c.NivelProblema}</strong>
        </span>
        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;">
          <input
            type="checkbox"
            class="chk-resolvido"
            data-id="${c.ChamadoId}"
            ${c.Resolvido ? 'checked' : ''}
            style="width:16px;height:16px;cursor:pointer;"
          />
          Resolvido
        </label>
        <span class="bloco-estrelas" style="display:flex;align-items:center;gap:2px;">
          ${renderStars(c.ChamadoId, c.Qualidade)}
        </span>
      </div>
    `).join('');

    listaChamados.innerHTML = `<div class="vei-resultado-card" style="padding:0 4px;">${linhas}</div>`;

    // Listeners checkbox resolvido
    listaChamados.querySelectorAll('.chk-resolvido').forEach((chk) => {
      chk.addEventListener('change', async () => {
        const id = chk.dataset.id;
        try {
          await apiRequest(`/suporte/chamados/${id}/resolvido`, {
            method: 'PATCH',
            body: { resolvido: chk.checked },
          });
        } catch {
          chk.checked = !chk.checked; // reverte se falhar
        }
      });
    });

    // Listeners estrelas qualidade
    listaChamados.querySelectorAll('.estrela').forEach((estrela) => {
      estrela.addEventListener('click', async () => {
        const id  = estrela.dataset.id;
        const val = Number(estrela.dataset.val);

        // Atualiza visual imediatamente
        const bloco = estrela.closest('.bloco-estrelas');
        bloco.querySelectorAll('.estrela').forEach((e) => {
          e.style.color = Number(e.dataset.val) <= val ? '#f5a623' : '#ccc';
        });

        try {
          await apiRequest(`/suporte/chamados/${id}/qualidade`, {
            method: 'PATCH',
            body: { qualidade: val },
          });
        } catch {
          // falha silenciosa — visual já foi atualizado
        }
      });
    });
  }

  // --- consultar chamados
  async function consultarChamados() {
    if (!listaChamados) return;

    const sessionData = sessionStorage.getItem('usuario');
    if (!sessionData) return;
    const { usuario } = JSON.parse(sessionData);
    const login = usuario.Login || '';

    listaChamados.innerHTML = '<p class="tabela-vazia">Carregando...</p>';

    const params = new URLSearchParams({ usuario: login });
    if (supDataInicial && supDataInicial.value) params.append('dataInicial', supDataInicial.value);
    if (supDataFinal   && supDataFinal.value)   params.append('dataFinal',   supDataFinal.value);

    try {
      chamadosCarregados = await apiRequest(`/suporte/chamados?${params.toString()}`);
      renderizarChamados(chamadosCarregados);
    } catch (error) {
      listaChamados.innerHTML = '<p class="tabela-vazia">Erro ao carregar chamados.</p>';
    }
  }

  if (btnConsultarChamados) {
    btnConsultarChamados.addEventListener('click', (e) => {
      e.stopPropagation();
      // Abre o accordion se estiver fechado
      const accHistorico = document.getElementById('acc-suporte-historico');
      if (accHistorico && !accHistorico.classList.contains('open')) {
        accHistorico.classList.add('open');
      }
      consultarChamados();
    });
  }

  // --- fechar accordion histórico: limpa lista
  const accHistorico = document.getElementById('acc-suporte-historico');
  if (accHistorico) {
    const headerHistorico = accHistorico.querySelector('.acc-header');
    if (headerHistorico) {
      headerHistorico.addEventListener('click', () => {
        // Limpa sempre ao clicar no header (abrindo ou fechando)
        // Se estava fechado e vai abrir, a lista já estava vazia — sem impacto
        chamadosCarregados = [];
        if (listaChamados) {
          listaChamados.innerHTML = '<p class="tabela-vazia">Clique em Consultar para carregar.</p>';
        }
        if (supDataInicial) supDataInicial.value = '';
        if (supDataFinal)   supDataFinal.value   = '';
      });
    }
  }

  // --- exportar PDF
  if (btnPdfChamados) {
    btnPdfChamados.addEventListener('click', (e) => {
      e.stopPropagation();

      if (chamadosCarregados.length === 0) {
        alert('Nenhum chamado para exportar. Clique em Consultar primeiro.');
        return;
      }

      const linhas = chamadosCarregados.map((c) => `
        <tr>
          <td>${c.Protocolo}</td>
          <td>${formatarData(c.DataEnvio)}</td>
          <td>${c.LocalProblema}</td>
          <td>${c.NivelProblema}</td>
          <td>${c.Resolvido ? 'Sim' : 'Não'}</td>
          <td>${c.Qualidade ? '★'.repeat(c.Qualidade) + '☆'.repeat(5 - c.Qualidade) : '—'}</td>
        </tr>
      `).join('');

      const html = `
        <html><head><title>Meus Chamados</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; font-size: 13px; }
          th { background: #f0f0f0; }
        </style></head>
        <body>
          <h2>Meus Chamados de Suporte</h2>
          <table>
            <thead>
              <tr>
                <th>Protocolo</th><th>Data</th><th>Local</th><th>Nível</th><th>Resolvido</th><th>Qualidade</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </body></html>
      `;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const janela = window.open(url, '_blank');
      janela.addEventListener('load', () => {
        janela.print();
        URL.revokeObjectURL(url);
      });
    });
  }

  // #endregion


});
