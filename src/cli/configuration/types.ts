export interface CustomScript {
  cmd: string;
  group?: string;
  description?: string;
}

export type ScriptsConfiguration = Record<string, CustomScript>;
