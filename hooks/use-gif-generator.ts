import { useState, useCallback, useRef } from "react";
import {
  GifGeneratorState,
  GifOptions,
  GifPhoto,
  DEFAULT_GIF_OPTIONS,
} from "@/lib/gif-generator/types";
import { generateGif } from "@/lib/gif-generator/gif-generator";

export function useGifGenerator() {
  const [state, setState] = useState<GifGeneratorState>({
    status: "idle",
    progress: null,
    result: null,
    error: null,
  });

  const [options, setOptions] = useState<GifOptions>(DEFAULT_GIF_OPTIONS);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const generate = useCallback(async (photos: GifPhoto[]) => {
    // Clean up any previous result URL
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState({
      status: "loading",
      progress: { phase: "fetching", current: 0, total: photos.length },
      result: null,
      error: null,
    });

    try {
      const blob = await generateGif(
        photos,
        options,
        (phase, current, total) => {
          setState((prev) => ({
            ...prev,
            status: "processing",
            progress: { phase, current, total },
          }));
        },
        abortControllerRef.current.signal
      );

      setState({
        status: "complete",
        progress: null,
        result: blob,
        error: null,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "GIF generation cancelled") {
        setState({
          status: "idle",
          progress: null,
          result: null,
          error: null,
        });
      } else {
        setState({
          status: "error",
          progress: null,
          result: null,
          error: error instanceof Error ? error.message : "Failed to generate GIF",
        });
      }
    }
  }, [options]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cancel();
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setState({
      status: "idle",
      progress: null,
      result: null,
      error: null,
    });
    setOptions(DEFAULT_GIF_OPTIONS);
  }, [cancel]);

  const download = useCallback((filename: string = "animation.gif") => {
    if (!state.result) return;

    const url = URL.createObjectURL(state.result);
    resultUrlRef.current = url;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [state.result]);

  const getPreviewUrl = useCallback(() => {
    if (!state.result) return null;
    if (!resultUrlRef.current) {
      resultUrlRef.current = URL.createObjectURL(state.result);
    }
    return resultUrlRef.current;
  }, [state.result]);

  return {
    state,
    options,
    setOptions,
    generate,
    cancel,
    reset,
    download,
    getPreviewUrl,
  };
}
