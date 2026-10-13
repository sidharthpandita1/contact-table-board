import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { AppProviders } from './AppProviders'
import { seedContacts } from './data/contacts'
import { resetColumnWidths } from './lib/columns'

function setup(path = '/') {
  window.history.replaceState(null, '', path)
  const user = userEvent.setup()
  render(
    <AppProviders contacts={seedContacts}>
      <App />
    </AppProviders>,
  )
  return { user }
}

const row = (id: string) => document.querySelector<HTMLElement>(`[data-record-id="${id}"]`)!
// A leaving panel drops its accessible name, so this only ever finds the live one.
const panel = () => screen.queryByRole('complementary', { name: /./ })
const column = (name: string) =>
  screen
    .getByRole('region', { name: 'Contacts board' })
    .querySelector<HTMLElement>(`section[aria-labelledby="column-${name.toLowerCase()}"]`)!
const stage = (name: string) => screen.getByRole('radio', { name })

describe('views', () => {
  it('shows the table by default and the board on switch, with an empty Qualified group', async () => {
    const { user } = setup()
    expect(screen.getByRole('tab', { name: 'Table' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('table')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Board' }))
    expect(window.location.search).toBe('?view=board')
    expect(within(column('Qualified')).getByText('No qualified contacts')).toBeInTheDocument()
  })

  it('restores the view from the URL', () => {
    setup('/?view=board')
    expect(screen.getByRole('tab', { name: 'Board' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders missing values with screen reader text', () => {
    setup()
    expect(within(row('c04')).getByText('No email')).toBeInTheDocument()
    expect(within(row('c05')).getByText('No owner')).toBeInTheDocument()
  })
})

describe('editing in the panel', () => {
  it('saves a stage change from the table and moves the card on the board', async () => {
    const { user } = setup()
    screen.getByRole('button', { name: 'Kenji Watanabe' }).focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { name: 'Kenji Watanabe', level: 2 })).toHaveFocus()
    await user.click(stage('Qualified'))
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(panel()).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Kenji Watanabe' })).toHaveFocus()
    expect(within(row('c04')).getByText('Qualified')).toBeInTheDocument()
    expect(screen.getByText('Moved Kenji Watanabe to Qualified')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Board' }))
    expect(document.querySelectorAll('[data-record-id="c04"]')).toHaveLength(1)
    expect(within(column('Qualified')).getByText('Kenji Watanabe')).toBeInTheDocument()
    expect(within(column('Lead')).queryByText('Kenji Watanabe')).not.toBeInTheDocument()
  })

  it('moves through stages with arrow keys inside the stepper', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Kenji Watanabe' }))
    stage('Lead').focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(stage('Qualified')).toBeChecked()
    expect(stage('Qualified')).toHaveFocus()
  })

  it('Cancel discards the draft immediately', async () => {
    const { user } = setup('/?view=board')
    await user.click(screen.getByRole('button', { name: 'Amara Okafor' }))
    await user.clear(screen.getByLabelText('Notes'))
    await user.type(screen.getByLabelText('Notes'), 'Draft only')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(panel()).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Amara Okafor' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Amara Okafor' }))
    expect(screen.getByLabelText('Notes')).toHaveValue(seedContacts[4].notes)
  })

  it('Esc with unsaved changes asks first; Esc again keeps editing', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Priya Menon' }))
    await user.type(screen.getByLabelText('Notes'), ' More.')
    await user.keyboard('{Escape}')

    expect(screen.getByText('Discard unsaved changes?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep editing' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Notes')).toHaveFocus()
    expect(screen.getByLabelText('Notes')).toHaveValue(`${seedContacts[0].notes} More.`)
  })

  it('opening another record with unsaved changes asks before switching', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Priya Menon' }))
    await user.click(stage('Lead'))
    await user.click(screen.getByRole('button', { name: 'Dmitri Volkov' }))

    expect(screen.getByText('to open Dmitri Volkov')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    expect(screen.getByRole('heading', { name: 'Dmitri Volkov', level: 2 })).toHaveFocus()
    expect(within(row('c01')).getByText('Customer')).toBeInTheDocument()
  })

  it('keeps the panel and its draft open across view switches', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Fatima Al-Sayed' }))
    await user.type(screen.getByLabelText('Notes'), 'Follow up next week')
    await user.click(screen.getByRole('tab', { name: 'Board' }))

    expect(screen.getByRole('heading', { name: 'Fatima Al-Sayed', level: 2 })).toBeInTheDocument()
    expect(screen.getByLabelText('Notes')).toHaveValue('Follow up next week')
    expect(row('c09')).toHaveAttribute('data-selected', 'true')
  })

  it('pages through records with J and K in on-screen order', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Priya Menon' }))
    expect(screen.getByText('1 of 10')).toBeInTheDocument()
    await user.keyboard('j')
    expect(screen.getByRole('heading', { level: 2, name: /Tomás/ })).toHaveFocus()
    await user.keyboard('k')
    expect(screen.getByRole('heading', { level: 2, name: 'Priya Menon' })).toBeInTheDocument()
  })

  it('Undo in the toast restores the previous values', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Noah Whitfield' }))
    await user.click(stage('Customer'))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(within(row('c10')).getByText('Customer')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(within(row('c10')).getByText('Lead')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Noah Whitfield' })).toHaveFocus()
  })
})

describe('moving cards without the panel', () => {
  it('Alt+Shift+Arrow moves a focused card to the next stage, and ⌘Z undoes it', async () => {
    const { user } = setup('/?view=board')
    screen.getByRole('button', { name: 'Kenji Watanabe' }).focus()
    await user.keyboard('{Alt>}{Shift>}{ArrowRight}{/Shift}{/Alt}')

    expect(within(column('Prospect')).getByText('Kenji Watanabe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kenji Watanabe' })).toHaveFocus()
    expect(screen.getByText('Moved Kenji Watanabe to Prospect')).toBeInTheDocument()

    await user.keyboard('{Meta>}z{/Meta}')
    expect(within(column('Lead')).getByText('Kenji Watanabe')).toBeInTheDocument()
  })

  it('does not move the open record while its stage has an unsaved edit', async () => {
    const { user } = setup('/?view=board')
    await user.click(screen.getByRole('button', { name: 'Kenji Watanabe' }))
    await user.click(stage('Customer'))
    screen.getByRole('button', { name: 'Kenji Watanabe' }).focus()
    await user.keyboard('{Alt>}{Shift>}{ArrowRight}{/Shift}{/Alt}')
    expect(within(column('Lead')).getByText('Kenji Watanabe')).toBeInTheDocument()
  })
})

