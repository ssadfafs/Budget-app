# Targeted Deficiency Report: Keyboard Focus Accessibility

## Deficiency

The dashboard navigation controls were mouse-only. The `Expenses`, `Income`, and `All` tabs looked and behaved like clickable controls for mouse users, but they were implemented as non-interactive `div` elements. As a result, keyboard users could not reach these tabs with the `Tab` key and could not activate them with `Enter` or `Space`.

This affected the main navigation flow of the budget app. A user who relies on keyboard navigation could tab into the title and amount fields, but could not switch between expense, income, and all-entry views without using a mouse.

## Detection

The issue was detected through manual keyboard testing on the deployed application:

1. Opened the deployed budget app.
2. Pressed `Tab` repeatedly without using the mouse.
3. Observed that focus moved to the text and amount input fields.
4. Observed that the `Expenses`, `Income`, and `All` dashboard tabs were skipped and did not show a visible focus indicator.
5. Confirmed that these tabs could only be activated by mouse click.

Before-fix evidence:

- Screenshot 1: `Expenses` page selected by mouse, but the dashboard tabs cannot be reached with `Tab`.
- Screenshot 2: `Income` page selected by mouse, but `Tab` skips the tab controls.
- Screenshot 3: `All` page selected by mouse, showing the same keyboard-accessibility limitation.

## Literature

The Web Content Accessibility Guidelines require web content to be operable through a keyboard interface. WCAG 2.2 Success Criterion 2.1.1 states that all functionality should be available from a keyboard unless the function depends on pointer movement. WCAG also requires visible keyboard focus so users can identify which component is currently active.

MDN's keyboard accessibility guidance explains that clickable elements must be focusable, should use interactive semantics, and must be activatable by keyboard. It also recommends using native interactive HTML elements such as `button` because they provide built-in keyboard behavior.

Research also supports the importance of keyboard navigation. Schrepp (2006) found that efficient keyboard access is important for disabled users, but many websites provide insufficient keyboard support. This supports the need to avoid mouse-only controls in core user workflows.

References:

- W3C. (2023). WCAG 2.2, Success Criterion 2.1.1 Keyboard. https://www.w3.org/TR/WCAG22/#keyboard
- W3C. (2023). WCAG 2.2, Success Criterion 2.4.7 Focus Visible. https://www.w3.org/TR/WCAG22/#focus-visible
- MDN Web Docs. Keyboard accessible. https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Keyboard
- Schrepp, M. (2006). On the efficiency of keyboard navigation in Web sites. Universal Access in the Information Society, 5(2), 180-188. https://doi.org/10.1007/s10209-006-0036-x

## Implementation

The fix replaced mouse-only `div` controls with semantic `button` elements:

- Replaced the `Expenses`, `Income`, and `All` dashboard tabs with `button` elements.
- Added `role="tablist"`, `role="tab"`, `aria-controls`, and `aria-selected` to communicate tab state to assistive technologies.
- Replaced the add-entry controls with real buttons and accessible labels.
- Updated dynamically generated edit and delete controls from `div` elements to `button` elements with `aria-label` values.
- Added `:focus-visible` CSS so keyboard focus is clearly visible on tabs, add buttons, and entry action buttons.
- Preserved the existing mouse-click behavior and app layout.

Files changed:

- `index.html`
- `budget.js`
- `style.css`

## After-Fix Evidence To Capture

After deploying the fix, repeat the same keyboard test:

1. Open the app.
2. Press `Tab`.
3. Confirm that `Expenses`, `Income`, and `All` can receive keyboard focus.
4. Press `Enter` or `Space` on each tab and confirm the view changes.
5. Add an entry and confirm the edit/delete buttons can also receive focus.
6. Capture screenshots showing the visible orange focus outline on the focused controls.

Expected result:

Keyboard users can now access and operate the dashboard tabs, add buttons, and entry action buttons without using a mouse.

