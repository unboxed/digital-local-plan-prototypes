//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

// Evidence tagging behaviour is opted into from markup via data attributes,
// so a page can carry more than one tag picker (the Review evidence screen
// has one for document passages and one for notes). Nothing here assumes a
// particular page or a single instance.
window.GOVUKPrototypeKit.documentReady(() => {
  document.querySelectorAll('[data-dlp-tagger]').forEach(initTagger)
  document.querySelectorAll('[data-dlp-highlights]').forEach(initSavedHighlights)
  document.querySelectorAll('[data-dlp-summary]').forEach(initSummarySearch)
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

  let mode = root.dataset.dlpMode || 'passage'
  let currentSelectionText = root.dataset.dlpText || ''
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

  function addCustomTag () {
    const value = customTagInput.value.trim()
    if (!value) return

    let button = Array.from(topicLozenges.querySelectorAll('.dlp-lozenge'))
      .find(candidate => candidate.dataset.tag.toLowerCase() === value.toLowerCase())

    if (!button) {
      button = document.createElement('button')
      button.type = 'button'
      button.className = 'dlp-lozenge dlp-lozenge--custom'
      button.dataset.tag = value
      button.textContent = value
      topicLozenges.appendChild(button)
    }

    button.setAttribute('aria-pressed', 'true')
    selectedTags.add(button.dataset.tag)
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

// Keyword search over the AI summary: filters sections and marks matches in
// place. Client-side so searching never reloads the page, which would reset
// the tab the user is working in.
function initSummarySearch (root) {
  const input = root.querySelector('[data-dlp-summary-search]')
  const count = root.querySelector('[data-dlp-summary-count]')
  const sections = Array.from(root.querySelectorAll('[data-dlp-summary-section]'))
  if (!input || !sections.length) return

  const entries = sections.map(section => ({
    section,
    parts: Array.from(section.querySelectorAll('[data-dlp-searchable]'))
      .map(element => ({ element, original: element.textContent }))
  }))

  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase()
    let matches = 0

    entries.forEach(entry => {
      let hit = false

      entry.parts.forEach(part => {
        if (!term || part.original.toLowerCase().indexOf(term) === -1) {
          part.element.textContent = part.original
          return
        }
        hit = true
        part.element.innerHTML = markMatches(part.original, term)
      })

      if (hit) matches += 1
      entry.section.hidden = Boolean(term) && !hit
    })

    if (!count) return
    if (!term) {
      count.textContent = ''
    } else if (matches) {
      count.textContent = matches + ' of ' + sections.length + ' sections mention “' + input.value.trim() + '”'
    } else {
      count.textContent = 'No sections mention “' + input.value.trim() + '”'
    }
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
