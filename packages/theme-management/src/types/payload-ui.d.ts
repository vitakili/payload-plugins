declare module '@payloadcms/ui' {
  import React from 'react'

  export const Button: React.FC<any>
  export const Drawer: React.FC<any>
  export function useModal(): {
    openModal: (slug?: string) => void
    closeModal: (slug?: string) => void
  }
  export function useField<T = any>(opts: any): { value: T; setValue: (v: T) => void }
  export function useForm(): any
  export function useFormFields<T = any>(selector?: (args: any) => T): T
}
