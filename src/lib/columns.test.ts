import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_WIDTHS,
  getColumnWidths,
  parseWidths,
  resetColumnWidths,
  setColumnWidth,
} from './columns'

const saved = () => window.localStorage.getItem('contacts.columns')

describe('column widths', () => {
  beforeEach(() => resetColumnWidths())

  it('clamps to each column’s limits', () => {
    setColumnWidth('company', 9999)
    expect(getColumnWidths().company).toBe(420)
    setColumnWidth('company', 10)
    expect(getColumnWidths().company).toBe(120)
  })

  it('saves only the columns that differ from their default', () => {
    setColumnWidth('role', 240)
    expect(JSON.parse(saved()!)).toEqual({ v: 1, widths: { role: 240 } })
    setColumnWidth('role', DEFAULT_WIDTHS.role)
    expect(saved()).toBeNull()
  })

  it('reset restores every default and clears storage', () => {
    setColumnWidth('notes', 600)
    setColumnWidth('email', 300)
    resetColumnWidths()
    expect(getColumnWidths()).toEqual(DEFAULT_WIDTHS)
    expect(saved()).toBeNull()
  })

  it('ignores corrupt, outdated or malformed saved data, and clamps the rest', () => {
    expect(parseWidths('{not json')).toEqual(DEFAULT_WIDTHS)
    expect(parseWidths(JSON.stringify({ v: 0, widths: { role: 300 } }))).toEqual(DEFAULT_WIDTHS)
    expect(parseWidths(JSON.stringify({ v: 1, widths: 'wide' }))).toEqual(DEFAULT_WIDTHS)
    expect(
      parseWidths(
        JSON.stringify({ v: 1, widths: { role: 'big', stage: null, notes: 5000, x: 9 } }),
      ),
    ).toEqual({ ...DEFAULT_WIDTHS, notes: 800 })
  })
})
