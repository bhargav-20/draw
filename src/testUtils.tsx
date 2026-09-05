import { act } from "react";
import { createRoot } from "react-dom/client";

import type { ReactElement } from "react";

// Minimal React test helpers on top of react-dom (jsdom). The declared
// `@testing-library/react` needs its `@testing-library/dom` peer, which is
// not installed – these cover what our component tests need.

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

export const mount = async (element: ReactElement) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(element);
  });
  return {
    container,
    rerender: (next: ReactElement) =>
      act(async () => {
        root.render(next);
      }),
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
};

export const renderHook = async <P, R>(
  hook: (props: P) => R,
  initialProps: P,
) => {
  const result = { current: undefined as unknown as R };
  const Harness = ({ props }: { props: P }) => {
    result.current = hook(props);
    return null;
  };
  const mounted = await mount(<Harness props={initialProps} />);
  return {
    result,
    rerender: (props: P) => mounted.rerender(<Harness props={props} />),
    unmount: mounted.unmount,
  };
};

export const click = (element: Element) =>
  act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

/** sets the value the way a user would (React listens to native `input`) */
export const type = (input: HTMLInputElement, value: string) =>
  act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

export const keyDown = (element: Element, key: string) =>
  act(async () => {
    element.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  });

export const blur = (element: Element) =>
  act(async () => {
    element.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
  });

/** lets fake-indexeddb (setImmediate) and chained promises settle */
export const settle = async (rounds = 20) => {
  for (let i = 0; i < rounds; i++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
};

export const waitFor = async (
  assertion: () => Promise<void> | void,
  { attempts = 50 }: { attempts?: number } = {},
) => {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      await assertion();
      return;
    } catch (error) {
      lastError = error;
      await settle(5);
    }
  }
  throw lastError;
};

export const queryByText = (
  container: ParentNode,
  text: string,
  selector = "*",
): HTMLElement | null =>
  Array.from(container.querySelectorAll<HTMLElement>(selector)).find(
    (element) =>
      element.childElementCount === 0 && element.textContent?.trim() === text,
  ) ?? null;
