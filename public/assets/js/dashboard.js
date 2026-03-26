// -----------------------------------------------
// dashboard.js
// Tema: Controle geral do dashboard Re⟳Loop
// Última rev: 01 | Data: 25/03/2026
// Depende de: config.js, auth.js
// -----------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  // #region USUÁRIO | rev.01 | 25/03/2026

  // --- exibe nome do usuário logado no header
  const sessionData = sessionStorage.getItem('usuario');
  if (sessionData) {
    const { usuario } = JSON.parse(sessionData);
    const nomeEl = document.getElementById('nomeUsuario');
    if (nomeEl) {
      nomeEl.textContent = usuario.NomeCompleto || usuario.Login || 'Usuário';
    }
  }

  // #endregion


  // #region INDICADORES | rev.01 | 25/03/2026

  // --- dados fixos — serão conectados à API na AC4
  document.getElementById('totalFrota').textContent              = '0';
  document.getElementById('totalSemRelacionamento').textContent  = '0';
  document.getElementById('totalComRelacionamento').textContent  = '0';

  // #endregion


  // #region NAVEGAÇÃO | rev.01 | 25/03/2026

  // --- cada .nav-item tem data-section indicando qual section exibir
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const target = item.dataset.section;

      // --- remove active de todos, ativa o clicado
      navItems.forEach((n) => n.classList.remove('active'));
      sections.forEach((s) => s.classList.remove('active'));

      item.classList.add('active');

      const targetSection = document.getElementById('sec-' + target);
      if (targetSection) targetSection.classList.add('active');

      // --- mobile: fecha sidebar ao navegar
      if (window.innerWidth <= 768) fecharSidebarMobile();
    });
  });

  // #endregion


  // #region SIDEBAR | rev.01 | 25/03/2026

  const sidebar = document.getElementById('sidebar');
  const setaBtn = document.getElementById('toggleSidebar');

  // --- seta lateral web — recolhe/expande
  if (setaBtn) {
    setaBtn.addEventListener('click', () => {
      sidebar.classList.toggle('expanded');
      setaBtn.textContent = sidebar.classList.contains('expanded') ? '‹' : '›';
    });
  }


  // --- hambúrguer mobile
  const toggleMobile = document.getElementById('toggleMobile');
  const overlay      = document.getElementById('sidebarOverlay');

  if (toggleMobile) {
    toggleMobile.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => fecharSidebarMobile());
  }

  function fecharSidebarMobile() {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  }

  // #endregion


  // #region BLOCOS COLAPSÁVEIS | rev.01 | 25/03/2026

  // --- blocos de gráficos da seção home (LVT, Retenção por Ano, por Modelo)
  document.querySelectorAll('.dash-bloco-header').forEach((header) => {
    header.addEventListener('click', () => {
      const bloco = header.closest('.dash-bloco');
      if (bloco) bloco.classList.toggle('aberto');
    });
  });

  // #endregion


  // #region ACCORDION SUPORTE | rev.01 | 25/03/2026

  // --- abre/fecha painéis do módulo Suporte
  document.querySelectorAll('#accordion-suporte .acc-header').forEach((header) => {
    header.addEventListener('click', () => {
      const item = document.getElementById(header.dataset.target);
      if (item) item.classList.toggle('open');
    });
  });

  // #endregion

});
