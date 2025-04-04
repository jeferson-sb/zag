import type { JSX } from "preact"
import {
  Children,
  createPortal,
  useLayoutEffect,
  useReducer,
  type PropsWithChildren,
  type RefObject,
} from "preact/compat"

export interface PortalProps {
  disabled?: boolean
  container?: RefObject<HTMLElement>
  getRootNode?: () => ShadowRoot | Document | Node
}

export const Portal = (props: PropsWithChildren<PortalProps>): JSX.Element => {
  const { children, container, disabled, getRootNode } = props

  const [, forceUpdate] = useReducer((c) => c + 1, 0)

  useLayoutEffect(() => {
    forceUpdate({})
  }, [])

  const isServer = typeof window === "undefined"
  if (isServer || disabled) return <>{children}</>

  const doc = getRootNode?.().ownerDocument ?? document
  const mountNode = container?.current ?? doc.body

  return (
    <>
      {Children.map(children, (child) => {
        return createPortal(<>{child}</>, mountNode)
      })}
    </>
  )
}
