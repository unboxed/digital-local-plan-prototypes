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
  document.querySelectorAll('[data-dlp-resource-panel]').forEach(initResourcePanel)
})

// Examination - inspector view: clicking a related-resource snippet shows its full text in the
// panel alongside it, replacing the "select a resource" empty state. Triggers live outside the
// panel itself, so they're found from the document rather than scoped to the panel.
function initResourcePanel (panel) {
  const emptyState = panel.querySelector('[data-dlp-resource-panel-empty]')
  const items = panel.querySelectorAll('[data-dlp-resource-panel-item]')
  const triggers = document.querySelectorAll('[data-dlp-resource-trigger]')

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.dataset.resourceTarget

      triggers.forEach(candidate => {
        candidate.setAttribute('aria-pressed', String(candidate === trigger))
      })

      if (emptyState) emptyState.hidden = true
      items.forEach(item => {
        item.hidden = item.dataset.resourceId !== targetId
      })
    })
  })
}

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

// Policy screen: searching the evidence base opens the matching passages in a
// modal as excerpts, ranked most relevant first. Each excerpt can be selected
// and the selection copied out, which is how an officer gets evidence from the
// search into whatever they're drafting. Uses a native <dialog>, so focus
// trapping and Escape-to-close come for free.

// Dropped when scoring, so a multi-word search isn't dominated by the words
// every passage contains.
const SEARCH_STOP_WORDS = [
  'and', 'the', 'of', 'for', 'in', 'on', 'to', 'with', 'from', 'by', 'at',
  'its', 'their', 'including'
]

function tokeniseSearch (term) {
  return term.toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter(word => word.length > 2 && SEARCH_STOP_WORDS.indexOf(word) === -1)
}

function countOccurrences (haystack, needle) {
  let count = 0
  let index = haystack.indexOf(needle)

  while (index !== -1) {
    count += 1
    index = haystack.indexOf(needle, index + needle.length)
  }

  return count
}

// Relevance, most significant signal first: the whole phrase in the passage,
// then the phrase in the document title, then each separate word. A passage
// already linked to the policy on screen, or already tagged into the evidence
// base, edges ahead of an equally good match that isn't.
function scorePassage (passage, phrase, words, currentPolicyRef) {
  const text = passage.text.toLowerCase()
  const source = (passage.source || '').toLowerCase()
  let score = countOccurrences(text, phrase) * 10

  // A document whose title carries the term is about the term, which beats a
  // passage that happens to repeat it — hence a title match outweighing a
  // second and third mention in the body.
  if (source.indexOf(phrase) !== -1) score += 12

  words.forEach(word => {
    const count = countOccurrences(text, word)
    if (count) score += 3 + Math.min(count - 1, 3)
    if (source.indexOf(word) !== -1) score += 4
  })

  if (!score) return 0

  if (currentPolicyRef && (passage.policyRefs || []).indexOf(currentPolicyRef) !== -1) score += 4
  if (passage.tagged) score += 2

  return score
}

