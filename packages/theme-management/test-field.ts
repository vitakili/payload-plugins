import type { Field } from 'payload'

// Test if this field configuration is valid
const testField: Field = {
  type: 'collapsible',
  label: {
    en: 'Test Label',
    cs: 'Testovací štítek',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Test description',
      cs: 'Testovací popis',
    },
  },
  fields: [
    {
      name: 'testGroup',
      type: 'group',
      fields: [
        {
          name: 'testField',
          type: 'text',
          label: {
            en: 'Test Field',
            cs: 'Testovací pole',
          },
          admin: {
            description: {
              en: 'Test field description',
              cs: 'Popis testovacího pole',
            },
          },
        },
      ],
    },
  ],
}

export default testField
