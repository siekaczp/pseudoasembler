import {
  type OperationsObjectType,
  type OperationsType,
  type Instruction,
  type LineValidation,
  type MatchGroups,
  OperationsTypes,
} from "./types.ts";

export const Operations: OperationsObjectType = {
  A: OperationsTypes.REG_ADR,
  AR: OperationsTypes.REG_REG,
  S: OperationsTypes.REG_ADR,
  SR: OperationsTypes.REG_REG,
  M: OperationsTypes.REG_ADR,
  MR: OperationsTypes.REG_REG,
  D: OperationsTypes.REG_ADR,
  DR: OperationsTypes.REG_REG,
  C: OperationsTypes.REG_ADR,
  CR: OperationsTypes.REG_REG,
  L: OperationsTypes.REG_ADR,
  LR: OperationsTypes.REG_REG,
  ST: OperationsTypes.REG_ADR,
  LA: OperationsTypes.REG_ADR,
  J: OperationsTypes.ADR,
  JP: OperationsTypes.ADR,
  JZ: OperationsTypes.ADR,
  JN: OperationsTypes.ADR,
  DC: OperationsTypes.INT_VAL,
  DS: OperationsTypes.INT,
};

const lineRegEx =
  /^(\s*(?<label>[A-Z_][A-Z0-9_]*)\s+)?(?<keyword>[A-Z]+)\s+(?<arg1>[A-Z_0-9()\-*]+)(?:\s*,\s*(?<arg2>[A-Z_0-9()\-*]+))?\s*$/;

const validateReg = (arg: string) =>
  /^\d+$/.test(arg) && parseInt(arg) >= 0 && parseInt(arg) < 16;
const validateAdr = (arg: string, labels: Set<string>) =>
  labels.has(arg) || /^0\(\d+\)$/.test(arg);
const validateInt = (arg: string) => /^([123456789]\d*\*)?INTEGER$/.test(arg);
const validateIntVal = (arg: string) =>
  /^([123456789]\d*\*)?INTEGER\(-?\d+\)$/.test(arg);

const validateArgs = (
  keywordType: OperationsType,
  arg1: string,
  arg2: string,
  labels: Set<string>
): boolean => {
  if (keywordType === OperationsTypes.REG_ADR) {
    return Boolean(
      arg1 && validateReg(arg1) && arg2 && validateAdr(arg2, labels)
    );
  } else if (keywordType === OperationsTypes.REG_REG) {
    return Boolean(arg1 && validateReg(arg1) && arg2 && validateReg(arg2));
  } else if (keywordType === OperationsTypes.ADR) {
    return Boolean(arg1 && validateAdr(arg1, labels) && !arg2);
  } else if (keywordType === OperationsTypes.INT) {
    return Boolean(arg1 && validateInt(arg1) && !arg2);
  } else if (keywordType === OperationsTypes.INT_VAL) {
    return Boolean(arg1 && validateIntVal(arg1) && !arg2);
  }

  return false;
};

export const validateLines = (
  lines: string[],
  userDefinedWords: Set<string>,
  knownKeywords: Set<string>
): LineValidation[] => {
  return lines.map((line: string) => {
    if (line.trim() === "") return [true, null];

    const match = line.match(lineRegEx);

    if (!match) return [false, null];

    const { label, keyword, arg1, arg2 } = match.groups as MatchGroups;

    if (label && !userDefinedWords.has(label)) return [false, null];
    if (!knownKeywords.has(keyword)) return [false, null];

    const keywordType: OperationsType = Operations[keyword];
    const validationResult = validateArgs(
      keywordType,
      arg1,
      arg2,
      userDefinedWords
    );
    const parsingResult = validationResult
      ? ([label, keyword, arg1, arg2] as Instruction)
      : null;

    return [validationResult, parsingResult];
  });
};

export const highlightText = (input: string) => {
  const userDefinedWords = new Set<string>();
  const keywords = new Set(Object.keys(Operations));

  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  for (const line of lines) {
    const match = line.trim().match(lineRegEx);
    if (match && match.groups?.label) {
      userDefinedWords.add(match.groups.label);
    }
  }

  const lineValidation = validateLines(lines, userDefinedWords, keywords);

  let highlighted = lines
    .map((line, i) => {
      const content = line || " ";
      return lineValidation[i][0] || line === ""
        ? content
        : `<span class="invalid-line">${content}</span>`;
    })
    .join("\n");

  for (const word of userDefinedWords) {
    const wordRegex = new RegExp(`\\b${word}\\b`, "g");
    highlighted = highlighted.replace(
      wordRegex,
      `<span class="user-label">${word}</span>`
    );
  }

  highlighted = highlighted.replace(
    /\bINTEGER/g,
    '<span class="keyword">INTEGER</span>'
  );

  for (const word of keywords) {
    const wordRegex = new RegExp(`\\b${word}\\b`, "gu");
    highlighted = highlighted.replace(
      wordRegex,
      `<span class="keyword">${word}</span>`
    );
  }

  const correct = lineValidation.every((x) => x[0]);
  const program = correct
    ? lineValidation.map((x) => x[1]).filter((x) => x != null)
    : [];

  return { highlighted, correct, program };
};
