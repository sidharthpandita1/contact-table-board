# Contacts: Table and Board

A Notion-style contacts database with two synced views of one dataset. Open anyone from the table or the board to change their Stage or Notes, then Save or Cancel. On the board you can also drag a card to a new stage.

**Live preview:** _add link after deploy_

![Dragging a card to Qualified, changing a stage in the panel and watching the card travel, filtering by owner, and searching](docs/demo.gif)

## Run it

Requires Node 20.19 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest + Testing Library
npm run check    # lint, typecheck, tests, production build
```

## What's built

- **Table** with all eight fields, a sticky header and Name column, and cells that truncate with a tooltip.
- **Resizable columns.** Drag a column's edge, double-click it to fit the content (⌥ to reset), or Tab to it and use the arrow keys. Widths are remembered, and "Reset columns" puts them all back.
- **Board** grouped into Lead, Prospect, Qualified and Customer. Qualified starts empty and stays visible as a drop target.
- **One details panel** for both views. Stage is a four-step control; Notes is a text area. Both stay a draft until Save.
- **Drag a card** to another column, or focus it and press ⌥⇧← / ⌥⇧→. Moves commit at once and offer Undo.
- **Search and owner filters** that apply to both views, plus a pipeline bar that tracks counts live.
- **Interface sounds** for opening, choosing, saving, warning and undoing, with a mute toggle in the header.
- **Return to context:** after any change, focus goes back to the record, it briefly tints in its new stage colour, and a toast offers Undo.

| Table                         | Narrower desktop (1024px)                                 |
| ----------------------------- | --------------------------------------------------------- |
| ![Table view](docs/table.png) | ![Panel as an overlay at 1024px](docs/narrow-overlay.png) |

## Decisions and trade-offs

- **Two ways to change a stage, each with its own save model.** The panel is a form, so it uses an explicit Save and Cancel, as the brief asks. Dragging a card is direct manipulation, so it commits on drop with an Undo. I never mix the two inside one surface. A card whose stage has an unsaved edit can't be dragged, because a later Save would silently overwrite the drop.
- **Cancel discards immediately; implicit exits ask first.** Cancel is an explicit choice. Esc, the close button, the scrim, paging with J/K, or opening another record ask "Discard unsaved changes?", because those can be accidental. Save is never disabled; the footer says "No changes" or "Unsaved changes" instead.
- **A side panel, not a modal.** At 1280px and wider it docks beside the view, which narrows smoothly and stays clickable. Below that it overlays with a scrim and the page behind is inert.
- **Motion has a job or it doesn't happen.** Things that move explain where something went: the switcher thumb, a card travelling to its new column, counts rolling, the panel arriving from the edge. Animations are short and interruptible, and focus never animates. Under the OS reduced-motion setting, movement and resizing stop and only fades remain.
- **Kobra was the visual bar, not the source.** Its components are paid, so I rebuilt the look: tinted stage pills with a same-hue ring, hairline grids, layered shadows, filter chips that join into one track. Colour is reserved for Stage; labels only get a small dot.
- **Three libraries, for the parts that are easy to get wrong.** Motion handles shared-layout animation and reduced motion. dnd-kit handles pointer, touch and auto-scroll. @web-kits/audio synthesises the sounds. Everything else is native: table, text area, the stage control as a WAI-ARIA radio group. The cost is bundle size, which grew from about 79KB to 173KB gzipped, split so library code caches separately from app code.
- **Resizing is direct manipulation.** The column follows the pointer exactly, with no easing, and saves on release. Past a limit the column stops, but its edge stretches a little and springs back, so you feel the limit instead of hitting a wall. Only fit, reset and Home/End animate, because nothing is under your hand then. Widths are written straight to CSS variables during a drag, so React doesn't render every frame. Each edge is a tab stop, following the WAI-ARIA window splitter pattern. React Aria hides them behind a resize mode instead, which saves eight tab stops but is harder to discover. I left out a live width readout and Shift-drag to take space from the next column.
- **One store, derived views.** A normalized `byId` map and one `contact/updated` action. Board columns, counts, filters and paging are all derived on render, so a record can't be duplicated or left behind. The panel reads the live record and keeps only edited fields in its draft.
- **Missing values are explicit.** Tables show a dash with screen reader text such as "No email". The panel says "Empty". Text colours measure 4.5:1 or better against their backgrounds.

## Sound

Sound follows the same rules as Kobra's Sound component: presses are short, surfaces are slower, and only outcomes get a two-note phrase. Each sound is a short tone synthesised in the browser, with no audio files. The speaker button in the header mutes them, and the choice is remembered. Sound is on by default at a low level so a reviewer hears it; for a tool used all day I would ship it off by default. Typing, hovering, scrolling, dragging a column edge and J/K paging are always silent, because cues that repeat become noise.

| Moment                      | Sound                                                          |
| --------------------------- | -------------------------------------------------------------- |
| Panel opens or closes       | A short rising or falling sweep                                |
| Pick a stage or a view      | A tap pitched by position, so Customer sounds higher than Lead |
| Owner chip on or off        | Two notes that rise, or fall                                   |
| Save, drop or keyboard move | Two notes upward                                               |
| "Discard unsaved changes?"  | Two close, clashing notes                                      |
| Discard                     | A lower, falling note                                          |
| A move that isn't allowed   | A dull, low thud                                               |
| Undo, copy, clear           | A falling note, a double click, a soft tick                    |
| Column edge hits its limit  | One low tick, once per drag                                    |
| Column fits or resets       | A short upward slide                                           |

## Keyboard

| Key                                       | Does                                                       |
| ----------------------------------------- | ---------------------------------------------------------- |
| Tab, Enter                                | Reach a name and open its panel                            |
| ← → in the view switcher or stage control | Switch view, or pick a stage                               |
| ⌥⇧← / ⌥⇧→ on a card or row                | Move it to the previous or next stage                      |
| J / K in the panel                        | Next or previous record, in on-screen order                |
| ⌘/Ctrl + Enter                            | Save                                                       |
| Esc                                       | Close the panel, asking first if there are unsaved changes |
| ← → on a column edge                      | Narrow or widen it by 8px, or 32px with Shift              |
| Home / End on a column edge               | Narrowest or widest                                        |
| Enter on a column edge                    | Fit to content                                             |
| Esc on a column edge                      | Undo the resize since you reached it                       |
| /                                         | Search                                                     |
| ⌘/Ctrl + Z                                | Undo the last change while its toast is showing            |

## Left out, and what I'd do next

1. **Load the board and Motion's layout code lazily** to win back most of the 80KB those two libraries add.
2. **Put the open record in the URL** so a panel can be linked and survives reload.
3. **Reorder within a column**, which would need a per-stage position field.
4. **Persist edits** to local storage, and design a true mobile layout below 1024px.
5. **A volume setting and a choice of sound packs**, since the patch is swapped in one file.

## Credits

Sounds are the "Minimal" patch from [@web-kits/audio](https://github.com/raphaelsalaja/audio) by Raphael Salaja (MIT). The visual and sound direction took cues from [Kobra](https://kobra.systems), whose components are paid; no Kobra code is used.

## Data

Ten hand-written fictional contacts using reserved `.example` domains. Each one exercises one edge case: a very long name, a long company, no email, no company or role, no owner, five labels, no labels, and empty notes.

## Time spent

_Fill in._
