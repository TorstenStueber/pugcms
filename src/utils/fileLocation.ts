export function extractFileLocation(content: string, position: number) {
  const lines = content.substring(0, position).split("\n");

  return {
    line: lines.length,
    row: lines[lines.length - 1].length + 1
  };
}
