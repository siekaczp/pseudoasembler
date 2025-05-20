export const OperationsTypes = {
  REG_ADR: "REG_ADR",
  REG_REG: "REG_REG",
  ADR: "ADR",
  INT: "INT",
  INT_VAL: "INT_VAL",
} as const;

export type OperationsType =
  (typeof OperationsTypes)[keyof typeof OperationsTypes];

export type OperationsObjectType = {
  [key: string]: OperationsType;
};

export type MatchGroups = {
  label: string;
  keyword: string;
  arg1: string;
  arg2: string;
};

export type LineValidation = [boolean, Instruction | null];

export type Instruction = [
  string | undefined,
  string,
  string | undefined,
  string | undefined
];

export type LabelsType = { [key: string]: number };
export type MemoryType = { [key: number]: number };

export type State = {
  registers: number[];
  ip: number;
  labels: LabelsType;
  flag: number | null;
  memory: MemoryType;
  done: boolean;
};

export type FormatType = "dec" | "hex" | "bin";

export type DisplayProps = {
  firstColumn: string;
  data: [string, number][];
  format: FormatType;
};

export interface SimulatorContextType {
  simulationState: State;
  run: (newProgram: Instruction[]) => void;
  clear: () => void;
  stepByStep: (newProgram: Instruction[]) => void;
  nextStep: () => void;
}