describe('search and filters', () => {
  it('"/" focuses search, and matching ignores accents', async () => {
    const { user } = setup()
    await user.keyboard('/')
    expect(screen.getByRole('searchbox', { name: 'Search contacts' })).toHaveFocus()
    await user.keyboard('tomas')
    expect(screen.getAllByRole('row')).toHaveLength(2) // header + Tomás
    expect(screen.getByText('1 of 10')).toBeInTheDocument()
  })

  it('owner chips filter, and an empty result offers a way back', async () => {
    const { user } = setup()
    const sam = screen.getByRole('button', { name: /^Sam Lee/ })
    await user.click(sam)
    expect(sam).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('row')).toHaveLength(4) // header + 3

    await user.type(screen.getByRole('searchbox'), 'no such person')
    expect(screen.getByText('No contacts match')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getAllByRole('row')).toHaveLength(11)
  })
})

describe('resizing columns', () => {
  beforeEach(() => resetColumnWidths())

  const handle = (column: string) =>
    screen.getByRole('separator', { name: `Resize ${column} column` })
  const width = (column: string) => Number(handle(column).getAttribute('aria-valuenow'))

  it('exposes a labelled handle per column, with its width in pixels', () => {
    setup()
    expect(screen.getAllByRole('separator')).toHaveLength(8)
    expect(handle('Company')).toHaveAttribute('aria-valuetext', '208 pixels')
    expect(handle('Company')).toHaveAttribute('aria-valuemin', '120')
    expect(handle('Company')).toHaveAttribute('aria-valuemax', '420')
  })

  it('arrow keys step by 8px, Shift by 32px, Home and End jump to the limits', async () => {
    const { user } = setup()
    handle('Company').focus()
    await user.keyboard('{ArrowRight}')
    expect(width('Company')).toBe(216)
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(width('Company')).toBe(184)
    await user.keyboard('{Home}')
    expect(width('Company')).toBe(120)
    await user.keyboard('{End}')
    expect(width('Company')).toBe(420)
  })

  it('Esc reverts the width without closing the panel; Esc again closes it', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Priya Menon' }))
    handle('Role').focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(width('Role')).toBe(212)

    await user.keyboard('{Escape}')
    expect(width('Role')).toBe(196)
    expect(panel()).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(panel()).not.toBeInTheDocument())
  })

  it('keeps widths across a switch to the board and back', async () => {
    const { user } = setup()
    handle('Notes').focus()
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
    await user.click(screen.getByRole('tab', { name: 'Board' }))
    await user.click(screen.getByRole('tab', { name: 'Table' }))
    expect(width('Notes')).toBe(352)
  })

  it('offers Reset columns once a width changes, and it restores the defaults', async () => {
    const { user } = setup()
    expect(screen.queryByRole('button', { name: 'Reset columns' })).not.toBeInTheDocument()
    handle('Email').focus()
    await user.keyboard('{ArrowLeft}')

    await user.click(screen.getByRole('button', { name: 'Reset columns' }))
    expect(width('Email')).toBe(260)
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Reset columns' })).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Column widths reset')).toHaveAttribute('role', 'status')
  })
})
