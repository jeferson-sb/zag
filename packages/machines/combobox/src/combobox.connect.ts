import { dataAttr, EventKeyMap, getEventKey, getNativeEvent, validateBlur } from "@ui-machines/dom-utils"
import { getFloatingStyle } from "@ui-machines/popper"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./combobox.dom"
import { OptionGroupProps, OptionProps, Send, State } from "./combobox.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const { context: ctx } = state

  const isExpanded = state.hasTag("expanded")
  const autoFill = isExpanded && ctx.navigationValue && ctx.autoComplete
  const showClearButton = (!state.matches("idle", "unknown") || ctx.isHoveringInput) && !ctx.isInputValueEmpty
  const isFocused = state.hasTag("focused")

  return {
    setValue(value: string) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send("CLEAR_VALUE")
    },
    focus() {
      send("FOCUS")
    },
    blur() {
      dom.getInputEl(ctx)?.blur()
    },

    isFocused,
    isExpanded,

    inputValue: ctx.inputValue,

    labelProps: normalize.label<T>({
      "data-part": "label",
      htmlFor: dom.getInputId(ctx),
      id: dom.getLabelId(ctx),
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
    }),

    containerProps: normalize.element<T>({
      "data-part": "container",
      id: dom.getContainerId(ctx),
      "data-expanded": dataAttr(isExpanded),
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(ctx.disabled),
      onPointerOver() {
        send("POINTER_OVER")
      },
      onPointerLeave() {
        send("POINTER_LEAVE")
      },
    }),

    popoverProps: normalize.element<T>({
      "data-part": "popover",
      id: dom.getPopoverId(ctx),
      "data-expanded": dataAttr(isExpanded),
      hidden: !isExpanded,
      style: getFloatingStyle(!!ctx.__placement),
    }),

    inputProps: normalize.input<T>({
      "data-part": "input",
      name: ctx.name,
      disabled: ctx.disabled,
      autoFocus: ctx.autoFocus,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "off",
      spellCheck: "false",
      readOnly: ctx.readonly,
      placeholder: ctx.placeholder,
      id: dom.getInputId(ctx),
      type: "text",
      role: "combobox",
      value: autoFill ? ctx.navigationValue : ctx.inputValue,
      "aria-autocomplete": ctx.autoComplete ? "both" : "list",
      "aria-controls": isExpanded ? dom.getListboxId(ctx) : undefined,
      "aria-expanded": isExpanded,
      "aria-activedescendant": ctx.activeId ?? undefined,
      onPointerDown() {
        send("POINTER_DOWN")
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getListboxEl(ctx), dom.getToggleBtnEl(ctx)],
          fallback: ctx.pointerdownNode,
        })
        if (isValidBlur) {
          send("BLUR")
        }
      },
      onFocus() {
        send("FOCUS")
      },
      onChange(event) {
        const evt = getNativeEvent(event)
        if (evt.isComposing) return
        send({ type: "CHANGE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        const evt = getNativeEvent(event)
        if (evt.ctrlKey || evt.shiftKey || evt.isComposing) return

        let preventDefault = false

        const keymap: EventKeyMap = {
          ArrowDown(event) {
            send(event.altKey ? "ALT_DOWN" : "ARROW_DOWN")
            preventDefault = true
          },
          ArrowUp(event) {
            send(event.altKey ? "ALT_UP" : "ARROW_UP")
            preventDefault = true
          },
          ArrowLeft() {
            send("CLEAR_FOCUS")
          },
          ArrowRight() {
            send("CLEAR_FOCUS")
          },
          Home(event) {
            const isCtrlKey = event.ctrlKey || event.metaKey
            if (!isCtrlKey) {
              send("HOME")
              preventDefault = true
            }
          },
          End(event) {
            const isCtrlKey = event.ctrlKey || event.metaKey
            if (!isCtrlKey) {
              send("END")
              preventDefault = true
            }
          },
          Enter() {
            send("ENTER")
            preventDefault = true
          },
          Escape() {
            send("ESCAPE")
            preventDefault = true
          },
          Backspace() {
            send("BACKSPACE")
          },
          Delete() {
            send("DELETE")
          },
          Tab() {
            send("TAB")
          },
        }

        const key = getEventKey(event, ctx)
        const exec = keymap[key]

        if (exec) {
          exec(event)
        }

        if (preventDefault) {
          event.preventDefault()
          event.stopPropagation()
        }
      },
    }),

    buttonProps: normalize.button<T>({
      "data-part": "button",
      id: dom.getToggleBtnId(ctx),
      "aria-haspopup": "listbox",
      type: "button",
      role: "button",
      tabIndex: -1,
      "aria-label": isExpanded ? ctx.openText : ctx.closeText,
      "aria-expanded": isExpanded,
      "aria-controls": isExpanded ? dom.getListboxId(ctx) : undefined,
      disabled: ctx.disabled,
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
      onPointerDown(event) {
        send("CLICK_BUTTON")
        event.preventDefault()
      },
    }),

    listboxProps: normalize.element<T>({
      "data-part": "listbox",
      id: dom.getListboxId(ctx),
      role: "listbox",
      hidden: !isExpanded,
      "aria-labelledby": dom.getLabelId(ctx),
      onPointerDown(event) {
        // prevent options or elements within listbox from taking focus
        event.preventDefault()
      },
    }),

    clearButtonProps: normalize.button<T>({
      "data-part": "clear-button",
      id: dom.getClearBtnId(ctx),
      type: "button",
      role: "button",
      tabIndex: -1,
      disabled: ctx.disabled,
      "aria-label": ctx.clearText,
      hidden: !showClearButton,
      onPointerDown(event) {
        send("CLEAR_VALUE")
        event.preventDefault()
      },
    }),

    getOptionProps(props: OptionProps) {
      const { value, label, index, count, disabled } = props
      const id = dom.getOptionId(ctx, value, index)
      const focused = ctx.activeId === id
      const checked = ctx.selectedValue === value

      return normalize.element<T>({
        "data-part": "option",
        id,
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-checked": dataAttr(checked),
        "aria-selected": focused,
        "aria-disabled": disabled,
        "aria-posinset": count && index != null ? index + 1 : undefined,
        "aria-setsize": count,
        "data-value": value,
        "data-label": label,
        // Prefer pointermove to pointerenter to avoid interrupting the keyboard navigation
        onPointerMove() {
          if (disabled) return
          send({ type: "POINTEROVER_OPTION", id, value: label })
        },
        onPointerUp(event) {
          if (disabled) return
          event.currentTarget.click()
        },
        onClick() {
          if (disabled) return
          send({ type: "CLICK_OPTION", id, value: label })
        },
        onAuxClick(event) {
          if (disabled) return
          event.currentTarget.click()
        },
      })
    },

    getOptionGroupProps(props: OptionGroupProps) {
      const { label } = props
      return normalize.element<T>({
        "data-part": "option-group",
        role: "group",
        "aria-label": label,
      })
    },
  }
}
