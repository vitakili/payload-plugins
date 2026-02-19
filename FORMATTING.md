# VS Code Setup Guide

Abychom zajistili, že se kód automaticky formátuje při uložení, prosímte postupujte takto:

## 1. Doporučené Extensions

Nainstalujte si tyto extensions v VS Code (měli by se vám doporučit automaticky):

- **Prettier** (`esbenp.prettier-vscode`) - Code formatter
- **ESLint** (`dbaeumer.vscode-eslint`) - Linting & auto-fix
- **EditorConfig** (`EditorConfig.EditorConfig`) - Universal editor settings

## 2. VS Code Settings

Přidejte do `.vscode/settings.json` v tomto workspace (vytvoří se lokálně):

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "prettier.configPath": ".prettierrc"
}
```

## Jak funguje

- **Prettier** automaticky formátuje kód při uložení (`Ctrl+S` / `Cmd+S`)
- **ESLint** automaticky fixuje problémy s kódem
- **EditorConfig** zajišťuje konzistentní nastavení všech editorů

Tím se zabrání situacím, kdy se kód nekonzistentně formátuje následně při commitu.

## Ověření

Zkusit si formát:

1. Otevřete libovolný TypeScript soubor
2. Uložte ho (`Ctrl+S`)
3. Měl by se automaticky naformátovat podle Prettier pravidel
