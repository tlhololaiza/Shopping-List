# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
// ShoppingLists.tsx Component Pseudocode

// Define State Variables
STATE
  - loading: boolean (is the API call in progress?)
  - error: string (holds any error messages)
  - lists: array of ShoppingList objects (retrieved from API)
  - newListName: string (for the input field)

// Component Mount/User Change
FUNCTION useEffect():
  IF user is authenticated:
    SET loading to true
    CALL API to get lists for current user (getShoppingListsByUserId)
    AWAIT API response
    IF response is successful:
      SET lists state with the fetched data
    ELSE:
      SET error state with API error message
    SET loading to false

// Event Handlers
FUNCTION handleAddList(event):
  event.preventDefault()
  IF newListName is empty:
    RETURN
  SET loading to true
  CALL API to create a new list (createShoppingList) with newListName and userId
  AWAIT API response
  IF response is successful:
    ADD the new list to the lists state array
    CLEAR the newListName input
  ELSE:
    SET error state with API error message
  SET loading to false

FUNCTION handleDeleteList(listId):
  SET loading to true
  CALL API to delete the list (deleteListApi) with listId
  AWAIT API response
  IF response is successful:
    FILTER the lists state to remove the deleted list
  ELSE:
    SET error state with API error message
  SET loading to false

FUNCTION handleAddItem(listId, itemData):
  SET loading to true
  CALL API to add an item to a list (createShoppingListItem) with listId and itemData
  AWAIT API response
  IF response is successful:
    UPDATE the specific list in the lists state array with the new item
  ELSE:
    SET error state with API error message
  SET loading to false

// Render Logic
RENDER
  DIV className="shopping-lists-container"
    H2 "My Shopping Lists"
    
    // Add New List Form
    DIV className="list-creation-form"
      H3 "Create a New Shopping List"
      FORM onSubmit=handleAddList
        INPUT type="text" placeholder="List Name" value={newListName} onChange={(e) => setNewListName(e.target.value)}
        BUTTON onClick=handleAddList "Create List"

    // Display Loading/Error States
    IF loading is true:
      P "Loading lists..."
    ELSE IF error is not empty:
      P className="error-message" "Error: {error}"
    ELSE IF lists is empty:
      DIV className="empty-state"
        H3 "No Shopping Lists Yet"
        P "Create your first shopping list to get started!"
    
    // Display Shopping Lists
    ELSE:
      FOR each list in lists:
        DIV className="shopping-list-card" key={list.id}
          DIV className="list-header"
            H3 list.name
            BUTTON onClick=handleDeleteList(list.id) "Delete"
          
          // Render Items Grid
          DIV className="items-grid"
            FOR each item in list.items:
              DIV className="item-card"
                // Render item details (name, quantity, image, etc.)
                // Use the ImagePreview component for the image URL
          
          // Add New Item Form
          FORM onSubmit=handleAddItem(list.id, formData)
            // ... Form inputs for item name, quantity, category, etc.
            BUTTON "Add Item"
