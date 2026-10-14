# Contacts: Table and Board

A Notion-style contacts database you can view as a table or a board. Both views read the same data. Open anyone from either view to change their Stage or Notes, then Save or Cancel. On the board you can also drag a card to a new stage.

Live preview: LIVE_URL

![Dragging a card to Qualified, changing a stage in the panel and watching the card travel, filtering by owner, and searching](docs/demo.gif)

## Run it

Requires Node 20.19 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest + Testing Library
npm run check    # lint, typecheck, tests, production build
```

## What's in it

What the brief asks for:

- A table with all eight fields and a sticky header and Name column. Long values are cut off with an ellipsis, and hovering shows the full text.
- A board grouped into Lead, Prospect, Qualified and Customer. Qualified starts empty and stays on screen so you can still move someone into it.
- One details panel shared by both views. Stage is a four-step control and Notes is a text area. Nothing changes on the record until you press Save.
- Closing the panel puts focus back on the row or card you came from. After a save, that record also flashes briefly in its stage colour, and a toast offers Undo.
- Contacts with gaps on purpose: one with no email, one with no company or role, one with no owner, one with no labels.
- A narrower desktop layout. At 1280px and wider the panel docks beside the view. Below that it slides over the page instead.

The brief marks the rest as optional. I added it after the core flow worked end to end, so you can judge the required part without it:

- Drag a card to another stage, or focus it and press ⌥⇧← / ⌥⇧→. Moves save immediately and offer Undo.
- Search and owner filters that apply to both views, and a pipeline bar whose counts update as people move.
- Resizable table columns. Drag an edge, double-click it to fit the content (⌥ double-click resets it), or Tab to it and use the arrow keys. Widths survive a reload, and "Reset columns" puts them all back.
- Interface sounds, with a mute button in the header.

| Table                         | Narrower desktop (1024px)                                 |
| ----------------------------- | --------------------------------------------------------- |
| ![Table view](docs/table.png) | ![Panel as an overlay at 1024px](docs/narrow-overlay.png) |

## Decisions and trade-offs

- There are two ways to change a stage, and I kept their save models apart. The panel is a form, so it gets Save and Cancel like the brief asks. Dragging a card is direct manipulation, so it saves on drop and offers Undo. A card with an unsaved stage edit in the panel can't be dragged, because pressing Save later would quietly undo wherever you'd dropped it.
- Cancel discards your edits immediately, but the other ways out ask first. Esc, the close button, clicking outside, paging with J/K and opening another record all ask "Discard unsaved changes?", since any of those can happen by accident. Cancel is a deliberate click, and asking again after it would just be annoying. Save is never greyed out. The footer says "No changes" or "Unsaved changes" so you always know where you stand.
- It's a side panel rather than a modal, because you often want to see the table while you edit. At 1280px and wider it docks and the view narrows to make room, and you can still click around behind it. Below that it overlays with a dimmed backdrop, and the page behind can't be reached until you close it.
- I only animated things when the movement tells you something: the switcher thumb sliding across, a card travelling to its new column, counts rolling over, the panel coming in from the edge. Animations are short, and you can interrupt any of them. Focus rings never animate. If reduced motion is on in your OS, the movement and resizing stop and only fades are left.
- [Kobra](https://kobra.systems) was my visual reference. Its components are paid, so I rebuilt the look myself: tinted stage pills with a ring in the same hue, hairline grid lines, layered shadows, and filter chips that join into one track. Stage is the only field with colour. Labels just get a small dot.
- I used three libraries, each for a job that's easy to get wrong by hand. Motion does the shared layout animations and respects reduced motion. dnd-kit handles pointer, touch and auto-scrolling while you drag. @web-kits/audio synthesises the sounds. The table, the text area and the stage control (a WAI-ARIA radio group) are plain HTML. The cost is bundle size, which went from about 79KB to 173KB gzipped. Library code sits in its own chunks so browsers can cache it separately from the app.
- A resizing column follows the pointer exactly and saves when you let go. If you drag past the minimum or maximum, the column stops but its edge stretches a little and springs back, so the limit feels soft. Fit, reset and Home/End animate, because your hand isn't on anything then. Dragging never does. While you drag, widths go straight into CSS variables instead of React state, so the table doesn't re-render on every frame. I counted two renders per drag.
- Every column edge is a Tab stop, following the WAI-ARIA window splitter pattern. That puts eight extra Tab stops before the first row. React Aria avoids that by hiding the edges behind a resize mode, but I think that's harder to find. I also skipped a live width readout and Shift-drag to borrow space from the next column.
- There's one store and everything else is worked out from it. Contacts sit in a `byId` map with a single `contact/updated` action. Board columns, counts, filters and paging are all computed on render, so the same person can't show up twice or look different in the two views. The panel reads the live record and its draft holds only the fields you've edited.
- Empty fields are labelled rather than left blank. The table shows a dash, and screen readers hear something like "No email". The panel says "Empty". All text colours measure at least 4.5:1 against their backgrounds.

## Sound

The sounds follow the same rules as Kobra's Sound component. Presses are short, the panel opening and closing is slower, and only outcomes like a save get a two-note phrase. Every sound is a tone synthesised in the browser, so there are no audio files to load. The speaker button in the header mutes them and remembers your choice.

They're on by default at a low volume so you actually hear them while reviewing. For a tool someone uses all day, I'd ship them off by default. Typing, hovering, scrolling, dragging a column edge and J/K paging are silent, because a sound that repeats every second turns into noise fast.

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

1. Edits only last until you reload. Column widths are the one thing saved. Next I'd keep contacts in local storage too.
2. There's no real mobile layout. It works down to about 1024px, and I'd design a proper small-screen version before going lower.
3. I'd put the open record in the URL, so you could link to a panel and it would survive a reload.
4. You can't reorder cards within a column. That needs a position field for each stage, which the data doesn't have yet.
5. The board and Motion's layout code could load lazily, which would win back most of the 80KB those two libraries add.
6. Sound could have a volume setting and a choice of packs. The patch lives in one file, so swapping it is cheap.

## Credits

The sounds are the "Minimal" patch from [@web-kits/audio](https://github.com/raphaelsalaja/audio) by Raphael Salaja (MIT). The look and the sound rules took cues from [Kobra](https://kobra.systems). Its components are paid, and I didn't use any of its code.

## Data

Ten made-up contacts on reserved `.example` domains. Each one tests an edge case: a very long name, a long company, no email, no company or role, no owner, five labels, no labels, and empty notes.

## Time spent

About 4½ hours from start to the first working version, which covers everything the brief asks for. Most of that went on planning and research. The visual pass, drag and drop and sound took about another hour. Column resizing came later, in a separate session of around 4 hours, and a lot of that was browser testing.

That's well past the suggested 3 to 4 hours. Everything after the first version is optional, which is why it's listed separately above.
