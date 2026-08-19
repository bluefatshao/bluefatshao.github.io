(function () {
  'use strict';

  if (window.bluefatMusicMounted) return;

  function mountGlobalMusic() {
    const config = window.bluefatMusicConfig || {};
    const panel = document.createElement('section');
    panel.id = 'bluefat-global-music';
    panel.setAttribute('aria-label', config.title || 'Claire 的歌单');
    panel.innerHTML = '<div class="music-title"></div><div class="music-body"></div>';
    panel.querySelector('.music-title').textContent = config.title || 'Claire 的歌单';

    const player = document.createElement('meting-js');
    const options = {
      server: config.server || 'netease',
      type: config.type || 'playlist',
      id: config.id || '',
      fixed: 'false',
      mini: 'false',
      autoplay: 'false',
      loop: 'all',
      order: 'random',
      preload: 'metadata',
      volume: '0.4',
      mutex: 'false',
      'list-folded': 'true',
      'list-max-height': '240px',
      theme: '#CC95C0'
    };
    Object.keys(options).forEach(function (name) {
      player.setAttribute(name, options[name]);
    });
    panel.querySelector('.music-body').appendChild(player);
    document.body.appendChild(panel);

    const style = document.createElement('style');
    style.id = 'bluefat-global-music-style';
    style.textContent = [
      '#bluefat-global-music{position:fixed;right:20px;bottom:20px;width:280px;z-index:20;padding:12px;border-radius:16px;background:var(--card,#fff);box-shadow:0 8px 30px rgba(0,0,0,.12)}',
      '#bluefat-global-music .music-title{padding:0 4px 10px;font-size:13px;font-weight:600;color:var(--text-p1,#555)}',
      '#bluefat-global-music .aplayer{margin:0;box-shadow:none;background:transparent}',
      '.booklist-toggle{display:block;width:100%;margin:12px 0;padding:9px 12px;border:0;border-radius:10px;background:var(--block,rgba(128,128,128,.08));color:var(--text-p1,#555);font:inherit;font-weight:600;cursor:pointer;transition:background .2s ease,color .2s ease}',
      '.booklist-toggle:hover{background:rgba(204,149,192,.18);color:#a35b91}',
      '@media(max-width:667px){#bluefat-global-music{right:8px;bottom:72px;left:8px;width:auto}}'
    ].join('');
    document.head.appendChild(style);
    window.bluefatMusicMounted = true;
  }

  function initBooklistToggle() {
    document.querySelectorAll('widget.markdown .widget-body').forEach(function (body) {
      if (body.querySelector('.booklist-toggle')) return;

      const entries = Array.from(body.querySelectorAll(':scope > p')).filter(function (entry) {
        return entry.querySelector('strong a[href*="book.douban.com/subject/"]');
      });
      const visibleCount = 20;
      if (entries.length <= visibleCount) return;

      const hiddenEntries = entries.slice(visibleCount);
      function setCollapsed(collapsed) {
        hiddenEntries.forEach(function (entry) {
          entry.hidden = collapsed;
          const divider = entry.nextElementSibling;
          if (divider && divider.tagName === 'HR') divider.hidden = collapsed;
        });
        button.setAttribute('aria-expanded', String(!collapsed));
        button.textContent = collapsed
          ? 'show more'
          : 'dismiss';
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booklist-toggle';

      const twentiethDivider = entries[visibleCount - 1].nextElementSibling;
      const anchor = twentiethDivider && twentiethDivider.tagName === 'HR'
        ? twentiethDivider
        : entries[visibleCount - 1];
      anchor.insertAdjacentElement('afterend', button);

      button.addEventListener('click', function () {
        setCollapsed(button.getAttribute('aria-expanded') === 'true');
      });
      setCollapsed(true);
    });
  }

  function stellarUtils() {
    try {
      return typeof utils !== 'undefined' ? utils : window.utils;
    } catch (error) {
      return window.utils;
    }
  }

  function syncLayoutAttributes(visit) {
    const nextBody = visit && visit.to && visit.to.document
      ? visit.to.document.querySelector('#start')
      : null;
    const currentBody = document.querySelector('#start');
    if (!nextBody || !currentBody) return;

    currentBody.className = nextBody.className;
    ['layout', 'type', 'text-indent'].forEach(function (name) {
      if (nextBody.hasAttribute(name)) {
        currentBody.setAttribute(name, nextBody.getAttribute(name));
      } else {
        currentBody.removeAttribute(name);
      }
    });
  }

  function reinitializeStellar() {
    if (window.stellar && typeof window.stellar.initPage === 'function') {
      window.stellar.initPage();
    }
    const helpers = stellarUtils();
    if (helpers && Array.isArray(helpers._pluginInitializers)) {
      helpers._pluginInitializers.forEach(function (plugin) {
        if (plugin && typeof plugin.fn === 'function') plugin.fn();
      });
    }
  }

  mountGlobalMusic();
  initBooklistToggle();

  if (typeof window.Swup !== 'function' || window.bluefatPjax) return;

  const swup = new window.Swup({
    containers: ['#l_cover', '.leftbar-container', '#main', '.l_right'],
    cache: true,
    linkToSelf: 'scroll',
    ignoreVisit: function (url, options) {
      const el = options && options.el;
      return el && el.closest('[data-no-swup], [download], a[target="_blank"]');
    }
  });

  swup.hooks.before('content:replace', function (visit) {
    const helpers = stellarUtils();
    if (helpers && typeof helpers.cleanupAll === 'function') helpers.cleanupAll();
    syncLayoutAttributes(visit);
  });

  swup.hooks.on('page:view', function () {
    reinitializeStellar();
    initBooklistToggle();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  window.bluefatPjax = swup;
})();
