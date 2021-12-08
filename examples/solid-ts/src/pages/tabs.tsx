import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as Tabs from "@ui-machines/tabs"
import { createMemo } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    Tabs.machine.withContext({
      value: "nils",
      activationMode: "manual",
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const tabs = createMemo(() => Tabs.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div style={{ width: "100%" }}>
      <div className="tabs">
        <div className="tabs__indicator" {...tabs().tabIndicatorProps} />
        <div ref={ref} {...tabs().tablistProps}>
          <button {...tabs().getTabProps({ value: "nils" })}>Nils Frahm</button>
          <button {...tabs().getTabProps({ value: "agnes" })}>Agnes Obel</button>
          <button {...tabs().getTabProps({ value: "complex" })}>Joke</button>
        </div>
        <div {...tabs().getTabPanelProps({ value: "nils" })}>
          <p>
            Nils Frahm is a German musician, composer and record producer based in Berlin. He is known for combining
            classical and electronic music and for an unconventional approach to the piano in which he mixes a grand
            piano, upright piano, Roland Juno-60, Rhodes piano, drum machine, and Moog Taurus.
          </p>
        </div>
        <div {...tabs().getTabPanelProps({ value: "agnes" })}>
          <p>
            Agnes Caroline Thaarup Obel is a Danish singer/songwriter. Her first album, Philharmonics, was released by
            PIAS Recordings on 4 October 2010 in Europe. Philharmonics was certified gold in June 2011 by the Belgian
            Entertainment Association (BEA) for sales of 10,000 Copies.
          </p>
        </div>
        <div {...tabs().getTabPanelProps({ value: "complex" })}>
          <p>Fear of complicated buildings:</p>
          <p>A complex complex complex.</p>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
