import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { seedContacts } from './data/contacts'
import { ContactsProvider } from './store/ContactsProvider'

function setup(path = '/') {
  window.history.replaceState(null, '', path)
  const user = userEvent.setup()
  render(
    <ContactsProvider initialContacts={seedContacts}>
      <App />
    </ContactsProvider>,
  )
  return { user }
}

const row = (id: string) => document.querySelector<HTMLElement>(`[data-record-id="${id}"]`)!
const panel = () => screen.queryByRole('complementary', { name: /./ })
const column = (name: string) =>
  screen
    .getByRole('region', { name: 'Contacts board' })
    .querySelector<HTMLElement>(`section[aria-labelledby="column-${name.toLowerCase()}"]`)!

describe('views', () => {
  it('shows the table by default and the board on switch, with an empty Qualified group', async () => {
    const { user } = setup()
    expect(screen.getByRole('tab', { name: 'Table' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('table')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Board' }))
    expect(window.location.search).toBe('?view=board')
    expect(within(column('Qualified')).getByText('No contacts in Qualified')).toBeInTheDocument()
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

describe('editing', () => {
  it('saves a stage change from the table and moves the card on the board', async () => {
    const { user } = setup()
    const open = screen.getByRole('button', { name: 'Kenji Watanabe' })
    open.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { name: 'Kenji Watanabe', level: 2 })).toHaveFocus()
    await user.selectOptions(screen.getByLabelText('Stage'), 'Qualified')
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(panel()).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kenji Watanabe' })).toHaveFocus()
    expect(within(row('c04')).getByText('Qualified')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Moved Kenji Watanabe to Qualified')

    await user.click(screen.getByRole('tab', { name: 'Board' }))
    expect(document.querySelectorAll('[data-record-id="c04"]')).toHaveLength(1)
    expect(within(column('Qualified')).getByText('Kenji Watanabe')).toBeInTheDocument()
    expect(within(column('Lead')).queryByText('Kenji Watanabe')).not.toBeInTheDocument()
  })

  it('Cancel discards the draft immediately', async () => {
    const { user } = setup('/?view=board')
    await user.click(screen.getByRole('button', { name: 'Amara Okafor' }))
    await user.clear(screen.getByLabelText('Notes'))
    await user.type(screen.getByLabelText('Notes'), 'Draft only')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(panel()).not.toBeInTheDocument()
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
    await user.selectOptions(screen.getByLabelText('Stage'), 'Lead')
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

  it('Undo in the toast restores the previous values', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Noah Whitfield' }))
    await user.selectOptions(screen.getByLabelText('Stage'), 'Customer')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(within(row('c10')).getByText('Customer')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(within(row('c10')).getByText('Lead')).toBeInTheDocument()
  })
})
