/**
 * Unit tests for field configuration
 * Tests that field configurations are valid and don't contain undefined values
 */

import { createThemeConfigurationField } from '../../src/fields/themeConfigurationField.js';
import { defaultThemePresets } from '../../src/presets.js';
import { lightModeField, darkModeField } from '../../src/fields/colorModeFields.js';
import type { Field } from 'payload';

describe('Field Configuration', () => {
  describe('createThemeConfigurationField', () => {
    it('should create a valid field configuration', () => {
      const field = createThemeConfigurationField({
        themePresets: defaultThemePresets,
        defaultTheme: 'cool',
        includeColorModeToggle: true,
        includeCustomCSS: true,
        includeBrandIdentity: false,
        enableAdvancedFeatures: true,
      });

      expect(field).toBeDefined();
      expect(field.type).toBe('group');
      expect('fields' in field && Array.isArray(field.fields)).toBe(true);
    });

    it('should not have undefined fields in the array', () => {
      const field = createThemeConfigurationField({
        themePresets: defaultThemePresets,
        defaultTheme: 'cool',
        includeColorModeToggle: true,
        includeCustomCSS: true,
        includeBrandIdentity: false,
        enableAdvancedFeatures: true,
      });

      function checkForUndefinedFields(fields: Field[], path = ''): void {
        expect(Array.isArray(fields)).toBe(true);

        fields.forEach((fieldItem, index) => {
          const fieldPath = `${path}[${index}]`;

          // Field should not be undefined or null
          if (fieldItem === undefined || fieldItem === null) {
            throw new Error(`Field at ${fieldPath} is undefined or null`);
          }

          expect(fieldItem).toBeDefined();
          expect(fieldItem).not.toBeNull();

          // Field must have a type
          if (!('type' in fieldItem)) {
            console.error(`Field at ${fieldPath}:`, fieldItem);
            throw new Error(`Field at ${fieldPath} is missing 'type' property`);
          }

          // Check nested fields
          if ('fields' in fieldItem && fieldItem.fields) {
            checkForUndefinedFields(fieldItem.fields as Field[], `${fieldPath}.fields`);
          }

          // Check tabs
          if ('type' in fieldItem && fieldItem.type === 'tabs' && 'tabs' in fieldItem) {
            const tabsField = fieldItem as any;
            if (Array.isArray(tabsField.tabs)) {
              tabsField.tabs.forEach((tab: any, tabIndex: number) => {
                const tabPath = `${fieldPath}.tabs[${tabIndex}]`;
                if (tab === undefined || tab === null) {
                  throw new Error(`Tab at ${tabPath} is undefined or null`);
                }
                if (tab.fields) {
                  checkForUndefinedFields(tab.fields, `${tabPath}.fields`);
                }
              });
            }
          }
        });
      }

      if ('fields' in field && field.fields) {
        checkForUndefinedFields(field.fields as Field[], 'themeConfiguration.fields');
      }
    });

    it('should have valid label types', () => {
      const field = createThemeConfigurationField({
        themePresets: defaultThemePresets,
        defaultTheme: 'cool',
        includeColorModeToggle: true,
        includeCustomCSS: true,
        includeBrandIdentity: false,
        enableAdvancedFeatures: true,
      });

      function validateLabels(fields: Field[], path = ''): void {
        fields.forEach((fieldItem, index) => {
          const fieldPath = `${path}[${index}]`;

          if ('label' in fieldItem && fieldItem.label !== undefined && fieldItem.label !== false) {
            const label = fieldItem.label;
            const labelType = typeof label;

            // Label can be: string, function, or Record<string, string>
            const isValidLabel =
              labelType === 'string' ||
              labelType === 'function' ||
              (labelType === 'object' && label !== null);

            if (!isValidLabel) {
              console.error(`Invalid label at ${fieldPath}:`, label, `(type: ${labelType})`);
            }
            expect(isValidLabel).toBe(true);
          }

          if ('fields' in fieldItem && fieldItem.fields) {
            validateLabels(fieldItem.fields as Field[], `${fieldPath}.fields`);
          }
        });
      }

      if ('fields' in field && field.fields) {
        validateLabels(field.fields as Field[], 'themeConfiguration.fields');
      }
    });

    it('should have valid component paths', () => {
      const field = createThemeConfigurationField({
        themePresets: defaultThemePresets,
        defaultTheme: 'cool',
        includeColorModeToggle: true,
        includeCustomCSS: true,
        includeBrandIdentity: false,
        enableAdvancedFeatures: true,
      });

      function validateComponentPaths(fields: Field[], path = ''): void {
        fields.forEach((fieldItem, index) => {
          const fieldPath = `${path}[${index}]`;
          const anyField = fieldItem as any;

          if (anyField?.admin?.components?.Field) {
            const component = anyField.admin.components.Field;
            const componentType = typeof component;

            // Component can be: string or object with 'path' property
            const isValidComponent =
              componentType === 'string' ||
              (componentType === 'object' &&
                component !== null &&
                'path' in component &&
                typeof component.path === 'string');

            if (!isValidComponent) {
              console.error(`Invalid component at ${fieldPath}:`, component);
            }
            expect(isValidComponent).toBe(true);

            // If it's a string, it should not be empty
            if (componentType === 'string') {
              expect(component.length).toBeGreaterThan(0);
              expect(component.trim()).toBe(component);
            }
          }

          if ('fields' in fieldItem && fieldItem.fields) {
            validateComponentPaths(fieldItem.fields as Field[], `${fieldPath}.fields`);
          }
        });
      }

      if ('fields' in field && field.fields) {
        validateComponentPaths(field.fields as Field[], 'themeConfiguration.fields');
      }
    });
  });

  describe('lightModeField', () => {
    it('should be a valid collapsible field', () => {
      expect(lightModeField).toBeDefined();
      expect(lightModeField.type).toBe('collapsible');
      expect('fields' in lightModeField && Array.isArray(lightModeField.fields)).toBe(true);
    });

    it('should not have undefined fields', () => {
      function checkFields(fields: Field[]): void {
        fields.forEach((field, index) => {
          expect(field).toBeDefined();
          expect(field).not.toBeNull();

          if ('fields' in field && field.fields) {
            checkFields(field.fields as Field[]);
          }
        });
      }

      if ('fields' in lightModeField && lightModeField.fields) {
        checkFields(lightModeField.fields as Field[]);
      }
    });
  });

  describe('darkModeField', () => {
    it('should be a valid collapsible field', () => {
      expect(darkModeField).toBeDefined();
      expect(darkModeField.type).toBe('collapsible');
      expect('fields' in darkModeField && Array.isArray(darkModeField.fields)).toBe(true);
    });

    it('should not have undefined fields', () => {
      function checkFields(fields: Field[]): void {
        fields.forEach((field, index) => {
          expect(field).toBeDefined();
          expect(field).not.toBeNull();

          if ('fields' in field && field.fields) {
            checkFields(field.fields as Field[]);
          }
        });
      }

      if ('fields' in darkModeField && darkModeField.fields) {
        checkFields(darkModeField.fields as Field[]);
      }
    });
  });
});
