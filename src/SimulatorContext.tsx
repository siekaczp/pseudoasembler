import { createContext, useContext, useEffect, useState } from "react";
import { Operations } from "./parsing.ts";
import {
  OperationsTypes,
  type Instruction,
  type LabelsType,
  type SimulatorContextType,
  type State,
} from "./types.ts";

const SimulatorContext = createContext<SimulatorContextType | undefined>(
  undefined
);

const numberOfRegisters = 16;

// eslint-disable-next-line react-refresh/only-export-components
export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const initialState: State = {
  registers: Array(numberOfRegisters).fill(0),
  ip: 0,
  labels: {},
  flag: null,
  memory: {},
  done: false,
};

type Props = {
  children: React.ReactNode;
};

export const SimulatorProvider: React.FC<Props> = ({ children }) => {
  const [simulationState, setSimuationState] = useState<State>({
    ...initialState,
  });
  const [program, setProgram] = useState<Instruction[] | null>(null);

  const clear = () => {
    setSimuationState({ ...initialState });
  };

  useEffect(clear, []);

  const parseIntValArg = (arg: string) => {
    let match = arg.match(/^(?:(\d+)\*)?INTEGER\((-?\d+)\)$/);
    if (match) {
      const x = match[1] !== undefined ? parseInt(match[1]) : 1;
      const y = parseInt(match[2]);
      return { x, y };
    }

    match = arg.match(/^(?:(\d+)\*)?INTEGER$/);
    if (match) {
      const x = match[1] !== undefined ? parseInt(match[1]) : 1;
      return { x, y: 0 };
    }

    return { x: 0, y: 0 };
  };

  const parseAdrArg = (
    arg: string,
    labels: LabelsType,
    registers: number[]
  ) => {
    if (labels[arg] !== undefined) {
      return labels[arg];
    }

    const r = arg.match(/0\((\d+)\)/)!;
    return registers[parseInt(r[1])];
  };

  const runInstruction = (
    instruction: Instruction,
    currentSimulationState: State,
    programLength: number
  ) => {
    const [label, keyword, arg1, arg2] = instruction;
    const keywordType = Operations[keyword];
    let arg1_parsed, arg2_parsed;
    const { registers, ip, labels, flag, memory } = currentSimulationState;

    const newLabels = { ...labels };
    const newRegisters = [...registers];
    const newMemory = { ...memory };
    let result = null;
    let newIp = null;

    if (keywordType === OperationsTypes.REG_ADR) {
      arg1_parsed = parseInt(arg1!);
      arg2_parsed = parseAdrArg(arg2!, labels, registers);

      switch (keyword) {
        case "A":
          result = (newRegisters[arg1_parsed] + newMemory[arg2_parsed]) | 0;
          break;
        case "C":
        case "S":
          result = (newRegisters[arg1_parsed] - newMemory[arg2_parsed]) | 0;
          break;
        case "M":
          result = (newRegisters[arg1_parsed] * newMemory[arg2_parsed]) | 0;
          break;
        case "D":
          result = (newRegisters[arg1_parsed] / newMemory[arg2_parsed]) | 0;
          break;
        case "L":
          newRegisters[arg1_parsed] = newMemory[arg2_parsed];
          break;
        case "ST":
          newMemory[arg2_parsed] = newRegisters[arg1_parsed];
          break;
        case "LA":
          newRegisters[arg1_parsed] = arg2_parsed | 0;
          break;
      }

      if (result !== null && keyword !== "C") {
        newRegisters[arg1_parsed] = result;
      }
    } else if (keywordType === OperationsTypes.REG_REG) {
      arg1_parsed = parseInt(arg1!);
      arg2_parsed = parseInt(arg2!);

      switch (keyword) {
        case "AR":
          result = (newRegisters[arg1_parsed] + newRegisters[arg2_parsed]) | 0;
          break;
        case "CR":
        case "SR":
          result = (newRegisters[arg1_parsed] - newRegisters[arg2_parsed]) | 0;
          break;
        case "MR":
          result = (newRegisters[arg1_parsed] * newRegisters[arg2_parsed]) | 0;
          break;

        case "DR":
          result = (newRegisters[arg1_parsed] / newRegisters[arg2_parsed]) | 0;
          break;
        case "LR":
          newRegisters[arg1_parsed] = newRegisters[arg2_parsed];
          break;
      }

      if (result !== null && keyword !== "CR") {
        newRegisters[arg1_parsed] = result;
      }
    } else if (keywordType === OperationsTypes.ADR) {
      arg1_parsed = parseAdrArg(arg1!, labels, registers);

      switch (keyword) {
        case "J":
          newIp = labels[arg1!];
          break;
        case "JP":
          if (flag && flag > 0) {
            newIp = labels[arg1!];
          }
          break;
        case "JZ":
          if (flag === 0) {
            newIp = labels[arg1!];
          }
          break;
        case "JN":
          if (flag && flag < 0) {
            newIp = labels[arg1!];
          }
          break;
      }
    } else if (
      keywordType === OperationsTypes.INT ||
      keywordType === OperationsTypes.INT_VAL
    ) {
      arg1_parsed = parseIntValArg(arg1!);

      const address =
        Object.keys(newMemory).length === 0
          ? 32 * programLength
          : Math.max(...Object.keys(newMemory).map(Number)) + 4;

      if (label) {
        newLabels[label] = address;
      }

      const { x, y } = arg1_parsed;

      for (let i = 0; i < x; i++) {
        newMemory[address + i * 4] = y;
      }
    }

    newIp ??= ip + 1;

    return {
      registers: newRegisters,
      labels: newLabels,
      memory: newMemory,
      ip: newIp,
      flag: result !== null ? Math.sign(result) : flag,
      done: newIp >= programLength,
    };
  };

  const run = (newProgram: Instruction[]) => {
    setProgram(newProgram);
    const newLabels: LabelsType = {};

    for (const [i, instruction] of newProgram.entries()) {
      const label = instruction[0];
      if (label) {
        newLabels[label] = i;
      }
    }

    setSimuationState(() => {
      let currentSimulationState = { ...initialState };
      currentSimulationState.labels = newLabels;

      while (currentSimulationState.ip < newProgram.length) {
        const instruction = newProgram[currentSimulationState.ip];
        currentSimulationState = runInstruction(
          instruction,
          currentSimulationState,
          newProgram.length
        );
      }

      currentSimulationState.done = true;
      return currentSimulationState;
    });
  };

  const stepByStep = (newProgram: Instruction[]) => {
    setProgram(newProgram);
    clear();

    const newLabels: LabelsType = {};

    for (const [i, instruction] of newProgram.entries()) {
      const label = instruction[0];
      if (label) {
        newLabels[label] = i;
      }
    }

    setSimuationState((currentState) => {
      const newState = { ...currentState };
      newState.labels = newLabels;
      return newState;
    });
  };

  const nextStep = () => {
    setSimuationState((currentState: State): State => {
      if (program === null) return currentState;

      const instruction = program[currentState.ip];
      const nextState = runInstruction(
        instruction,
        currentState,
        program.length
      );

      if (nextState.ip >= program.length) {
        nextState.done = true;
      }

      return nextState;
    });
  };

  return (
    <SimulatorContext.Provider
      value={{
        simulationState,
        run,
        clear,
        stepByStep,
        nextStep,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
};