function initEvidenceSearchModal (root) {
  const input = root.querySelector('[data-dlp-search-input]')
  const submit = root.querySelector('[data-dlp-search-submit]')
  const dataScript = querySelectorOrNull(root.dataset.dlpSearchSource)
  const modal = document.querySelector('[data-dlp-search-modal]')
  if (!input || !dataScript || !modal) return

  const title = modal.querySelector('[data-dlp-modal-title]')
  const body = modal.querySelector('[data-dlp-modal-body]')
  const close = modal.querySelector('[data-dlp-modal-close]')
  const footer = modal.querySelector('[data-dlp-modal-footer]')
  const selectionCount = modal.querySelector('[data-dlp-selection-count]')
  const copyButton = modal.querySelector('[data-dlp-copy-selected]')
  const clearButton = modal.querySelector('[data-dlp-clear-selection]')
  const copyStatus = modal.querySelector('[data-dlp-copy-status]')

  const suggestions = root.querySelector('[data-dlp-search-suggestions]')
  const termsScript = querySelectorOrNull(root.dataset.dlpTermsSource)
  const currentPolicyRef = root.dataset.dlpCurrentPolicy || ''

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

  // The excerpts currently ticked, in the order they appear in the results.
  let results = []
  let selected = []

  function closeSuggestions () {
    if (!suggestions) return
    suggestions.innerHTML = ''
    suggestions.hidden = true
    input.setAttribute('aria-expanded', 'false')
  }

  function setCopyStatus (message) {
    if (copyStatus) copyStatus.textContent = message || ''
  }

  function updateSelection () {
    if (selectionCount) {
      selectionCount.textContent = selected.length
        ? selected.length + ' excerpt' + (selected.length === 1 ? '' : 's') + ' selected'
        : 'No excerpts selected'
    }
    if (copyButton) copyButton.disabled = selected.length === 0
    if (clearButton) clearButton.hidden = selected.length === 0
  }

  function clearSelection () {
    selected = []
    modal.querySelectorAll('[data-dlp-excerpt-checkbox]').forEach(checkbox => {
      checkbox.checked = false
      checkbox.closest('.dlp-excerpt').classList.remove('dlp-excerpt--selected')
    })
    setCopyStatus('')
    updateSelection()
  }

  function excerptAsText (passage) {
    const where = [passage.source, passage.ref].filter(Boolean).join(', ')
    const refs = (passage.policyRefs || []).length
      ? ' (Policy ' + passage.policyRefs.join(', ') + ')'
      : ''

    return '"' + passage.text + '"\n— ' + where + refs
  }

  // navigator.clipboard needs a secure context, which localhost is; the
  // textarea fallback covers anything served over plain http.
  function copyToClipboard (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text)
    }

    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', 'readonly')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()

      let copied = false
      try {
        copied = document.execCommand('copy')
      } catch (error) {
        copied = false
      }

      document.body.removeChild(area)
      if (copied) resolve()
      else reject(new Error('Copying is not available in this browser'))
    })
  }

  function renderExcerpt (passage, index, terms) {
    const item = document.createElement('li')
    item.className = 'dlp-excerpt'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'dlp-excerpt__checkbox'
    checkbox.id = 'dlp-excerpt-' + index
    checkbox.setAttribute('data-dlp-excerpt-checkbox', '')

    const label = document.createElement('label')
    label.className = 'dlp-excerpt__label'
    label.setAttribute('for', checkbox.id)

    const text = document.createElement('span')
    text.className = 'dlp-excerpt__text'
    text.innerHTML = markTerms(passage.text, terms)
    label.appendChild(text)

    const meta = document.createElement('span')
    meta.className = 'dlp-excerpt__meta'

    const source = document.createElement('span')
    source.className = 'dlp-excerpt__source'
    source.textContent = [passage.source, passage.ref].filter(Boolean).join(', ')
    meta.appendChild(source)

    if ((passage.policyRefs || []).length) {
      const refs = document.createElement('span')
      refs.className = 'dlp-excerpt__refs'

      const refLabel = document.createElement('span')
      refLabel.className = 'govuk-visually-hidden'
      refLabel.textContent = 'Supports policy '
      refs.appendChild(refLabel)

      passage.policyRefs.forEach(ref => {
        const tag = document.createElement('span')
        tag.className = 'dlp-excerpt__ref'
        if (ref === currentPolicyRef) tag.classList.add('dlp-excerpt__ref--current')
        tag.textContent = ref
        refs.appendChild(tag)
      })

      meta.appendChild(refs)
    }

    label.appendChild(meta)

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selected.push(passage)
        item.classList.add('dlp-excerpt--selected')
      } else {
        selected = selected.filter(candidate => candidate !== passage)
        item.classList.remove('dlp-excerpt--selected')
      }
      setCopyStatus('')
      updateSelection()
    })

    item.appendChild(checkbox)
    item.appendChild(label)
    return item
  }

  function search (searchTerm) {
    const term = (searchTerm === undefined ? input.value : searchTerm).trim()
    if (!term) return

    input.value = term
    closeSuggestions()

    const phrase = term.toLowerCase()
    const words = tokeniseSearch(term)
    const terms = [phrase].concat(words.filter(word => word !== phrase))

    results = passages
      .map(passage => ({ passage, score: scorePassage(passage, phrase, words, currentPolicyRef) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => result.passage)

    title.textContent = 'Evidence relating to “' + term + '”'
    body.innerHTML = ''
    selected = []
    setCopyStatus('')
    updateSelection()

    if (!results.length) {
      const empty = document.createElement('p')
      empty.className = 'govuk-body'
      empty.textContent = 'No evidence mentions “' + term + '”.'
      body.appendChild(empty)
      if (footer) footer.hidden = true
    } else {
      const count = document.createElement('p')
      count.className = 'govuk-body-s dlp-modal__count'
      count.textContent = results.length + ' excerpt' + (results.length === 1 ? '' : 's') +
        ', most relevant first. Select the ones you want, then copy them.'
      body.appendChild(count)

      const list = document.createElement('ul')
      list.className = 'govuk-list dlp-excerpt-list'
      results.forEach((passage, index) => list.appendChild(renderExcerpt(passage, index, terms)))
      body.appendChild(list)

      if (footer) footer.hidden = false
    }

    body.scrollTop = 0

    if (typeof modal.showModal === 'function') {
      modal.showModal()
    } else {
      modal.setAttribute('open', 'open')
    }
  }

  if (copyButton) {
    copyButton.addEventListener('click', () => {
      if (!selected.length) return

      const text = selected.map(excerptAsText).join('\n\n')
      const copied = selected.length

      copyToClipboard(text).then(() => {
        setCopyStatus(copied + ' excerpt' + (copied === 1 ? '' : 's') + ' copied to your clipboard')
      }).catch(() => {
        setCopyStatus('Could not copy — your browser blocked access to the clipboard')
      })
    })
  }

  if (clearButton) clearButton.addEventListener('click', clearSelection)

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

  updateSelection()
}

// Marks every search term in a passage, taking the earliest match each time so
// overlapping terms (the whole phrase and the words within it) can't nest.
function markTerms (original, terms) {
  const lower = original.toLowerCase()
  let result = ''
  let index = 0

  for (;;) {
    let at = -1
    let length = 0

    terms.forEach(term => {
      const found = lower.indexOf(term, index)
      if (found === -1) return
      if (at === -1 || found < at || (found === at && term.length > length)) {
        at = found
        length = term.length
      }
    })

    if (at === -1) break
    result += escapeHtml(original.slice(index, at))
    result += '<mark class="dlp-search-hit">' + escapeHtml(original.slice(at, at + length)) + '</mark>'
    index = at + length
  }

  return result + escapeHtml(original.slice(index))
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
