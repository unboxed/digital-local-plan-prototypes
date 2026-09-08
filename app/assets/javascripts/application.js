//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

// Evidence tagging behaviour is opted into from markup via data attributes,
// so a page can carry more than one tag picker (the Review evidence screen
// has one for document passages and one for notes). Nothing here assumes a
// particular page or a single instance.
window.GOVUKPrototypeKit.documentReady(() => {
  // Side navigation: mobile collapse/expand toggle
  document.querySelectorAll('[data-app-side-navigation-toggle]').forEach((button) => {
    const list = button.closest('.app-side-navigation__section').querySelector('.app-side-navigation__list')
    button.setAttribute('aria-expanded', 'true')
    button.addEventListener('click', () => {
      const isOpen = list.classList.toggle('app-side-navigation__list--open')
      button.setAttribute('aria-expanded', String(isOpen))
    })
  })

  document.querySelectorAll('[data-dlp-tagger]').forEach(initTagger)
  document.querySelectorAll('[data-dlp-highlights]').forEach(initSavedHighlights)
  document.querySelectorAll('[data-dlp-search]').forEach(initDocumentSearch)
  document.querySelectorAll('[data-dlp-evidence-search]').forEach(initEvidenceSearchModal)
})

// A tag picker: lozenges for tags and policy areas, an optional custom tag
// field, and a form whose hidden inputs are filled in on submit. It works in
// three shapes, chosen by markup:
//   - driven by a document viewer  (data-dlp-viewer="#some-viewer")
//   - a note                       (data-dlp-mode="note")
//   - fixed text                   (data-dlp-text="...")
function initTagger (root) {
  const form = root.querySelector('[data-dlp-form]')
  if (!form) return

  const fields = form.elements
  const part = name => root.querySelector('[data-dlp-' + name + ']')

  const viewer = querySelectorOrNull(root.dataset.dlpViewer)

  const modeButtons = root.querySelectorAll('[data-mode]')
  const modeSections = root.querySelectorAll('[data-mode-panel]')
  const selectedTextPreview = part('selected-text')
  const noteTextarea = part('note-text')
  const noteSourceTypeSelect = part('note-source-type')
  const topicLozenges = part('topic-lozenges')
  const policyLozenges = part('policy-lozenges')
  const customTagInput = part('custom-tag-input')
  const addCustomTagButton = part('custom-tag-add')

  const tagSearchInput = part('tag-search')
  const tagOptionsList = part('tag-options')
  const tagSearchSource = part('tag-search-source')

  let mode = root.dataset.dlpMode || 'passage'
  let currentSelectionText = root.dataset.dlpText || ''
  let selectedReference = ''
  const selectedTags = new Set()
  const selectedPolicyAreas = new Set()

  // Lozenges can arrive already pressed (the AI summary pre-selects its
  // suggested tags), so seed the sets from the markup.
  function seedPressed (container, tagSet) {
    if (!container) return
    container.querySelectorAll('[aria-pressed="true"]').forEach(button => {
      tagSet.add(button.dataset.tag)
    })
  }

  seedPressed(topicLozenges, selectedTags)
  seedPressed(policyLozenges, selectedPolicyAreas)

  function setMode (nextMode) {
    mode = nextMode
    modeButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.mode === mode))
    })
    modeSections.forEach(section => {
      section.hidden = section.dataset.modePanel !== mode
    })
  }

  modeButtons.forEach(button => {
    button.addEventListener('click', () => setMode(button.dataset.mode))
  })

  function updateSelectionPreview () {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return
    if (!viewer.contains(selection.anchorNode) || !viewer.contains(selection.focusNode)) return

    const text = selection.toString().trim()
    if (!text) return

    currentSelectionText = text
    if (selectedTextPreview) {
      selectedTextPreview.textContent = text
      selectedTextPreview.classList.remove('dlp-selected-text--empty')
    }
    if (modeButtons.length) setMode('passage')
  }

  if (viewer) {
    viewer.addEventListener('mouseup', updateSelectionPreview)
    viewer.addEventListener('keyup', updateSelectionPreview)
  }

  function toggleLozenge (button, tagSet) {
    const isPressed = button.getAttribute('aria-pressed') === 'true'

    // A lozenge that came from a tag search represents a chosen item rather
    // than a standing option, so deselecting it takes it off the list.
    if (isPressed && button.parentElement.hasAttribute('data-dlp-remove-on-deselect')) {
      if (button.dataset.kind === 'reference') selectedReference = ''
      tagSet.delete(button.dataset.tag)
      button.remove()
      return
    }

    button.setAttribute('aria-pressed', String(!isPressed))
    if (isPressed) {
      tagSet.delete(button.dataset.tag)
    } else {
      tagSet.add(button.dataset.tag)
    }
  }

  if (topicLozenges) {
    topicLozenges.addEventListener('click', event => {
      const button = event.target.closest('.dlp-lozenge')
      if (button) toggleLozenge(button, selectedTags)
    })
  }

  if (policyLozenges) {
    policyLozenges.addEventListener('click', event => {
      const button = event.target.closest('.dlp-lozenge')
      if (button) toggleLozenge(button, selectedPolicyAreas)
    })
  }

  // Presses an existing lozenge for this value, or adds one if the list
  // doesn't already offer it.
  function selectTag (value, modifierClass) {
    let button = Array.from(topicLozenges.querySelectorAll('.dlp-lozenge'))
      .find(candidate => candidate.dataset.tag.toLowerCase() === value.toLowerCase())

    if (!button) {
      button = document.createElement('button')
      button.type = 'button'
      button.className = 'dlp-lozenge' + (modifierClass ? ' ' + modifierClass : '')
      button.dataset.tag = value
      button.textContent = value
      topicLozenges.appendChild(button)
    }

    button.setAttribute('aria-pressed', 'true')
    selectedTags.add(button.dataset.tag)
    return button
  }

  function addCustomTag () {
    const value = customTagInput.value.trim()
    if (!value) return

    selectTag(value, 'dlp-lozenge--custom')
    customTagInput.value = ''
    customTagInput.focus()
  }

  if (customTagInput && topicLozenges) {
    if (addCustomTagButton) addCustomTagButton.addEventListener('click', addCustomTag)
    customTagInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault()
        addCustomTag()
      }
    })
  }

  // Tag search: instead of listing every tag up front, the user types and
  // picks from the matches. It searches tags and policy references
  // together, so one field covers both.
  if (tagSearchInput && tagOptionsList && tagSearchSource && topicLozenges) {
    let searchOptions = []
    try {
      searchOptions = JSON.parse(tagSearchSource.textContent)
    } catch (error) {
      searchOptions = []
    }

    function closeOptions () {
      tagOptionsList.innerHTML = ''
      tagOptionsList.hidden = true
      tagSearchInput.setAttribute('aria-expanded', 'false')
    }

    function chooseOption (option) {
      if (option.kind === 'reference') {
        const existing = topicLozenges.querySelector('[data-kind="reference"]')
        if (existing) {
          selectedTags.delete(existing.dataset.tag)
          existing.remove()
        }
        selectedReference = option.value
        selectTag(option.value, 'dlp-lozenge--reference').dataset.kind = 'reference'
        selectedTags.delete(option.value)
      } else {
        selectTag(option.value, option.kind === 'custom' ? 'dlp-lozenge--custom' : '')
      }

      tagSearchInput.value = ''
      closeOptions()
      tagSearchInput.focus()
    }

    tagSearchInput.addEventListener('input', () => {
      const term = tagSearchInput.value.trim().toLowerCase()
      tagOptionsList.innerHTML = ''

      if (!term) {
        closeOptions()
        return
      }

      const matches = searchOptions
        .filter(option => option.value.toLowerCase().indexOf(term) !== -1)
        .filter(option => option.kind === 'reference' || !selectedTags.has(option.value))
        .slice(0, 8)

      function addOption (option, kindLabel, modifierClass) {
        const item = document.createElement('li')
        item.setAttribute('role', 'option')

        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'dlp-typeahead__option' + (modifierClass ? ' ' + modifierClass : '')
        button.addEventListener('click', () => chooseOption(option))

        const label = document.createElement('span')
        label.textContent = option.value
        button.appendChild(label)

        const kind = document.createElement('span')
        kind.className = 'dlp-typeahead__kind'
        kind.textContent = kindLabel
        button.appendChild(kind)

        item.appendChild(button)
        tagOptionsList.appendChild(item)
      }

      matches.forEach(option => {
        addOption(option, option.kind === 'reference' ? 'Policy reference' : 'Tag')
      })

      // Nothing stops an officer needing a tag the list doesn't have yet, so
      // offer the typed text as a new one.
      const typed = tagSearchInput.value.trim()
      const exists = searchOptions.some(option => option.value.toLowerCase() === term) ||
        selectedTags.has(typed)

      if (!exists) {
        addOption({ value: typed, kind: 'custom' }, 'Add as new tag', 'dlp-typeahead__option--new')
      }

      // Everything typed is already chosen — nothing left to offer.
      if (!tagOptionsList.children.length) {
        closeOptions()
        return
      }

      tagOptionsList.hidden = false
      tagSearchInput.setAttribute('aria-expanded', 'true')
    })

    tagSearchInput.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeOptions()
      // Enter would otherwise submit the note before anything is chosen.
      if (event.key === 'Enter') event.preventDefault()
    })

    document.addEventListener('click', event => {
      if (!root.contains(event.target)) closeOptions()
    })
  }

  form.addEventListener('submit', event => {
    const noteText = mode === 'note' && noteTextarea ? noteTextarea.value.trim() : ''
    const tags = Array.from(selectedTags).join(',')
    const policyAreas = Array.from(selectedPolicyAreas).join(',')

    if (fields.entryType) fields.entryType.value = mode
    if (fields.selectedText) fields.selectedText.value = mode === 'passage' ? currentSelectionText : ''
    if (fields.noteText) fields.noteText.value = noteText
    if (fields.sourceType && noteSourceTypeSelect) {
      fields.sourceType.value = mode === 'note' ? noteSourceTypeSelect.value : ''
    }
    if (fields.tags) fields.tags.value = tags
    if (fields.policyAreas) fields.policyAreas.value = policyAreas
    // Only when a tag search owns the reference — elsewhere it's a select
    // the user sets directly.
    if (tagSearchInput && fields.policyReference) fields.policyReference.value = selectedReference

    if (mode === 'passage' && !currentSelectionText) {
      event.preventDefault()
      window.alert('Highlight some text in the document before saving.')
      return
    }
    if (mode === 'note' && !noteText) {
      event.preventDefault()
      window.alert('Add a note before saving.')
      return
    }
    if (!tags && !policyAreas) {
      event.preventDefault()
      window.alert('Choose at least one tag before saving.')
    }
  })
}

