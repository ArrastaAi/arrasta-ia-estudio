
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000 // Reduzido para 5 segundos

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  context?: string // Contexto para controlar notificações duplicadas
  autoShow?: boolean // Controla se o toast deve ser mostrado automaticamente
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const activeContexts = new Set<string>() // Para rastrear contextos ativos

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      // Por padrão, não mostramos mais notificações automaticamente,
      // a menos que autoShow seja explicitamente true
      if (action.toast.autoShow === false) {
        return state;
      }
      
      // Verifica se já existe uma notificação com o mesmo contexto
      if (action.toast.context && activeContexts.has(action.toast.context)) {
        return state
      }
      
      // Adiciona o contexto à lista de ativos
      if (action.toast.context) {
        activeContexts.add(action.toast.context)
      }
      
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Removendo os contextos quando os toasts são dispensados
      state.toasts.forEach((toast) => {
        if ((toastId && toast.id === toastId) || toastId === undefined) {
          if (toast.context) {
            activeContexts.delete(toast.context)
          }
        }
      })

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST": {
      if (action.toastId === undefined) {
        // Limpar todos os contextos ativos ao remover todos os toasts
        activeContexts.clear()
        return {
          ...state,
          toasts: [],
        }
      }
      
      // Encontrar e remover o contexto se o toast for removido
      const toastToRemove = state.toasts.find(t => t.id === action.toastId)
      if (toastToRemove?.context) {
        activeContexts.delete(toastToRemove.context)
      }
      
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // Por padrão, autoShow é false para impedir notificações automáticas,
  // deve ser explicitamente definido como true para mostrar
  const autoShow = props.autoShow === true
  
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: autoShow,
      autoShow,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  // Função para verificar se um contexto está sendo exibido
  const isContextActive = (context: string) => activeContexts.has(context)

  // Nova função para mostrar um toast sob demanda, útil quando autoShow=false
  const showToast = (id: string) => {
    const toast = memoryState.toasts.find(t => t.id === id)
    if (toast) {
      dispatch({
        type: "UPDATE_TOAST",
        toast: { ...toast, id, open: true },
      })
    }
  }

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    isContextActive,
    showToast,
  }
}

export { useToast, toast }
