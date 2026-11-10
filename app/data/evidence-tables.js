//
// Tables in evidence documents, and how a highlighted table is referenced.
//
// A table is written as it is printed: rows of cells, where a cell is a string or
// { text, colspan, rowspan }, and the first `headerRows` rows and `headerCols` columns are
// headers. Headers can be two deep (a "Households" heading over "2024" and "2039", or
// "Affordable housing for rent" beside "Social rent" and "Affordable rent").
//
// resolveTable flattens that into one header per body column and one per body row, joining
// the levels with HEADER_JOIN ("Households – 2024"). That merged header is used everywhere a
// table is referenced or extracted, so a reference always reads
//   "<table title>, <row header>, <column header>"
// with only the parts that apply. The resolving happens here, on the server, and the browser
// is given the result: the preview in the tag panel and the saved evidence item are built from
// the same headers, so they can't disagree.
//

const HEADER_JOIN = ' – '

function cellOf (cell) {
  return typeof cell === 'string' ? { text: cell } : cell
}

// Each source cell placed on a full grid, so a spanned cell occupies every position it covers.
function expandGrid (rows) {
  const grid = []
  const placed = []
  rows.forEach((row, r) => {
    grid[r] = grid[r] || []
    let c = 0
    row.forEach(source => {
      const cell = cellOf(source)
      while (grid[r][c]) c += 1
      const rowspan = cell.rowspan || 1
      const colspan = cell.colspan || 1
      const entry = { cell, r, c, rowspan, colspan }
      placed.push(entry)
      for (let dr = 0; dr < rowspan; dr += 1) {
        grid[r + dr] = grid[r + dr] || []
        for (let dc = 0; dc < colspan; dc += 1) grid[r + dr][c + dc] = entry
      }
      c += colspan
    })
  })
  return { grid, placed }
}

// The levels of a header, top to bottom or left to right, without blanks or the repeats a
// spanned cell leaves behind.
function mergeHeader (entries) {
  const parts = []
  entries.forEach(entry => {
    const text = entry && entry.cell.text ? entry.cell.text.trim() : ''
    if (text && parts[parts.length - 1] !== text) parts.push(text)
  })
  return parts
}

function range (from, to) {
  const out = []
  for (let i = from; i < to; i += 1) out.push(i)
  return out
}

// What several rows (or columns) have in common: the header levels they all share, so the
// two rows under "Affordable housing for rent" are referred to by that heading.
function sharedLabel (paths) {
  if (!paths.length) return ''
  if (paths.length === 1) return paths[0].join(HEADER_JOIN)
  const shared = []
  for (let level = 0; level < paths[0].length; level += 1) {
    const part = paths[0][level]
    if (!paths.every(path => path[level] === part)) break
    shared.push(part)
  }
  return shared.length
    ? shared.join(HEADER_JOIN)
    : paths[0].join(HEADER_JOIN) + ' to ' + paths[paths.length - 1].join(HEADER_JOIN)
}