// Wraps previously saved passages in the document text with a highlight, and
// shows their tags underneath — so tagged evidence stays visible against the
// original wording rather than in a separate list only. The viewer names its
// own data source and its own tag-removal endpoint, so more than one screen
// can use this.
function initSavedHighlights (viewer) {
  const dataScript = querySelectorOrNull(viewer.dataset.dlpHighlights)
  if (!dataScript) return

  const options = {
    action: viewer.dataset.dlpRemoveAction || '/evidence/document-tagging/remove-tag',
    returnTo: viewer.dataset.dlpReturn || ''
  }

  let savedPassages = []
  try {
    savedPassages = JSON.parse(dataScript.textContent)
  } catch (error) {
    savedPassages = []
  }

  savedPassages.forEach(item => highlightPassage(viewer, item, options))
}

function highlightPassage (viewer, item, options) {
  const text = item.text
  if (!text) return

  const walker = document.createTreeWalker(viewer, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode())) {
    const index = node.nodeValue.indexOf(text)
    if (index === -1) continue

    const range = document.createRange()
    range.setStart(node, index)
    range.setEnd(node, index + text.length)

    const mark = document.createElement('mark')
    mark.className = 'dlp-highlight'
    range.surroundContents(mark)

    const paragraph = mark.closest('p')
    if (paragraph) {
      addTagsBelowParagraph(paragraph, item, options)
    }
    break
  }
}

