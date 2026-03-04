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
