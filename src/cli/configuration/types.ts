export interface CustomScript {
  cmd: string;
  group?: string;
  alias?: string;
  description?: string;
}

export type ScriptsConfiguration = Record<string, CustomScript>;