// Tags for a highlighted passage sit in a block underneath the paragraph
// that contains it, rather than inline with the highlight — so the
// paragraph's own text and spacing are never disturbed. Multiple tagged
// passages within the same paragraph share one row underneath it.
function addTagsBelowParagraph (paragraph, item, options) {
  let row = paragraph.nextElementSibling
  if (!row || !row.classList.contains('dlp-highlight-tags-row')) {
    row = document.createElement('div')
    row.className = 'dlp-highlight-tags-row'
    paragraph.insertAdjacentElement('afterend', row)
  }

  const group = document.createElement('span')
  group.className = 'dlp-highlight-tags-group'
  item.tags.concat(item.customTags).forEach(tag => {
    group.appendChild(createRemovableTagChip(item.id, tag, 'topic', options))
  })
  item.policyAreas.forEach(area => {
    group.appendChild(createRemovableTagChip(item.id, area, 'policy', options))
  })
  row.appendChild(group)
}

// Each tag chip is a real form that posts back to remove just that tag (or
// policy area) from the saved item — clicking it removes it, no extra JS
// wiring needed.
function createRemovableTagChip (itemId, tag, kind, options) {
  options = options || {}

  const form = document.createElement('form')
  form.className = 'dlp-chip-form'
  form.method = 'post'
  form.action = options.action || '/evidence/document-tagging/remove-tag'

  form.appendChild(hiddenField('itemId', itemId))
  form.appendChild(hiddenField('tag', tag))
  if (options.returnTo) form.appendChild(hiddenField('_returnTo', options.returnTo))

  const button = document.createElement('button')
  button.type = 'submit'
  button.className = 'dlp-chip dlp-chip--removable' + (kind === 'policy' ? ' dlp-chip--policy' : '')
  button.setAttribute('aria-label', 'Remove tag ' + tag)

  const label = document.createElement('span')
  label.textContent = tag
  button.appendChild(label)

  const removeIcon = document.createElement('span')
  removeIcon.className = 'dlp-chip__remove'
  removeIcon.setAttribute('aria-hidden', 'true')
  removeIcon.textContent = '×'
  button.appendChild(removeIcon)

  form.appendChild(button)
  return form
}

