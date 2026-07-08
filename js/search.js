(function () {
  var modal = document.getElementById('search-modal')
  var input = document.getElementById('search-input')
  var results = document.getElementById('search-results')
  var pagefind = null
  var selectedIndex = -1

  function openSearch() {
    modal.classList.remove('hidden')
    modal.setAttribute('aria-hidden', 'false')
    input.value = ''
    results.innerHTML = ''
    selectedIndex = -1
    setTimeout(function () { input.focus() }, 50)
  }

  function closeSearch() {
    modal.classList.add('hidden')
    modal.setAttribute('aria-hidden', 'true')
    selectedIndex = -1
  }

  function renderResults(items) {
    if (!items || !items.length) {
      results.innerHTML = '<div class="p-8 text-center" style="color: oklch(var(--ink-muted));">未找到相关文章</div>'
      selectedIndex = -1
      return
    }
    selectedIndex = 0
    results.innerHTML = items.map(function (item, i) {
      var result = item.data
      return '<a href="' + result.url + '" class="block px-4 py-3 border-b border-[oklch(var(--line))] transition-colors ' +
        (i === 0 ? 'bg-[oklch(var(--accent)/0.08)]' : 'hover:bg-[oklch(var(--accent)/0.04)]') +
        '" data-index="' + i + '" aria-selected="' + (i === 0 ? 'true' : 'false') + '">' +
        '<div class="text-sm font-medium" style="color: oklch(var(--ink));">' + result.meta.title + '</div>' +
        '<div class="mt-1 text-xs line-clamp-1" style="color: oklch(var(--ink-muted));">' + (result.meta.description || '') + '</div>' +
        '</a>'
    }).join('')
  }

  function setSelected(index) {
    var items = results.querySelectorAll('a')
    if (!items.length) return
    if (index < 0) index = items.length - 1
    if (index >= items.length) index = 0
    items.forEach(function (el, i) {
      el.classList.toggle('bg-[oklch(var(--accent)/0.08)]', i === index)
      el.classList.toggle('hover:bg-[oklch(var(--accent)/0.04)]', i !== index)
      el.setAttribute('aria-selected', i === index ? 'true' : 'false')
    })
    selectedIndex = index
    items[selectedIndex].scrollIntoView({ block: 'nearest' })
  }

  // Load pagefind
  function loadPagefind() {
    if (pagefind) return
    var script = document.createElement('script')
    script.src = '/pagefind/pagefind-ui.js'
    script.onload = function () {
      pagefind = new PagefindUI({
        element: '#search-results',
        showSubResults: false,
        showImages: false,
        resetStyles: true,
        processTerm: function (term) { return term },
        showEmptyFilters: false,
      })
      // Patch Pagefind to render into our results container and use our styles
      pagefind.triggerSearch = function (q) {
        if (!q) { results.innerHTML = ''; selectedIndex = -1; return }
        window.Pagefind.search(q).then(function (res) {
          Promise.all(res.results.slice(0, 15).map(function (r) { return r.data() }))
            .then(renderResults)
        })
      }
    }
    document.head.appendChild(script)
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      loadPagefind()
      openSearch()
    }
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      e.preventDefault()
      closeSearch()
    }
    if (!modal.classList.contains('hidden')) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(selectedIndex + 1) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(selectedIndex - 1) }
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        var a = results.querySelector('a[data-index="' + selectedIndex + '"]')
        if (a) window.location = a.href
      }
    }
  })

  // Search as you type
  input.addEventListener('input', function (e) {
    if (pagefind && pagefind.triggerSearch) {
      pagefind.triggerSearch(e.target.value)
    }
  })

  // Close on backdrop click
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.getAttribute('aria-hidden') === 'true') {
      closeSearch()
    }
  })
})()