function resolveTable (table) {
  const { grid, placed } = expandGrid(table.rows)
  const headerRows = table.headerRows || 0
  const headerCols = table.headerCols || 0
  const width = Math.max.apply(null, grid.map(row => row.length))
  const bodyRows = range(headerRows, grid.length)
  const bodyCols = range(headerCols, width)

  const columnPaths = bodyCols.map(c => mergeHeader(range(0, headerRows).map(r => grid[r][c])))
  const rowPaths = bodyRows.map(r => mergeHeader(range(0, headerCols).map(c => grid[r][c])))
  const corner = mergeHeader(range(0, headerRows).flatMap(r => range(0, headerCols).map(c => grid[r][c])))

  const resolved = {
    id: table.id,
    title: table.title,
    note: table.note || '',
    headerRows,
    corner: corner.join(HEADER_JOIN),
    columns: columnPaths.map(path => path.join(HEADER_JOIN)),
    columnPaths,
    rows: bodyRows.map((r, index) => ({
      header: rowPaths[index].join(HEADER_JOIN),
      values: bodyCols.map(c => grid[r][c] ? grid[r][c].cell.text : '')
    })),
    rowPaths
  }

  // The printed table again, row by row, each cell carrying what clicking it selects. Rows and
  // columns are body indexes; an empty list means all of them.
  resolved.layout = table.rows.map((row, r) => placed.filter(entry => entry.r === r).map(entry => {
    const inHeaderRow = entry.r < headerRows
    const inHeaderCol = entry.c < headerCols
    const coveredRows = range(entry.r, entry.r + entry.rowspan).filter(i => i >= headerRows).map(i => i - headerRows)
    const coveredCols = range(entry.c, entry.c + entry.colspan).filter(i => i >= headerCols).map(i => i - headerCols)
    let target
    if (inHeaderRow && inHeaderCol) target = { rows: [], cols: [] }
    else if (inHeaderRow) target = { rows: [], cols: coveredCols }
    else if (inHeaderCol) target = { rows: coveredRows, cols: [] }
    else target = { rows: coveredRows, cols: coveredCols }
    return {
      text: entry.cell.text,
      colspan: entry.colspan,
      rowspan: entry.rowspan,
      header: inHeaderRow || inHeaderCol,
      // A column of figures is headed right-aligned, over its figures; a group heading isn't.
      numeric: inHeaderRow && !inHeaderCol && entry.colspan === 1,
      scope: inHeaderRow && inHeaderCol ? 'col' : inHeaderRow ? (entry.colspan > 1 ? 'colgroup' : 'col') : (inHeaderCol ? (entry.rowspan > 1 ? 'rowgroup' : 'row') : ''),
      target,
      reference: selectTable(resolved, target.rows, target.cols).reference
    }
  }))

  return resolved
}

// A selection of a resolved table: some rows, some columns, or both (an empty list is all of
// them). Returns its reference and the data it covers, flattened to one header row and one
// header column, plus a plain-text form for the places that show evidence as a line of text.
function selectTable (resolved, rows, cols) {
  const allRows = range(0, resolved.rows.length)
  const allCols = range(0, resolved.columns.length)
  const rowList = (rows || []).filter(i => allRows.includes(i))
  const colList = (cols || []).filter(i => allCols.includes(i))
  const pickedRows = rowList.length ? rowList : allRows
  const pickedCols = colList.length ? colList : allCols

  const reference = [resolved.title]
  if (rowList.length) reference.push(sharedLabel(rowList.map(i => resolved.rowPaths[i])))
  if (colList.length) reference.push(sharedLabel(colList.map(i => resolved.columnPaths[i])))

  let scope = 'table'
  if (rowList.length && colList.length) scope = rowList.length === 1 && colList.length === 1 ? 'cell' : 'cells'
  else if (rowList.length) scope = rowList.length === 1 ? 'row' : 'rows'
  else if (colList.length) scope = colList.length === 1 ? 'column' : 'columns'

  const data = {
    corner: resolved.corner,
    columns: pickedCols.map(i => resolved.columns[i]),
    rows: pickedRows.map(i => ({
      header: resolved.rows[i].header,
      values: pickedCols.map(c => resolved.rows[i].values[c])
    }))
  }

  const pairs = []
  data.rows.forEach(row => row.values.forEach((value, index) => {
    const label = []
    if (pickedRows.length > 1 || !rowList.length) label.push(row.header)
    if (pickedCols.length > 1 || !colList.length) label.push(data.columns[index])
    pairs.push((label.length ? label.join(', ') + ' ' : '') + value)
  }))

  return {
    scope,
    rows: rowList,
    cols: colList,
    reference: reference.join(', '),
    data,
    text: reference.join(', ') + ': ' + pairs.join('; ')
  }
}

// What the browser needs to preview a selection: the merged headers and the values, by index.
function tableClientData (resolved) {
  return {
    id: resolved.id,
    title: resolved.title,
    corner: resolved.corner,
    columns: resolved.columns,
    rows: resolved.rows
  }
}

module.exports = {
  HEADER_JOIN,
  resolveTable,
  selectTable,
  tableClientData
}