// A missing attribute gives undefined and an empty one gives '', both of
// which would make querySelector throw — so resolve defensively.
function querySelectorOrNull (selector) {
  if (!selector) return null
  try {
    return document.querySelector(selector)
  } catch (error) {
    return null
  }
}

function hiddenField (name, value) {
  const field = document.createElement('input')
  field.type = 'hidden'
  field.name = name
  field.value = value
  return field
}

// Keyword search across the full document text, listing the passages that
// match with the term marked. Client-side, so searching never reloads the
// page — a reload would drop the user back to the first tab.
function initDocumentSearch (root) {
  const input = root.querySelector('[data-dlp-search-input]')
  const results = root.querySelector('[data-dlp-search-results]')
  const count = root.querySelector('[data-dlp-search-count]')
  const dataScript = querySelectorOrNull(root.dataset.dlpSearchSource)
  if (!input || !results || !dataScript) return

  let paragraphs = []
  try {
    paragraphs = JSON.parse(dataScript.textContent)
  } catch (error) {
    paragraphs = []
  }

  input.addEventListener('input', () => {
    const term = input.value.trim()
    results.innerHTML = ''

    if (!term) {
      if (count) count.textContent = ''
      return
    }

    const matches = paragraphs.filter(paragraph => {
      return paragraph.toLowerCase().indexOf(term.toLowerCase()) !== -1
    })

    matches.forEach(paragraph => {
      const hit = document.createElement('p')
      hit.className = 'dlp-search__result'
      hit.innerHTML = markMatches(paragraph, term.toLowerCase())
      results.appendChild(hit)
    })

    if (!count) return
    count.textContent = matches.length
      ? matches.length + ' passage' + (matches.length === 1 ? '' : 's') + ' mention “' + term + '”'
      : 'No passages mention “' + term + '”'
  })
}

