export function buildMobileTaskPrompt(instruction: string, device?: string): string {
  const deviceHint = device
    ? `\nPrefer device id "${device}" if it appears in mobile_list_available_devices.`
    : "";

  return `[MOBILE UI AUTOMATION MODE]

You control Android/iOS devices ONLY via mobile-mcp tools.
Rules:
- Do NOT read, edit, or write source code files.
- Do NOT run gradle, npm, flutter, or build commands.
- Do NOT use shell unless absolutely required for device debugging.
- Start with mobile_list_available_devices when device is unknown.
- Prefer accessibility tree (mobile_list_elements_on_screen) over blind coordinate taps.
- Take mobile_take_screenshot when you need to verify state.
- When finished, reply with a concise summary: success/failure, steps taken, any screenshot paths.${deviceHint}

Task:
${instruction}`;
}
