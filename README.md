# Contacts: Table and Board

A Notion-style contacts database with two synced views of one dataset. Open any person from the table or the board to change their Stage or Notes, then Save or Cancel.

**Live preview:** _add link after deploy_

![Editing a contact on the board, saving, and seeing the card land in its new column and the table update](docs/demo.gif)

## Run it

Requires Node 20.19 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest + Testing Library
npm run check    # lint, typecheck, tests, production build
```

## What's built

- **Table view** with all eight fields, a sticky header and Name column, and single-line cells that truncate with a tooltip.
- **Board view** grouped into Lead, Prospect, Qualified and Customer. Qualified starts empty and stays visible.
- **One details panel** shared by both views. Stage and Notes are editable; everything else is read-only.
- **View switch** that keeps the open panel, its unsaved draft, and the selected record. The active view is in the URL.
- **Return to context:** after Save or Cancel, focus goes back to the record's row or card, a saved record briefly highlights, and a toast offers Undo.

| Table                         | Narrower desktop (1024px)                                 |
| ----------------------------- | --------------------------------------------------------- |
| ![Table view](docs/table.png) | ![Panel as an overlay at 1024px](docs/narrow-overlay.png) |

## Decisions and trade-offs

- **Explicit Save and Cancel instead of Notion's autosave.** The brief asks for it, and Stage plus Notes commit as one change. The cost is handling unsaved drafts. Cancel discards immediately because it is an explicit choice. Esc, the close button, clicking outside, or opening another record ask "Discard unsaved changes?" first, because those can be accidental.
- **Save is never disabled.** The footer says "No changes" or "Unsaved changes" instead. Disabled buttons lose focus and explain nothing. Saving with no changes just closes.
- **Save closes the panel.** Closing makes the result visible: the card moves, the row highlights, focus lands on it. The cost is reopening to edit again, which is one click.
- **A side panel, not a modal.** The list stays visible and clickable at 1280px and wider. Below that the panel overlays with a scrim and the page behind it is inert, so focus can't get lost underneath.
- **Field placement follows the job of each surface.** The table is for scanning, so it shows every field. Cards are for triage, so they show name, company and role, two labels, and the owner; missing values drop their line. The panel is for reading and editing, so nothing is truncated there.
- **Colour is reserved for Stage.** Labels are neutral so they never compete with the field the board groups by. Stage text is darker than Notion's pastels to pass 4.5:1 contrast at 12px.
- **Missing values are explicit.** Tables show a dash with screen reader text such as "No email". The panel says "Empty". A blank cell reads as "still loading".
- **No drag and drop.** WCAG 2.5.7 requires a non-drag way to move cards anyway, and a drag that commits instantly would undercut the explicit Save the brief asks for. That time went into focus handling and edge cases.
- **No UI libraries.** A native table, select and textarea cover ten rows and four stages. Focus handling lives in one hook instead of a dependency. The cost is that sorting, filtering or virtualising would need more work.

## How the views stay in sync

There is one normalized store, a `byId` map plus an `order` array, behind a reducer with a single action, `contact/updated`. Both views are read-only projections of it. The board derives its columns from the `STAGES` tuple on every render. A stage change is a field update rather than a move between lists, so a record can't be duplicated or left behind. The panel reads the live record and keeps only edited fields in its draft, so it never shows a stale copy. See `src/store/contacts.ts` and `src/lib/useDetailsPanel.ts`.

## Keyboard

| Key                      | Does                                                            |
| ------------------------ | --------------------------------------------------------------- |
| Tab / Enter              | Reach a name and open its panel; focus moves to the panel title |
| ← → in the view switcher | Switch between Table and Board                                  |
| ⌘/Ctrl + Enter           | Save                                                            |
| Esc                      | Close the panel, asking first if there are unsaved changes      |

## Left out, and what I'd do next

1. **Change stage from a card** with a small menu, which is faster than opening the panel for one field.
2. **Put the open record in the URL** so a panel can be linked and survives reload.
3. **Search, filter and sort**, plus showing or hiding table columns.
4. **Drag and drop** between columns, using the same update path and the existing Undo.
5. **Persist edits** to local storage, and design a true mobile layout below 1024px.

## Data

Ten hand-written fictional contacts using reserved `.example` domains. Each one exercises one edge case: a very long name, a long company, no email, no company or role, no owner, five labels, no labels, and empty notes.

## Time spent

_Fill in._