// Policy screen: searching evidence by keyword opens the results in a modal,
// grouped by the document each passage came from. Uses a native <dialog>, so
// focus trapping and Escape-to-close come for free.
function initEvidenceSearchModal (root) {
  const input = root.querySelector('[data-dlp-search-input]')
  const submit = root.querySelector('[data-dlp-search-submit]')
  const dataScript = querySelectorOrNull(root.dataset.dlpSearchSource)
  const modal = document.querySelector('[data-dlp-search-modal]')
  if (!input || !dataScript || !modal) return

  const title = modal.querySelector('[data-dlp-modal-title]')
  const body = modal.querySelector('[data-dlp-modal-body]')
  const close = modal.querySelector('[data-dlp-modal-close]')

  const suggestions = root.querySelector('[data-dlp-search-suggestions]')
  const termsScript = querySelectorOrNull(root.dataset.dlpTermsSource)

  let passages = []
  try {
    passages = JSON.parse(dataScript.textContent)
  } catch (error) {
    passages = []
  }

  let searchTerms = []
  if (termsScript) {
    try {
      searchTerms = JSON.parse(termsScript.textContent)
    } catch (error) {
      searchTerms = []
    }
  }

  function closeSuggestions () {
    if (!suggestions) return
    suggestions.innerHTML = ''
    suggestions.hidden = true
    input.setAttribute('aria-expanded', 'false')
  }

  function groupBySource (matches) {
    const groups = []
    matches.forEach(passage => {
      let group = groups.find(candidate => candidate.source === passage.source)
      if (!group) {
        group = { source: passage.source, chapter: passage.chapter, passages: [] }
        groups.push(group)
      }
      group.passages.push(passage)
    })
    return groups
  }

  // Results are a list of the documents the term appears in — the documents
  // themselves aren't openable yet, so they're shown as links without a
  // destination.
  function search (searchTerm) {
    const term = (searchTerm === undefined ? input.value : searchTerm).trim()
    if (!term) return

    input.value = term
    closeSuggestions()

    const matches = passages.filter(passage => {
      return passage.text.toLowerCase().indexOf(term.toLowerCase()) !== -1
    })
    const groups = groupBySource(matches)

    title.textContent = 'All evidence relating to “' + term + '”'
    body.innerHTML = ''

    if (!groups.length) {
      const empty = document.createElement('p')
      empty.className = 'govuk-body'
      empty.textContent = 'No evidence mentions “' + term + '”.'
      body.appendChild(empty)
    } else {
      const count = document.createElement('p')
      count.className = 'govuk-body-s dlp-modal__count'
      count.textContent = groups.length + ' document' + (groups.length === 1 ? '' : 's') +
        ' mention “' + term + '”'
      body.appendChild(count)

      const list = document.createElement('ul')
      list.className = 'govuk-list dlp-doc-results'

      groups.forEach(group => {
        const item = document.createElement('li')
        item.className = 'dlp-doc-results__item'

        const link = document.createElement('a')
        link.className = 'govuk-link dlp-doc-results__title'
        link.href = '#'
        link.textContent = group.chapter ? group.source + ' / ' + group.chapter : group.source
        item.appendChild(link)

        const meta = document.createElement('p')
        meta.className = 'govuk-body-s dlp-doc-results__meta'
        meta.textContent = group.passages.length + ' mention' +
          (group.passages.length === 1 ? '' : 's') + ' in this document'
        item.appendChild(meta)

        list.appendChild(item)
      })

      body.appendChild(list)
    }

    if (typeof modal.showModal === 'function') {
      modal.showModal()
    } else {
      modal.setAttribute('open', 'open')
    }
  }

  if (submit) submit.addEventListener('click', () => search())

  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSuggestions()
      return
    }
    if (event.key !== 'Enter') return
    event.preventDefault()
    search()
  })

  // Type-ahead over policy titles and common evidence topics, so officers can
  // see the kinds of term worth searching for rather than guessing.
  if (suggestions && searchTerms.length) {
    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase()
      suggestions.innerHTML = ''

      if (!term) {
        closeSuggestions()
        return
      }

      const matches = searchTerms
        .filter(option => option.term.toLowerCase().indexOf(term) !== -1)
        .slice(0, 8)

      if (!matches.length) {
        closeSuggestions()
        return
      }

      matches.forEach(option => {
        const item = document.createElement('li')
        item.setAttribute('role', 'option')

        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'dlp-typeahead__option'
        button.addEventListener('click', () => search(option.term))

        const label = document.createElement('span')
        label.textContent = option.term
        button.appendChild(label)

        const kind = document.createElement('span')
        kind.className = 'dlp-typeahead__kind'
        kind.textContent = option.kind
        button.appendChild(kind)

        item.appendChild(button)
        suggestions.appendChild(item)
      })

      suggestions.hidden = false
      input.setAttribute('aria-expanded', 'true')
    })

    document.addEventListener('click', event => {
      if (!root.contains(event.target)) closeSuggestions()
    })
  }

  if (close) close.addEventListener('click', () => modal.close())

  // Clicking the backdrop (i.e. the dialog element itself, outside its
  // content) closes it, matching what people expect of a modal.
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.close()
  })
}

function markMatches (original, term) {
  const lower = original.toLowerCase()
  let result = ''
  let index = 0

  for (;;) {
    const found = lower.indexOf(term, index)
    if (found === -1) break
    result += escapeHtml(original.slice(index, found))
    result += '<mark class="dlp-search-hit">' + escapeHtml(original.slice(found, found + term.length)) + '</mark>'
    index = found + term.length
  }

  return result + escapeHtml(original.slice(index))
}

function escapeHtml (value) {
  return value.replace(/[&<>"']/g, character => {
    switch (character) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      default: return '&#39;'
    }
  })
}
