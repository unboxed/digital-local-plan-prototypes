//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  initEvidenceTagging()
})

// Evidence document tagging (E2US3 / E2US4): highlight text in the document
// viewer, then apply tags as lozenges rather than picking from a list of
// predefined passages. Only this interaction needs JavaScript — everything
// else on the page is a normal form submission.
function initEvidenceTagging () {
  const viewer = document.getElementById('document-viewer')
  const panel = document.getElementById('tag-panel')
  if (!viewer || !panel) return

  const modeButtons = panel.querySelectorAll('[data-mode]')
  const modeSections = panel.querySelectorAll('[data-mode-panel]')
  const selectedTextPreview = document.getElementById('selected-text-preview')
  const noteTextarea = document.getElementById('note-text')
  const topicLozenges = document.getElementById('topic-lozenges')
  const policyLozenges = document.getElementById('policy-area-lozenges')
  const customTagInput = document.getElementById('custom-tag-input')
  const addCustomTagButton = document.getElementById('add-custom-tag-btn')
  const form = document.getElementById('save-tags-form')
  const entryTypeInput = document.getElementById('entry-type-input')
  const selectedTextInput = document.getElementById('selected-text-input')
  const noteTextInput = document.getElementById('note-text-input')
  const tagsInput = document.getElementById('tags-input')
  const policyAreasInput = document.getElementById('policy-areas-input')

  let mode = 'passage'
  let currentSelectionText = ''
  const selectedTags = new Set()
  const selectedPolicyAreas = new Set()

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
    selectedTextPreview.textContent = text
    selectedTextPreview.classList.remove('dlp-selected-text--empty')
    setMode('passage')
  }

  viewer.addEventListener('mouseup', updateSelectionPreview)
  viewer.addEventListener('keyup', updateSelectionPreview)

  function toggleLozenge (button, tagSet) {
    const isPressed = button.getAttribute('aria-pressed') === 'true'
    button.setAttribute('aria-pressed', String(!isPressed))
    if (isPressed) {
      tagSet.delete(button.dataset.tag)
    } else {
      tagSet.add(button.dataset.tag)
    }
  }

  topicLozenges.addEventListener('click', event => {
    const button = event.target.closest('.dlp-lozenge')
    if (button) toggleLozenge(button, selectedTags)
  })

  policyLozenges.addEventListener('click', event => {
    const button = event.target.closest('.dlp-lozenge')
    if (button) toggleLozenge(button, selectedPolicyAreas)
  })

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

  addCustomTagButton.addEventListener('click', addCustomTag)
  customTagInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addCustomTag()
    }
  })

  form.addEventListener('submit', event => {
    entryTypeInput.value = mode
    selectedTextInput.value = mode === 'passage' ? currentSelectionText : ''
    noteTextInput.value = mode === 'note' ? noteTextarea.value.trim() : ''
    tagsInput.value = Array.from(selectedTags).join(',')
    policyAreasInput.value = Array.from(selectedPolicyAreas).join(',')

    if (mode === 'passage' && !selectedTextInput.value) {
      event.preventDefault()
      window.alert('Highlight some text in the document before saving.')
      return
    }
    if (mode === 'note' && !noteTextInput.value) {
      event.preventDefault()
      window.alert('Add a note before saving.')
      return
    }
    if (!tagsInput.value && !policyAreasInput.value) {
      event.preventDefault()
      window.alert('Choose at least one tag before saving.')
    }
  })

  renderSavedHighlights(viewer)
}

// Wraps previously saved passages in the document text with a highlight,
// and shows their tags immediately after — so tagged evidence stays visible
// against the original wording rather than in a separate list only.
function renderSavedHighlights (viewer) {
  const dataScript = document.getElementById('saved-passages-data')
  if (!dataScript) return

  let savedPassages = []
  try {
    savedPassages = JSON.parse(dataScript.textContent)
  } catch (error) {
    savedPassages = []
  }

  savedPassages.forEach(item => highlightPassage(viewer, item))
}

function highlightPassage (viewer, item) {
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

    const tagWrap = document.createElement('span')
    tagWrap.className = 'dlp-highlight__tags'
    item.tags.concat(item.customTags).forEach(tag => {
      const chip = document.createElement('span')
      chip.className = 'dlp-chip'
      chip.textContent = tag
      tagWrap.appendChild(chip)
    })
    mark.insertAdjacentElement('afterend', tagWrap)
    break
  }
}
