// public/assets/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  /* ===========================
    EXIBIR NOME DO USUÁRIO
    Lê sessão gravada pelo login.js
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
    TOGGLE SIDEBAR
    Expande e recolhe o menu lateral
  =========================== */
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleSidebar');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
  });

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
    });
  });
});
