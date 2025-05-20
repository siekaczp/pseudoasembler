import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { highlightText } from "./parsing.ts";
import { useSimulator } from "./SimulatorContext.tsx";
import Display from "./Display.tsx";
import type { Instruction, FormatType } from "./types.ts";
import { Modal } from "./Modal.tsx";

function App() {
  const [text, setText] = useState<string>("");
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [validated, setValidated] = useState<boolean>(true);
  const [programCode, setProgramCode] = useState<Instruction[]>([]);
  const [format, setFormat] = useState<FormatType>("hex");
  const [running, setRunning] = useState<boolean>(false);
  const [doneRunning, setDoneRunning] = useState<boolean>(false);
  const [isModalActive, setIsModalActive] = useState<boolean>(false);
  const { simulationState, run, clear, stepByStep, nextStep } = useSimulator();

  const highlightedRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const { highlighted, correct, program } = highlightText(text);
    setHighlightedHtml(highlighted);
    setValidated(correct);
    setProgramCode(program);
    setDoneRunning(false);
    setRunning(false);
  }, [text]);

  const findLabel = (x: number) => {
    const label = Object.keys(simulationState.labels).find(
      (k) => simulationState.labels[k] === x
    );
    return label !== undefined ? `${x} (${label})` : String(x);
  };

  const highlightLine = (i: number | null) => {
    const withoutSelection = highlightedHtml.replace(
      /<b class="current-line">(.*)<\/b>/g,
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
        setDoneRunning(true);
      } else {
        highlightLine(simulationState.ip);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationState]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setText(result.replace(/\r\n/g, "\n"));
      }
    };
    reader.readAsText(file);
  };

  const handleSaveFile = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "output.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="container is-fluid main-container">
      <nav className="level">
        <div className="level-left">
          <div className="level-item">
            <h1 className="title">Emulator pseudoasemblera</h1>
          </div>
        </div>
      </nav>

      <div className="columns columns-wrapper is-desktop">
        <div className="column editor-column">
          <div className="box">
            <div className="buttons">
              <button
                onClick={() => {
                  document.getElementById("hidden-file-input")?.click();
                }}
                className="button is-light"
              >
                Otwórz
              </button>
              <input
                type="file"
                id="hidden-file-input"
                accept=".txt"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <button onClick={handleSaveFile} className="button is-light">
                Zapisz
              </button>
              <div className="select">
                <select
                  id="formatSelect"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as FormatType)}
                >
                  <option value="hex">Szesnastkowy</option>
                  <option value="dec">Dziesiętny</option>
                  <option value="bin">Binarny</option>
                </select>
              </div>
              <button
                className="button is-light"
                onClick={() => setIsModalActive(true)}
              >
                Rozkazy
              </button>
            </div>
            <div className="buttons">
              <button
                className="button is-primary"
                onClick={() => {
                  setDoneRunning(false);
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
                  setDoneRunning(false);
                }}
              >
                Reset
              </button>
              <button
                className="button is-light"
                onClick={() => {
                  if (running) {
                    nextStep();
                  } else {
                    setDoneRunning(false);
                    setRunning(true);
                    stepByStep(programCode);
                  }
                }}
                disabled={!validated || doneRunning}
              >
                {running ? "Do przodu" : "Krok po kroku"}
              </button>
            </div>
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
              onPaste={() => {
                setTimeout(() => {
                  const el = textareaRef.current;
                  if (el) {
                    el.scrollTop = el.scrollHeight;
                  }
                });
              }}
              ref={textareaRef}
            />
            <pre
              className="highlight"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              ref={highlightedRef}
            ></pre>
          </div>
        </div>

        <div className="column is-one-quarter-desktop">
          <div className="box state-display">
            {running || doneRunning ? (
              <>
                <h2 className="subtitle">Flagi</h2>
                <table className="table is-bordered is-narrow is-fullwidth">
                  <tbody>
                    <tr>
                      <td className="has-text-left">Flaga znaku</td>
                      <td className="has-text-left">
                        {simulationState.flag !== null &&
                        simulationState.flag < 0
                          ? 1
                          : 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="has-text-left">Flaga zera</td>
                      <td className="has-text-left">
                        {simulationState.flag !== null &&
                        simulationState.flag === 0
                          ? 1
                          : 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : (
              <></>
            )}
            <h2 className="subtitle">Rejestry</h2>
            <Display
              data={simulationState.registers.map((x: number, i: number) => [
                String(i),
                x,
              ])}
              firstColumn="Rejestr"
              format={format}
            />
          </div>
        </div>
        <div className="column is-one-quarter-desktop">
          <div className="box state-display">
            <h2 className="subtitle">Pamięć</h2>
            <Display
              data={Object.entries(simulationState.memory).map(([k, v]) => [
                findLabel(parseInt(k)),
                v,
              ])}
              firstColumn="Pamięć"
              format={format}
            />
          </div>
        </div>

        <Modal active={isModalActive} close={() => setIsModalActive(false)} />
      </div>
    </div>
  );
}

export default App;
