'use client'

import React, { createContext, useContext, useReducer } from 'react'

type SlugState = {
  localizedSlugs: Record<string, string>
}

type SlugAction = {
  type: 'SET_SLUGS'
  payload: Record<string, string>
}

export const SlugContext = createContext<{
  state: SlugState
  dispatch: React.Dispatch<SlugAction>
} | null>(null)

const slugReducer = (state: SlugState, action: SlugAction): SlugState => {
  switch (action.type) {
    case 'SET_SLUGS':
      return { ...state, localizedSlugs: action.payload }
    default:
      return state
  }
}

export const SlugProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(slugReducer, { localizedSlugs: {} })

  return <SlugContext.Provider value={{ state, dispatch }}>{children}</SlugContext.Provider>
}

export const useSlugContext = () => {
  const context = useContext(SlugContext)
  if (!context) {
    throw new Error('useSlugContext must be used within a SlugProvider')
  }
  return context
}
