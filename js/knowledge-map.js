(function () {
  'use strict';

  const CYTOSCAPE_URL = 'https://cdn.jsdelivr.net/npm/cytoscape@3.31.2/dist/cytoscape.min.js';
  let loader;

  const nodes = [
    ['root', '博士科研知识地图', 'root', '知识入口', null],
    ['thermo', '大气热力学', 'thermo topic', '温度、水汽、能量与绝热过程', null],
    ['dynamics', '大气动力学', 'dynamics topic', '风场、旋转与动力结构', null],
    ['cyclone', '热带气旋', 'cyclone topic', '热带气旋的生成、结构与强度', null],
    ['ocean', '海气相互作用', 'ocean topic', '海洋与大气之间的耦合过程', null],
    ['method', '研究方法', 'method topic', '统计分析与诊断方法', null],

    ['laws', '热力学定律', 'thermo branch', '热力学基本定律', '/research/meteorology/thermodynamic-laws/'],
    ['temperature', '温度与位温', 'thermo branch', '气块热力状态及其保守量', '/research/meteorology/adiabatic-process/#位温'],
    ['humidity', '水汽与湿度', 'thermo branch', '描述空气水汽含量的变量', '/research/meteorology/humidity/'],
    ['adiabatic', '绝热过程', 'thermo branch', '系统与外界没有热量交换的过程', '/research/meteorology/adiabatic-process/'],
    ['law1', '热力学第一定律', 'thermo', '能量守恒在热力过程中的表达', '/research/meteorology/thermodynamic-laws/#热力学第一定律'],
    ['law2', '热力学第二定律', 'thermo', '热力过程的方向性与熵', '/research/meteorology/thermodynamic-laws/#热力学第二定律'],
    ['law3', '热力学第三定律', 'thermo', '绝对零度与熵的极限性质', '/research/meteorology/thermodynamic-laws/#热力学第三定律'],
    ['theta', '位温', 'thermo', '气块干绝热移动到 1000 hPa 时的温度', '/research/meteorology/adiabatic-process/#位温'],
    ['specific-humidity', '比湿', 'thermo', '水汽质量与湿空气总质量之比', '/research/meteorology/humidity/#比湿'],
    ['mixing-ratio', '水汽混合比', 'thermo', '水汽质量与干空气质量之比', '/research/meteorology/humidity/#水汽混合比'],
    ['relative-humidity', '相对湿度', 'thermo', '实际水汽状态相对于饱和状态的程度', '/research/meteorology/humidity/#相对湿度'],
    ['dry-adiabatic', '干绝热过程', 'thermo', '未饱和气块的绝热升降过程', '/research/meteorology/adiabatic-process/#干绝热过程'],
    ['moist-adiabatic', '湿绝热过程', 'thermo', '饱和气块伴随凝结潜热释放的绝热过程', '/research/meteorology/adiabatic-process/#湿绝热过程'],
    ['moist-neutral', '湿中性绝热', 'thermo', '热带气旋理论中的湿中性状态', '/research/meteorology/adiabatic-process/#湿中性绝热'],

    ['streamfunction', '流函数', 'dynamics', '描述二维无辐散风场的旋转部分', '/research/meteorology/flow-functions/#流函数'],
    ['velocity-potential', '速度势', 'dynamics', '描述风场辐散部分的标量势函数', '/research/meteorology/flow-functions/#速度势'],
    ['angular-momentum', '绝对角动量', 'dynamics', '包含相对旋转与行星旋转贡献的角动量', '/research/tropical-cyclone/dynamics/#绝对角动量'],
    ['inertial-stability', '惯性稳定度', 'dynamics', '旋转系统抵抗径向位移的能力', '/research/tropical-cyclone/dynamics/#惯性稳定度'],

    ['intensity', '强度理论', 'cyclone branch', '热带气旋潜在强度理论', '/research/tropical-cyclone/potential-intensity/'],
    ['genesis', '生成指标', 'cyclone branch', '衡量环境有利于热带气旋生成的指标', '/research/tropical-cyclone/indices/#DGPI'],
    ['activity', '活动与破坏性', 'cyclone branch', '综合描述强度、频数与持续时间', '/research/tropical-cyclone/indices/#PDI'],
    ['pi', 'PI / MPI', 'cyclone', '热带气旋潜在强度或最大潜在强度', '/research/tropical-cyclone/potential-intensity/#PI-与-MPI'],
    ['dpi', 'DPI', 'cyclone', '考虑台风引起海洋混合后的动态潜在强度', '/research/tropical-cyclone/potential-intensity/#DPI'],
    ['dgpi', 'DGPI', 'cyclone', '动力生成潜势指数', '/research/tropical-cyclone/indices/#DGPI'],
    ['pdi', 'PDI', 'cyclone', '功率耗散指数', '/research/tropical-cyclone/indices/#PDI'],

    ['pmm', 'PMM 太平洋经向模态', 'ocean', '热带及副热带太平洋的重要海气耦合模态', '/research/air-sea-interaction/pmm/'],

    ['correlation', '相关分析', 'method branch', '衡量变量共同变化关系的方法', null],
    ['simultaneous', '同期相关', 'method draft', '比较同一时间变量之间的相关关系', null],
    ['lagged', '超前—滞后相关', 'method draft', '比较不同时间偏移下的相关关系', null],
    ['regression', '回归与解释方差', 'method', '用模型解释变量变化及其方差比例', '/research/statistics/correlation-and-r-squared/'],
    ['bispectrum', '双谱分析', 'method draft', '分析不同频率分量之间非线性耦合的方法', null]
  ];

  const edges = [
    ['root', 'thermo'], ['root', 'dynamics'], ['root', 'cyclone'], ['root', 'ocean'], ['root', 'method'],
    ['thermo', 'laws'], ['thermo', 'temperature'], ['thermo', 'humidity'], ['thermo', 'adiabatic'],
    ['laws', 'law1'], ['laws', 'law2'], ['laws', 'law3'], ['temperature', 'theta'],
    ['humidity', 'specific-humidity'], ['humidity', 'mixing-ratio'], ['humidity', 'relative-humidity'],
    ['adiabatic', 'dry-adiabatic'], ['adiabatic', 'moist-adiabatic'], ['adiabatic', 'moist-neutral'],
    ['dynamics', 'streamfunction'], ['dynamics', 'velocity-potential'], ['dynamics', 'angular-momentum'], ['dynamics', 'inertial-stability'],
    ['cyclone', 'intensity'], ['cyclone', 'genesis'], ['cyclone', 'activity'],
    ['intensity', 'pi'], ['intensity', 'dpi'], ['genesis', 'dgpi'], ['activity', 'pdi'],
    ['ocean', 'pmm'],
    ['method', 'correlation'], ['correlation', 'simultaneous'], ['correlation', 'lagged'], ['method', 'regression'], ['method', 'bispectrum'],
    ['humidity', 'moist-adiabatic', 'influences'], ['streamfunction', 'velocity-potential', 'contrast'],
    ['angular-momentum', 'inertial-stability', 'influences'], ['pi', 'dpi', 'influences'], ['ocean', 'dpi', 'influences'],
    ['pmm', 'cyclone', 'influences'], ['correlation', 'regression', 'contrast']
  ];

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

    loadCytoscape().then(function (cytoscape) {
      if (!document.body.contains(container)) return;
      const elements = [];
      nodes.forEach(function (node) {
        elements.push({ data: { id: node[0], label: node[1], description: node[3], url: node[4] }, classes: node[2] });
      });
      edges.forEach(function (edge, index) {
        elements.push({ data: { id: 'e' + index, source: edge[0], target: edge[1] }, classes: edge[2] ? 'relation ' + edge[2] : 'taxonomy' });
      });

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
          { selector: 'edge.relation', style: { 'line-style': 'dashed', 'target-arrow-shape': 'triangle', 'width': 1.4, 'opacity': .48 } },
          { selector: 'edge.influences', style: { 'line-color': '#c67eb5', 'target-arrow-color': '#c67eb5' } },
          { selector: 'edge.contrast', style: { 'line-color': '#6d9fc5', 'target-arrow-color': '#6d9fc5' } },
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
