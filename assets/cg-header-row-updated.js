/*
  Dieses Skript ergänzt den geänderten Header um die notwendigen interaktiven Funktionen.
  Es setzt die dynamischen Polster links und rechts anhand der tatsächlichen Breite des
  Logo‑Clusters und der Icon‑Gruppe und bindet einen Klick‑Handler für die Such‑Icon
  ein, damit die Suche weiterhin funktioniert. So bleiben Mouse‑over‑ bzw. Hover‑
  Funktionen des restlichen Themes unberührt, da diese im vorhandenen main.js
  implementiert sind.
*/

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('store-header.header');
  if (!header) return;

  const logoCluster = header.querySelector('.header__logo');
  const iconsCluster = header.querySelector('.header__icons');

  // Stelle sicher, dass der Such‑Container die erwarteten Klassen/IDs besitzt.
  // Einige Theme‑Einstellungen (z.B. wenn "Minimise search" deaktiviert ist) fügen
  // die Klasse `.js-search-bar` und die ID `search-bar` nicht automatisch hinzu.
  // Ohne diese Angaben kann das Skript in main.js die Suche nicht ein- oder ausblenden.
  const searchContainer = header.querySelector('.header__search');
  if (searchContainer) {
    // Füge js-search-bar hinzu, falls nicht vorhanden
    if (!searchContainer.classList.contains('js-search-bar')) {
      searchContainer.classList.add('js-search-bar');
    }
    // Setze die ID auf "search-bar", falls nicht vorhanden
    if (!searchContainer.id) {
      searchContainer.id = 'search-bar';
    }
  }

  // Dynamische Berechnung der benötigten Polster. Dies stellt sicher, dass das
  // Navigationsmenü exakt in der Mitte bleibt, selbst wenn das Logo oder die Icons
  // unterschiedliche Breiten haben.
  function updateSpacing() {
    if (!logoCluster || !iconsCluster) return;
    const edgeValue = parseFloat(getComputedStyle(header).getPropertyValue('--cg-header-edge')) || 0;
    header.style.setProperty('--cg-pad-left', `${logoCluster.offsetWidth + edgeValue}px`);
    header.style.setProperty('--cg-pad-right', `${iconsCluster.offsetWidth + edgeValue}px`);
  }

  // Erste Ausführung nach dem Laden der Seite.
  updateSpacing();

  // Aktualisieren bei Fenstergrößenänderung. Ein kleines Debounce verhindert
  // übermäßige Berechnungen bei schnellem Resizing.
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSpacing, 100);
  });

  /*
    Hinweis: Der Klick‑Handler für die Such‑Icons wird weiterhin durch das
    im Originaltheme enthaltene Skript gesteuert (handleSearchToggleClick in
    main.js). In dieser Datei kümmern wir uns ausschließlich um die
    dynamische Berechnung der seitlichen Polster, um das Navigationsmenü
    zentriert zwischen Logo und Icon‑Cluster zu halten. Auf diese Weise
    bleibt die ursprüngliche Suchfunktionalität unverändert erhalten.
  */
});