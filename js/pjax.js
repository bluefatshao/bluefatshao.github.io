(function () {
  'use strict';

  if (window.bluefatMusicMounted) return;

  function enableMusicDrag(panel) {
    const handle = panel.querySelector('.music-drag-handle');
    if (!handle) return;

    function clampToViewport() {
      const rect = panel.getBoundingClientRect();
      const left = Math.max(0, Math.min(rect.left, window.innerWidth - panel.offsetWidth));
      const top = Math.max(0, Math.min(rect.top, window.innerHeight - panel.offsetHeight));
      if (rect.left !== left || rect.top !== top) {
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
      }
    }

    try {
      const saved = JSON.parse(localStorage.getItem('bluefat-music-position'));
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
        panel.style.left = Math.max(0, Math.min(saved.left, window.innerWidth - panel.offsetWidth)) + 'px';
        panel.style.top = Math.max(0, Math.min(saved.top, window.innerHeight - panel.offsetHeight)) + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
      }
    } catch (error) {
      // The default bottom-right position is used when storage is unavailable.
    }

    window.setTimeout(clampToViewport, 1000);
    window.addEventListener('resize', clampToViewport);

    handle.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const startRect = panel.getBoundingClientRect();
      handle.setPointerCapture(event.pointerId);
      handle.classList.add('is-dragging');

      function move(moveEvent) {
        const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
        const left = Math.max(0, Math.min(startRect.left + moveEvent.clientX - startX, maxLeft));
        const top = Math.max(0, Math.min(startRect.top + moveEvent.clientY - startY, maxTop));
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
      }

      function stop() {
        handle.classList.remove('is-dragging');
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', stop);
        handle.removeEventListener('pointercancel', stop);
        const rect = panel.getBoundingClientRect();
        try {
          localStorage.setItem('bluefat-music-position', JSON.stringify({
            left: Math.round(rect.left),
            top: Math.round(rect.top)
          }));
        } catch (error) {
          // Dragging still works when storage is unavailable.
        }
      }

      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
    });
  }

  function mountGlobalMusic() {
    const config = window.bluefatMusicConfig || {};
    const panel = document.createElement('section');
    panel.id = 'bluefat-global-music';
    panel.setAttribute('aria-label', config.title || 'Claire 的歌单');
    panel.innerHTML = '<button class="music-drag-handle" type="button" aria-label="拖动音乐播放器" title="拖动播放器">⠿</button><div class="music-title"></div><div class="music-body"></div>';
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
    enableMusicDrag(panel);

    const style = document.createElement('style');
    style.id = 'bluefat-global-music-style';
    style.textContent = [
      '#bluefat-global-music{position:fixed;right:20px;bottom:20px;width:66px;z-index:20;padding:8px;border-radius:16px;background:var(--card,#fff);box-shadow:0 8px 30px rgba(0,0,0,.12)}',
      '#bluefat-global-music .music-title{display:none}',
      '#bluefat-global-music .music-body,#bluefat-global-music meting-js{display:block;width:66px;min-height:66px}',
      '#bluefat-global-music .aplayer{width:66px!important;height:66px!important;margin:0;overflow:hidden;box-shadow:none;background:transparent}',
      '#bluefat-global-music .aplayer-body{width:66px!important;height:66px!important}',
      '#bluefat-global-music .aplayer-pic{width:66px!important;height:66px!important}',
      '#bluefat-global-music .aplayer-info{display:none!important}',
      '#bluefat-global-music .aplayer-list{display:none!important}',
      '#bluefat-global-music .music-drag-handle{position:absolute;top:-10px;right:-10px;width:26px;height:26px;padding:0;border:0;border-radius:50%;background:var(--card,#fff);box-shadow:0 3px 12px rgba(0,0,0,.16);color:var(--text-p2,#777);font-size:17px;line-height:26px;cursor:grab;touch-action:none;user-select:none}',
      '#bluefat-global-music .music-drag-handle.is-dragging{cursor:grabbing;color:#a35b91}',
      '.booklist-toggle{display:block;width:100%;margin:12px 0;padding:9px 12px;border:0;border-radius:10px;background:var(--block,rgba(128,128,128,.08));color:var(--text-p1,#555);font:inherit;font-weight:600;cursor:pointer;transition:background .2s ease,color .2s ease}',
      '.booklist-toggle:hover{background:rgba(204,149,192,.18);color:#a35b91}',
      '@media(max-width:667px){#bluefat-global-music{right:12px;bottom:76px;width:66px}}'
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
