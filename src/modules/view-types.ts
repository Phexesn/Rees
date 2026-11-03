/** Props every module View component receives. */
export type ModuleViewProps<Output = unknown, Input = Record<string, unknown>> = {
  output: Output;
  input: Input;
  language: string;
};
