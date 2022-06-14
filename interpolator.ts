import { parseTemplate } from 'url-template';

interface InterpolatorCore {
  targets: Record<string, string>
}

let coreOptions : null | InterpolatorCore = null;
export function init(targets: Record<string, string>) {
  coreOptions = {
    targets
  }
}

export function interpolate(url: string) {
  if(!coreOptions) {
    throw new Error("You should init first");
  }
  return parseTemplate(url).expand(coreOptions.targets);
}

export function destroy() {
  coreOptions = null;
}
