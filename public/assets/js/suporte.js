// suporte.js | data: 24/03/2026

// ===============================
// suporte.js
// Módulo Suporte — Abrir Chamado
// Depende de: config.js, auth.js
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  /* ===========================
    ELEMENTOS
  =========================== */
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

  /* ===========================
    PREENCHER USUÁRIO E NOME DA SESSÃO
    Sempre bloqueados — nunca apagados
  =========================== */
  function preencherSessao() {
    const sessionData = sessionStorage.getItem('usuario');
    if (!sessionData) return;
    const { usuario } = JSON.parse(sessionData);
    if (supUsuario) supUsuario.value = usuario.Login        || '';
    if (supNome)    supNome.value    = usuario.NomeCompleto || usuario.Login || '';
  }

  preencherSessao();

  /* ===========================
    MÁSCARA TELEFONE
    (11) 99999-0000
  =========================== */
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

  /* ===========================
    ZERAR CAMPOS EDITÁVEIS
    Nunca apaga Usuário e Nome
  =========================== */
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

  /* ===========================
    FECHAR ACCORDION + ZERAR
  =========================== */
  function fecharAccordion() {
    if (accItem && accItem.classList.contains('open')) {
      accItem.classList.remove('open');
    }
    zerarForm();
  }

  /* ===========================
    BOTÃO CANCELAR
  =========================== */
  if (btnCancelar) {
    btnCancelar.addEventListener('click', fecharAccordion);
  }

  /* ===========================
    FECHAR ACCORDION PELA SETA — zera ao fechar
    Sobrescreve o listener genérico do dashboard.js
    apenas para reagir ao fechamento
  =========================== */
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

  /* ===========================
    SAIR DA SEÇÃO SUPORTE — fecha e zera
    Observa cliques nos itens de navegação
  =========================== */
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (item.dataset.section !== 'suporte') {
        fecharAccordion();
      }
    });
  });

  /* ===========================
    VALIDAÇÃO
  =========================== */
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

  /* ===========================
    MENSAGEM DE FEEDBACK
  =========================== */
  function mostrarMensagem(texto, tipo) {
    if (!supMensagem) return;
    supMensagem.textContent   = texto;
    supMensagem.className     = `form-mensagem ${tipo}`;
    supMensagem.style.display = 'block';
  }

  /* ===========================
    GERAR PROTOCOLO ALEATÓRIO
    Formato: SUP-YYYYMMDD-XXXXX
  =========================== */
  function gerarProtocolo() {
    const hoje = new Date();
    const data = hoje.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `SUP-${data}-${rand}`;
  }

  /* ===========================
    SUBMIT — ENVIAR CHAMADO
  =========================== */
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
});
