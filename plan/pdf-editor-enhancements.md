# Plan: PDF Editor Enhancements

This plan details the steps to enhance the `ConfigEditor` component in `src/components/document-generation/pdf-builder.tsx`. The goal is to allow adding, removing, and editing properties (including styles) of PDF elements.

## Phase 1: Core Functionality - Adding and Removing Elements

1.  [ ] **Refine `handleAddElement` function:**
    - [ ] Enable adding all `ElementType` (View, Text, Image, Link, Note) not just Page.
    - [ ] Ensure elements can be added to any valid parent (Document, Page, View, Link), not just 'root'.
    - [ ] When adding an element, provide sensible default props and styles.
    - [ ] Update the UI to allow selecting the type of element to add and the parent.
2.  [ ] **Complete `handleRemoveElement` function:**
    - [ ] Implement logic to recursively find and remove an element by its `id` from the nested `children` array within the `config`.
    - [ ] Ensure `parentId` is correctly used to locate the element in the parent's `children` array.
    - [ ] Update `localConfig` and call `onChange` with the modified config.
3.  [ ] **UI for Adding/Removing Elements:**
    - [ ] For each element displayed in `renderChildEditor`, add "+" buttons for each permissible child type (e.g., a 'View' can have 'Text', 'Image', 'View', 'Link' as children).
    - [ ] Ensure the "Remove" button (`MinusIcon`) correctly calls `handleRemoveElement` with the element's `id` and `parentId`.

## Phase 2: Element Property Editing

1.  [ ] **Element Selection:**
    - [ ] Implement a mechanism to "select" an element in the `ConfigEditor`.
    - [ ] Store the `id` of the currently selected element in the `ConfigEditor`'s state.
    - [ ] Highlight the selected element in the tree view.
2.  [ ] **Property Editor UI:**
    - [ ] Create a new component (e.g., `ElementPropertyEditor`).
    - [ ] This component will receive the selected element's data.
    - [ ] Dynamically render input fields based on the `ElementType` and its specific `props`.
      - **TextElement:** Inputs for `content`, `props.wrap`, `props.style` (e.g., `fontSize`, `fontFamily`).
      - **ImageElement:** Inputs for `props.source`, `props.style` (e.g., `width`, `height`).
      - **LinkElement:** Inputs for `props.src`, `props.style`.
      - **ViewElement:** Inputs for `props.style` (e.g., `flexDirection`, `backgroundColor`).
      - **NoteElement:** Input for `props.children` (content of the note).
      - **PageElement:** Inputs for `props.size`, `props.orientation`, `props.style`.
      - **DocumentElement:** Inputs for `props.title`, `props.author`, etc.
    - [ ] For `style` props, consider a simple JSON editor (e.g., a `textarea`) initially, or individual fields for common styles.
3.  [ ] **Update Configuration on Property Change:**
    - [ ] Create a `handlePropertyChange(elementId, propertyPath, newValue)` function.
    - [ ] This function will find the element by `id` in the `config`.
    - [ ] It will update the specified property (which could be nested, e.g., `props.style.fontSize`).
    - [ ] Update `localConfig` and call `onChange` with the modified config.

## Phase 3: Styling and UX Improvements

1.  [ ] **Advanced Style Editor (Optional - Post-Core Functionality):**
    - [ ] Implement a more user-friendly style editor instead of raw JSON/text input.
    - [ ] Could involve dropdowns for predefined values (e.g., `fontFamily`), color pickers, etc.
2.  [ ] **Drag and Drop Reordering (Optional - Post-Core Functionality):**
    - [ ] Allow users to reorder elements within their parent and between compatible parents using drag and drop.
3.  [ ] **State Management:**
    - [ ] Review `localConfig` and `config` interaction. Ensure changes are propagated correctly and efficiently.
    - [ ] Consider using `useReducer` for more complex state management within `ConfigEditor` if `useState` becomes unwieldy.
4.  [ ] **Font Handling:**
    - [ ] Allow managing registered fonts (`Font.register`) through the UI if `config.font` is to be dynamic.

## Implementation Notes:

- **Unique IDs:** Ensure all elements (newly added or existing) have unique IDs. `crypto.randomUUID()` is good.
- **Recursive Operations:** Helper functions for finding, updating, and removing elements in the nested `children` structure will be crucial.
- **Component Breakdown:** Break down `ConfigEditor` into smaller, manageable sub-components as complexity grows (e.g., `ElementTreeItem`, `PropertyEditorPanel`).
- **UI Components:** Leverage existing UI components from `/src/components/ui` where possible.
- **Error Handling:** Add robust error handling for operations like finding non-existent parents or elements.
- **Type Safety:** Maintain strong type safety throughout the implementation.
