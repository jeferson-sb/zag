import { createMachine, guards, ref, subscribe } from "@ui-machines/core"
import { addDomEvent, nextTick, preventBodyScroll } from "@ui-machines/dom-utils"
import { hideOthers } from "aria-hidden"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { dom } from "./dialog.dom"
import { store } from "./dialog.store"
import { MachineContext, MachineState } from "./dialog.types"

const { and } = guards

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "dialog",
    initial: "unknown",
    context: {
      role: "dialog",
      hasDescription: true,
      hasTitle: true,
      uid: "234",
      trapFocus: true,
      preventScroll: true,
      isTopMostDialog: true,
      closeOnOverlayClick: true,
      closeOnEsc: true,
      restoreFocus: true,
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "closed",
            actions: "setupDocument",
          },
        },
      },
      open: {
        entry: ["checkTitleExists", "checkDescriptionExists"],
        activities: ["trapFocus", "preventScroll", "hideContentBelow", "subscribeToStore", "trackEscKey"],
        on: {
          CLOSE: "closed",
          TRIGGER_CLICK: "closed",
          OVERLAY_CLICK: {
            guard: and("isTopMost", "closeOnOverlayClick"),
            target: "closed",
          },
        },
      },
      closed: {
        on: {
          OPEN: "open",
          TRIGGER_CLICK: "open",
        },
      },
    },
  },
  {
    guards: {
      isTopMost: (ctx) => ctx.isTopMostDialog,
      closeOnOverlayClick: (ctx) => ctx.closeOnOverlayClick,
    },
    activities: {
      trackEscKey(ctx, _evt, { send }) {
        return addDomEvent(dom.getWin(ctx), "keydown", (e) => {
          if (ctx.closeOnEsc && e.key === "Escape" && ctx.isTopMostDialog) {
            ctx.onEsc?.()
            send("CLOSE")
          }
        })
      },
      preventScroll(ctx) {
        return preventBodyScroll({
          allowPinchZoom: true,
          disabled: !ctx.preventScroll,
          document: dom.getDoc(ctx),
        })
      },
      trapFocus(ctx) {
        let trap: FocusTrap
        nextTick(() => {
          if (!ctx.isTopMostDialog || !ctx.trapFocus) return
          const el = dom.getContentEl(ctx)
          trap = createFocusTrap(el, {
            document: dom.getDoc(ctx),
            escapeDeactivates: false,
            fallbackFocus: dom.getContentEl(ctx),
            allowOutsideClick: true,
            returnFocusOnDeactivate: ctx.restoreFocus,
            initialFocus: ctx.initialFocusEl,
            setReturnFocus: ctx.finalFocusEl,
          })
          try {
            trap.activate()
          } catch {}
        })
        return () => trap?.deactivate()
      },
      subscribeToStore(ctx, _evt, { send }) {
        const register = { id: ctx.uid, close: () => send("CLOSE") }
        store.add(register)
        ctx.isTopMostDialog = store.isTopMost(ctx.uid)
        const unsubscribe = subscribe(store, () => {
          ctx.isTopMostDialog = store.isTopMost(ctx.uid)
        })
        return () => {
          unsubscribe()
          store.remove(ctx.uid)
        }
      },
      hideContentBelow(ctx) {
        let unhide: VoidFunction
        nextTick(() => {
          const el = dom.getContentEl(ctx)
          try {
            unhide = hideOthers(el)
          } catch {}
        })
        return () => unhide?.()
      },
    },
    actions: {
      setupDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
      },
      checkTitleExists(ctx) {
        nextTick(() => {
          ctx.hasTitle = !!dom.getTitleEl(ctx)
        })
      },
      checkDescriptionExists(ctx) {
        nextTick(() => {
          ctx.hasDescription = !!dom.getDescriptionEl(ctx)
        })
      },
    },
  },
)
