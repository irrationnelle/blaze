import { parseTemplate } from 'url-template';

interface InterpolatorCore {
  targets: () => Promise<Record<string, string>>
}

let coreOptions : null | InterpolatorCore = null;
export function initInterpolator(targets: () => Promise<Record<string, string>>) {
  coreOptions = {
     targets
  }
}

export async function interpolate(url: string) {
  if(!coreOptions) {
    throw new Error("You should init first");
  }
  const targets = await coreOptions.targets();
  return parseTemplate(url).expand(targets);
}

export function destroy() {
  coreOptions = null;
}
