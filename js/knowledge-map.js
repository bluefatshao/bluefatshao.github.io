(function () {
  'use strict';

  const CYTOSCAPE_URL = 'https://cdn.jsdelivr.net/npm/cytoscape@3.31.2/dist/cytoscape.min.js';
  let loader;
  let dataLoader;

  function loadMapData() {
    if (dataLoader) return dataLoader;
    dataLoader = fetch('/knowledge-map/data.json', { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) throw new Error('知识地图配置加载失败');
      return response.json();
    });
    return dataLoader;
  }

  function buildElements(config) {
    const elements = [];
    const idsByName = Object.create(null);
    let nodeIndex = 0;

    const center = config['中心'] || {};
    elements.push({
      data: {
        id: 'root',
        label: center['名称'] || '知识地图',
        description: center['简介'] || '知识入口',
        url: null
      },
      classes: 'root'
    });
    idsByName[center['名称'] || '知识地图'] = 'root';

    function addNode(item, parentId, color, depth) {
      const name = item['名称'];
      if (!name) return;

      nodeIndex += 1;
      const id = 'knowledge-' + nodeIndex;
      const children = Array.isArray(item['子知识']) ? item['子知识'] : [];
      const nodeColor = item['颜色'] || color || '';
      const classes = [nodeColor];

      if (depth === 0) classes.push('topic');
      else if (children.length) classes.push('branch');
      else if (!item['文章']) classes.push('draft');

      elements.push({
        data: {
          id: id,
          label: name,
          description: item['简介'] || '简介待补充',
          url: item['文章'] || null
        },
        classes: classes.join(' ')
      });
      elements.push({ data: { id: 'tree-' + id, source: parentId, target: id }, classes: 'taxonomy' });
      idsByName[name] = id;

      children.forEach(function (child) {
        addNode(child, id, nodeColor, depth + 1);
      });
    }

    (config['知识树'] || []).forEach(function (item) {
      addNode(item, 'root', item['颜色'], 0);
    });

    const relationClasses = { '影响': 'influences', '对比': 'contrast' };
    (config['关联'] || []).forEach(function (relation, index) {
      const source = idsByName[relation['起点']];
      const target = idsByName[relation['终点']];
      if (!source || !target) return;
      elements.push({
        data: {
          id: 'relation-' + index,
          source: source,
          target: target,
          label: relation['类型'] || '关联'
        },
        classes: 'relation ' + (relationClasses[relation['类型']] || '')
      });
    });

    return elements;
  }

  function loadCytoscape() {
    if (window.cytoscape) return Promise.resolve(window.cytoscape);
    if (loader) return loader;
    loader = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = CYTOSCAPE_URL;
      script.async = true;
      script.onload = function () { resolve(window.cytoscape); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return loader;
  }

  function addStyles() {
    if (document.getElementById('knowledge-map-styles')) return;
    const style = document.createElement('style');
    style.id = 'knowledge-map-styles';
    style.textContent = [
      '.knowledge-map-shell{margin:1.25rem 0 2rem;border:1px solid var(--block-border,#e5e7eb);border-radius:18px;overflow:hidden;background:var(--card,#fff);box-shadow:0 12px 36px rgba(0,0,0,.08)}',
      '.knowledge-map-toolbar{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;padding:14px;border-bottom:1px solid var(--block-border,#e5e7eb);background:var(--block,rgba(128,128,128,.05))}',
      '.knowledge-map-search{display:grid;gap:5px;flex:1;max-width:390px;font-size:.78rem;color:var(--text-p2,#666)}',
      '.knowledge-map-search input{box-sizing:border-box;width:100%;padding:9px 12px;border:1px solid var(--block-border,#d7dce2);border-radius:10px;background:var(--card,#fff);color:var(--text-p0,#222);font:inherit;outline:none}',
      '.knowledge-map-search input:focus{border-color:#9b72cf;box-shadow:0 0 0 3px rgba(155,114,207,.14)}',
      '.knowledge-map-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}',
      '.knowledge-map-actions button{min-width:38px;padding:8px 11px;border:1px solid var(--block-border,#d7dce2);border-radius:9px;background:var(--card,#fff);color:var(--text-p1,#444);font:inherit;cursor:pointer}',
      '.knowledge-map-actions button:hover{border-color:#9b72cf;color:#8a55c5}',
      '#knowledge-map-graph{height:min(70vh,720px);min-height:520px;background:radial-gradient(circle at center,rgba(155,114,207,.07),transparent 62%);touch-action:none}',
      '.knowledge-map-info{display:flex;gap:10px;align-items:baseline;padding:12px 16px;border-top:1px solid var(--block-border,#e5e7eb);color:var(--text-p1,#444)}',
      '.knowledge-map-info span{color:var(--text-p2,#777)}',
      '.knowledge-map-info a{margin-left:auto;white-space:nowrap}',
      '.knowledge-map-legend{display:flex;gap:12px 18px;flex-wrap:wrap;padding:0 16px 14px;color:var(--text-p2,#777);font-size:.78rem}',
      '.knowledge-map-legend span{display:flex;align-items:center;gap:6px}',
      '.knowledge-map-legend i{width:11px;height:11px;border-radius:50%;background:#ddd}',
      '.knowledge-map-legend .is-thermo{background:#ef8e8e}.knowledge-map-legend .is-dynamics{background:#69aee8}.knowledge-map-legend .is-cyclone{background:#b57bd3}.knowledge-map-legend .is-ocean{background:#67bc7b}.knowledge-map-legend .is-method{background:#e3b448}',
      '.knowledge-map-legend .is-draft{box-sizing:border-box;background:transparent;border:2px dashed #9aa1aa}',
      '.knowledge-map-legend .is-influence,.knowledge-map-legend .is-contrast{width:22px;height:0;border-radius:0;background:transparent}',
      '.knowledge-map-legend .is-influence{border-top:3px solid #c2559e}',
      '.knowledge-map-legend .is-contrast{border-top:2px dashed #377eae}',
      '@media(max-width:667px){.knowledge-map-toolbar{align-items:stretch;flex-direction:column}.knowledge-map-search{max-width:none}.knowledge-map-actions{justify-content:flex-start}#knowledge-map-graph{height:65vh;min-height:460px}.knowledge-map-info{align-items:flex-start;flex-direction:column}.knowledge-map-info a{margin-left:0}}'
    ].join('');
    document.head.appendChild(style);
  }

  function layoutOptions(animate) {
    return {
      name: 'cose',
      animate: animate,
      animationDuration: 650,
      fit: true,
      padding: 55,
      randomize: true,
      componentSpacing: 80,
      nodeRepulsion: function () { return 9500; },
      idealEdgeLength: function (edge) { return edge.hasClass('relation') ? 125 : 82; },
      edgeElasticity: function (edge) { return edge.hasClass('relation') ? 60 : 100; },
      nestingFactor: 1.15,
      gravity: 0.3,
      numIter: 1300
    };
  }

  function mount() {
    const container = document.getElementById('knowledge-map-graph');
    if (!container || container.dataset.mounted === 'true') return;
    container.dataset.mounted = 'true';
    addStyles();

    Promise.all([loadCytoscape(), loadMapData()]).then(function (results) {
      if (!document.body.contains(container)) return;
      const cytoscape = results[0];
      const elements = buildElements(results[1]);

      const cy = cytoscape({
        container: container,
        elements: elements,
        minZoom: 0.22,
        maxZoom: 2.8,
        wheelSensitivity: 0.18,
        boxSelectionEnabled: false,
        layout: layoutOptions(false),
        style: [
          { selector: 'node', style: { 'label': 'data(label)', 'font-family': 'system-ui, sans-serif', 'font-size': 11, 'font-weight': 600, 'text-wrap': 'wrap', 'text-max-width': 88, 'text-valign': 'center', 'text-halign': 'center', 'color': '#25303b', 'background-color': '#dfe5eb', 'border-width': 2, 'border-color': '#aab4bf', 'width': 42, 'height': 42, 'padding': 4, 'overlay-opacity': 0 } },
          { selector: 'node.topic', style: { 'shape': 'round-rectangle', 'width': 92, 'height': 38, 'font-size': 12, 'text-max-width': 84, 'border-width': 2.5 } },
          { selector: 'node.branch', style: { 'shape': 'round-rectangle', 'width': 80, 'height': 34, 'font-size': 10.5 } },
          { selector: 'node.root', style: { 'shape': 'round-rectangle', 'width': 132, 'height': 48, 'font-size': 14, 'font-weight': 700, 'background-color': '#fafafa', 'border-color': '#4f5964', 'border-width': 3 } },
          { selector: 'node.thermo', style: { 'background-color': '#ffd9d6', 'border-color': '#ef8e8e' } },
          { selector: 'node.dynamics', style: { 'background-color': '#d7ebfb', 'border-color': '#69aee8' } },
          { selector: 'node.cyclone', style: { 'background-color': '#ecdaf5', 'border-color': '#b57bd3' } },
          { selector: 'node.ocean', style: { 'background-color': '#dbf1df', 'border-color': '#67bc7b' } },
          { selector: 'node.method', style: { 'background-color': '#fff0bf', 'border-color': '#e3b448' } },
          { selector: 'node.draft', style: { 'border-style': 'dashed', 'background-opacity': .72 } },
          { selector: 'node:selected, node.search-match', style: { 'border-color': '#ff5f8f', 'border-width': 5, 'shadow-blur': 18, 'shadow-color': '#ff5f8f', 'shadow-opacity': .35 } },
          { selector: 'node.search-dim', style: { 'opacity': .16 } },
          { selector: 'edge', style: { 'width': 1.8, 'curve-style': 'bezier', 'line-color': '#a9b0b8', 'target-arrow-color': '#a9b0b8', 'target-arrow-shape': 'none', 'opacity': .75 } },
          { selector: 'edge.relation', style: { 'label': 'data(label)', 'font-size': 8, 'font-weight': 700, 'color': '#59636e', 'text-background-color': '#ffffff', 'text-background-opacity': .9, 'text-background-padding': 3, 'text-background-shape': 'roundrectangle', 'width': 2.2, 'opacity': .88 } },
          { selector: 'edge.influences', style: { 'line-style': 'solid', 'line-color': '#c2559e', 'target-arrow-color': '#c2559e', 'target-arrow-shape': 'triangle' } },
          { selector: 'edge.contrast', style: { 'line-style': 'dashed', 'line-color': '#377eae', 'target-arrow-shape': 'none' } },
          { selector: 'edge.search-dim', style: { 'opacity': .06 } }
        ]
      });

      const info = document.getElementById('knowledge-map-info');
      cy.on('tap', 'node', function (event) {
        const node = event.target;
        const url = node.data('url');
        if (info) {
          info.innerHTML = '<strong>' + node.data('label') + '</strong><span>' + node.data('description') + '</span>' + (url ? '<a href="' + url + '">阅读文章 →</a>' : '<span>文章待整理</span>');
        }
        if (url) window.location.href = url;
      });

      const search = document.getElementById('knowledge-map-search');
      if (search) search.addEventListener('input', function () {
        const keyword = search.value.trim().toLowerCase();
        cy.elements().removeClass('search-match search-dim');
        if (!keyword) return;
        const matches = cy.nodes().filter(function (node) { return node.data('label').toLowerCase().includes(keyword); });
        cy.elements().addClass('search-dim');
        matches.forEach(function (node) {
          node.removeClass('search-dim').addClass('search-match');
          node.connectedEdges().removeClass('search-dim');
          node.neighborhood('node').removeClass('search-dim');
        });
        if (matches.length) cy.animate({ fit: { eles: matches.union(matches.neighborhood()), padding: 100 }, duration: 350 });
      });

      const zoomIn = document.getElementById('knowledge-map-zoom-in');
      const zoomOut = document.getElementById('knowledge-map-zoom-out');
      const fit = document.getElementById('knowledge-map-fit');
      const reset = document.getElementById('knowledge-map-reset');
      if (zoomIn) zoomIn.onclick = function () { cy.zoom({ level: Math.min(cy.maxZoom(), cy.zoom() * 1.22), renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } }); };
      if (zoomOut) zoomOut.onclick = function () { cy.zoom({ level: Math.max(cy.minZoom(), cy.zoom() / 1.22), renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } }); };
      if (fit) fit.onclick = function () { cy.animate({ fit: { eles: cy.elements(), padding: 55 }, duration: 350 }); };
      if (reset) reset.onclick = function () { cy.layout(layoutOptions(true)).run(); };
    }).catch(function () {
      container.innerHTML = '<p style="padding:2rem;text-align:center">知识地图组件加载失败，请检查网络连接后刷新页面。</p>';
    });
  }

  mount();
  const observer = new MutationObserver(mount);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
