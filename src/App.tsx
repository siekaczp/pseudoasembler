import { useState, useEffect, useRef } from "react";
import { highlightText } from "./parsing.ts";
import { useSimulator } from "./SimulatorContext.tsx";
import Display from "./Display.tsx";
import type { Instruction, FormatType } from "./types.ts";

function App() {
  const [text, setText] = useState<string>("");
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [validated, setValidated] = useState<boolean>(true);
  const [programCode, setProgramCode] = useState<Instruction[]>([]);
  const [format, setFormat] = useState<FormatType>("dec");
  const [running, setRunning] = useState<boolean>(false);
  const { simulationState, run, clear, stepByStep, nextStep } = useSimulator();

  const highlightedRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const { highlighted, correct, program } = highlightText(text);
    setHighlightedHtml(highlighted);
    setValidated(correct);
    setProgramCode(program);
  }, [text]);

  const findLabel = (x: number) => {
    const label = Object.keys(simulationState.labels).find(
      (k) => simulationState.labels[k] === x
    );
    return label !== undefined ? `${x} (${label})` : String(x);
  };

  const highlightLine = (i: number | null) => {
    const withoutSelection = highlightedHtml.replace(
      /<b class="current-line">(.*)<\/b>/,
      "$1"
    );
    const lines = withoutSelection.split("\n");
    let notEmptyLineCounter = -1;
    for (const [j, line] of lines.entries()) {
      if (line.trim() !== "") {
        notEmptyLineCounter++;
      }
      if (notEmptyLineCounter === i) {
        lines[j] = `<b class="current-line">${line}</b>`;
        break;
      }
    }
    setHighlightedHtml(lines.join("\n"));
  };

  useEffect(() => {
    if (running) {
      if (simulationState.done) {
        highlightLine(null);
        setRunning(false);
      } else {
        highlightLine(simulationState.ip);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationState]);

  return (
    <div className="container is-fluid main-container">
      <nav className="level">
        <div className="level-left">
          <div className="level-item">
            <h1 className="title">Emulator pseudoasemblera</h1>
          </div>
        </div>
      </nav>

      <div className="columns columns-wrapper">
        <div className="column editor-column">
          <div className="box buttons">
            <button
              className="button is-light"
              onClick={() => {
                run(programCode);
              }}
              disabled={!validated || running}
            >
              Start
            </button>
            <button
              className="button is-light"
              onClick={() => {
                setRunning(false);
                clear();
                highlightLine(null);
              }}
            >
              Reset
            </button>
            <div className="select">
              <select
                id="formatSelect"
                value={format}
                onChange={(e) => setFormat(e.target.value as FormatType)}
              >
                <option value="dec">Dziesiętny</option>
                <option value="bin">Binarny</option>
                <option value="hex">Szesnastkowy</option>
              </select>
            </div>
            <button
              className="button is-light"
              onClick={() => {
                if (running) {
                  nextStep();
                } else {
                  setRunning(true);
                  stepByStep(programCode);
                }
              }}
              disabled={!validated}
            >
              {running ? "Do przodu" : "Krok po kroku"}
            </button>
          </div>
          <div className="editor-wrapper">
            <textarea
              className="textarea overlay is-focused"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Kod pseudo-asemblera..."
              spellCheck="false"
              onScroll={(e: React.UIEvent<HTMLTextAreaElement>) => {
                const target = e.currentTarget;
                const scrollTop = target.scrollTop;
                const scrollLeft = target.scrollLeft;

                if (highlightedRef.current) {
                  highlightedRef.current.scrollTop = scrollTop;
                  highlightedRef.current.scrollLeft = scrollLeft;
                }
              }}
              readOnly={running}
            />
            <pre
              className="highlight"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              ref={highlightedRef}
            ></pre>
          </div>
        </div>

        <div className="column is-one-quarter">
          <Display
            data={simulationState.registers.map((x: number, i: number) => [
              String(i),
              x,
            ])}
            firstColumn="Rejestr"
            title="Rejestry"
            format={format}
          />
        </div>
        <div className="column is-one-quarter">
          <Display
            data={Object.entries(simulationState.memory).map(([k, v]) => [
              findLabel(parseInt(k)),
              v,
            ])}
            firstColumn="Pamięć"
            title="Adres"
            format={format}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
