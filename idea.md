SCREENS
1. To-Do List: shows the user's tasks and lets them add a new task, open an existing task, and filter tasks by completion status (All, Pending, Done).
2. To-Do Detail: shows the details of a selected task and lets the user edit it, mark it as done or not done, and delete it.

TASK
Each task has a title (required), an optional description, and a completion status (done / not done).

PERSISTENCE
Tasks must still be there after the application is closed and reopened.

VISUAL DESIGN
- The name "Curso-PSWE-07" appears in the header of the To-Do List screen and as the application/window title.
- Clean, minimal look: light background, generous white space, a single accent color for primary actions and the active filter, one sans-serif font family. Titles are larger and bolder than descriptions.
- Sufficient text contrast; touch/click targets of at least 44x44 px; responsive layout for mobile and desktop.
- To-Do List screen: header with the app name; a three-option filter (All, Pending, Done) with the active option highlighted; each row shows a status indicator and the title, and completed tasks appear with strikethrough and muted color; tapping a row opens the detail screen; a clearly visible "Add task" button opens a form with title and description fields; a short friendly empty state when there are no tasks or none match the active filter.
- To-Do Detail screen: a back control; prominent title with the description below it (muted "No description" if empty); a visible status label (Done / Pending); three actions: Edit, Mark as done / Mark as not done (label changes with the current status), and Delete. Delete uses a distinct warning color and asks for confirmation first.
- Edit mode reuses the add-task form with Save and Cancel buttons; an empty title shows a validation message.

OUT OF SCOPE
Keep the application simple and easy to use. Do not include anything not described above: no accounts, categories, due dates, priorities, search, or sync.