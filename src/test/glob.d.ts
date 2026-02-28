declare module 'glob' {
  export function glob(
    pattern: string,
    options: { cwd: string },
    callback: (err: Error | null, files: string[]) => void
  ): void;
}
