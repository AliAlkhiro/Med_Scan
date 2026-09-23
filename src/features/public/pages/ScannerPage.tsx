import { useEffect, useRef, useState } from 'react';
import { Camera, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../../../config/env';
import { Button, ErrorState, LoadingState, StatusBadge } from '../../../shared/ui';

type ScannerState = 'loading' | 'ready' | 'scanning' | 'found' | 'error';

type CameraErrorDetails = {
  message: string;
  recovery: string;
};

type BarcodeCameraConstraints = MediaTrackConstraints & {
  focusMode?: ConstrainDOMString;
  advanced?: Array<MediaTrackConstraintSet & { focusMode?: string }>;
};

type TorchCapabilities = MediaTrackCapabilities & {
  torch?: boolean;
};

type TorchConstraints = MediaTrackConstraintSet & {
  torch?: boolean;
};

type NativeBarcodeDetector = {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
};

type NativeBarcodeDetectorConstructor = new (options?: { formats?: string[] }) => NativeBarcodeDetector;

type WindowWithBarcodeDetector = Window & {
  BarcodeDetector?: NativeBarcodeDetectorConstructor;
};

const barcodeDetectorFormats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'];

function delay(durationMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function waitForVideoMetadata(video: HTMLVideoElement, timeoutMs = 5000) {
  if (video.videoWidth && video.videoHeight) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    let isSettled = false;

    const finish = (isReady: boolean) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      window.clearTimeout(timeout);
      video.removeEventListener('loadedmetadata', handleReady);
      video.removeEventListener('canplay', handleReady);
      resolve(isReady);
    };

    const handleReady = () => {
      finish(Boolean(video.videoWidth && video.videoHeight));
    };

    const timeout = window.setTimeout(() => finish(false), timeoutMs);
    video.addEventListener('loadedmetadata', handleReady, { once: true });
    video.addEventListener('canplay', handleReady, { once: true });
  });
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  return canvas;
}

function drawVideoFrame(video: HTMLVideoElement) {
  const canvas = createCanvas(video.videoWidth, video.videoHeight);
  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas;
}

function drawVideoCrop(video: HTMLVideoElement, cropElement: HTMLElement) {
  const videoRect = video.getBoundingClientRect();
  const cropRect = cropElement.getBoundingClientRect();
  const scale = Math.max(videoRect.width / video.videoWidth, videoRect.height / video.videoHeight);
  const renderedWidth = video.videoWidth * scale;
  const renderedHeight = video.videoHeight * scale;
  const offsetX = (videoRect.width - renderedWidth) / 2;
  const offsetY = (videoRect.height - renderedHeight) / 2;
  const cropPaddingX = cropRect.width * 0.12;
  const cropPaddingY = cropRect.height * 0.12;
  const sourceLeft = (cropRect.left - videoRect.left - offsetX - cropPaddingX) / scale;
  const sourceTop = (cropRect.top - videoRect.top - offsetY - cropPaddingY) / scale;
  const sourceWidth = (cropRect.width + cropPaddingX * 2) / scale;
  const sourceHeight = (cropRect.height + cropPaddingY * 2) / scale;
  const clampedLeft = Math.max(0, sourceLeft);
  const clampedTop = Math.max(0, sourceTop);
  const clampedRight = Math.min(video.videoWidth, sourceLeft + sourceWidth);
  const clampedBottom = Math.min(video.videoHeight, sourceTop + sourceHeight);
  const canvas = createCanvas(clampedRight - clampedLeft, clampedBottom - clampedTop);

  canvas
    .getContext('2d')
    ?.drawImage(video, clampedLeft, clampedTop, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

  return canvas;
}

function drawHorizontalBand(source: HTMLCanvasElement, heightRatio: number) {
  const bandHeight = Math.round(source.height * heightRatio);
  const bandTop = Math.round((source.height - bandHeight) / 2);
  const canvas = createCanvas(source.width, bandHeight);
  canvas.getContext('2d')?.drawImage(source, 0, bandTop, source.width, bandHeight, 0, 0, canvas.width, canvas.height);

  return canvas;
}

async function detectBarcodeNatively(canvases: HTMLCanvasElement[]) {
  const BarcodeDetector = (window as WindowWithBarcodeDetector).BarcodeDetector;

  if (!BarcodeDetector) {
    return '';
  }

  const detector = new BarcodeDetector({ formats: barcodeDetectorFormats });

  for (const canvas of canvases) {
    try {
      const [barcode] = await detector.detect(canvas);
      const value = barcode?.rawValue?.trim();

      if (value) {
        return value;
      }
    } catch {
      return '';
    }
  }

  return '';
}

function getCameraErrorDetails(error: unknown): CameraErrorDetails {
  if (error instanceof Error && error.message === 'Camera metadata did not load.') {
    return {
      message: 'Camera permission was granted, but the preview did not load.',
      recovery: 'Refresh the page or tap retry camera. If another app is using the camera, close it first.',
    };
  }

  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return {
        message: 'Camera permission was denied.',
        recovery: 'Allow camera access in the browser site settings, then tap retry.',
      };
    }

    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return {
        message: 'No camera was found on this device.',
        recovery: 'Use a phone or tablet with a working rear camera, then retry.',
      };
    }

    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return {
        message: 'The camera is already in use by another app or browser tab.',
        recovery: 'Close other camera apps or tabs, then retry.',
      };
    }
  }

  return {
    message: 'The camera could not start.',
    recovery: 'Check camera permission and device availability, then retry.',
  };
}

export function ScannerPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const guideRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLockedRef = useRef(false);
  const [scannerState, setScannerState] = useState<ScannerState>('loading');
  const [cameraError, setCameraError] = useState<CameraErrorDetails | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchError, setTorchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      if (!videoRef.current) {
        return;
      }

      scanLockedRef.current = false;
      setScannerState('loading');
      setCameraError(null);
      setScanError(null);
      setTorchSupported(false);
      setTorchEnabled(false);
      setTorchError(null);

      try {
        const cameraConstraints: MediaStreamConstraints = {
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            focusMode: { ideal: 'continuous' },
            advanced: [{ focusMode: 'continuous' }],
          } as BarcodeCameraConstraints,
        };

        const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints);

        if (!isMounted || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        streamRef.current = stream;
        video.muted = true;
        video.playsInline = true;
        video.srcObject = stream;
        await Promise.race([video.play().catch(() => undefined), delay(1500)]);
        const hasVideoMetadata = await waitForVideoMetadata(video);

        if (!hasVideoMetadata) {
          throw new Error('Camera metadata did not load.');
        }

        void video.play().catch(() => undefined);

        if (isMounted) {
          const videoTrack = stream.getVideoTracks()[0];
          const capabilities = videoTrack?.getCapabilities() as TorchCapabilities | undefined;
          setTorchSupported(Boolean(capabilities?.torch));
          setScannerState('ready');
        }
      } catch (error) {
        if (isMounted) {
          setScannerState('error');
          setCameraError(getCameraErrorDetails(error));
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      scanLockedRef.current = true;
      setTorchSupported(false);
      setTorchEnabled(false);
    };
  }, [navigate, retryCount]);

  const retryScanner = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setTorchSupported(false);
    setTorchEnabled(false);
    setTorchError(null);
    setScanError(null);
    setRetryCount((current) => current + 1);
  };

  const toggleTorch = async () => {
    const nextValue = !torchEnabled;
    const videoTrack = streamRef.current?.getVideoTracks()[0];

    if (!videoTrack) {
      return;
    }

    setTorchError(null);

    try {
      await videoTrack.applyConstraints({ advanced: [{ torch: nextValue } as TorchConstraints] });
      setTorchEnabled(nextValue);
    } catch {
      setTorchEnabled(false);
      setTorchError('Flashlight control failed. Keep the barcode well lit or retry the camera.');
    }
  };

  const scanCurrentPhoto = async () => {
    const video = videoRef.current;
    const guide = guideRef.current;

    if (!video || !guide || scanLockedRef.current || scannerState !== 'ready') {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setScanError('Camera preview is paused. Tap retry camera and allow playback.');
        return;
      }
    }

    if (!video.videoWidth || !video.videoHeight) {
      setScanError('Camera preview is not ready yet.');
      return;
    }

    setScannerState('scanning');
    setScanError(null);

    try {
      const [{ BarcodeFormat, BrowserMultiFormatReader }, { DecodeHintType }] = await Promise.all([
        import('@zxing/browser'),
        import('@zxing/library'),
      ]);
      const formats = [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
      ];
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);
      const fullFrame = drawVideoFrame(video);
      const guideFrame = drawVideoCrop(video, guide);
      const candidates = [
        guideFrame,
        drawHorizontalBand(guideFrame, 0.38),
        drawHorizontalBand(guideFrame, 0.58),
        fullFrame,
        drawHorizontalBand(fullFrame, 0.32),
        drawHorizontalBand(fullFrame, 0.5),
      ];

      let barcode = await detectBarcodeNatively(candidates);

      if (!barcode) {
        for (const candidate of candidates) {
          try {
            barcode = reader.decodeFromCanvas(candidate).getText().trim();

            if (barcode) {
              break;
            }
          } catch {
            // Keep trying the remaining crops.
          }
        }
      }

      if (!barcode) {
        throw new Error('No barcode found');
      }

      scanLockedRef.current = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setScannerState('found');
      navigate(`/product/${encodeURIComponent(barcode)}`);
    } catch {
      setScanError('No barcode found. Keep the full barcode visible inside the box and scan again.');
      setScannerState('ready');
    }
  };

  const statusLabel = {
    error: 'Camera unavailable',
    found: 'Barcode found',
    loading: 'Starting camera',
    ready: 'Scan barcode',
    scanning: 'Checking photo',
  }[scannerState];

  return (
    <section className="mx-auto flex h-full w-full max-w-xl flex-col overflow-hidden px-5 py-3">
      <div className="min-h-0 flex-1 rounded-xl bg-[linear-gradient(90deg,rgba(231,53,79,0.82)_0%,rgba(34,199,204,0.92)_30%,rgba(255,255,255,0.72)_50%,rgba(34,199,204,0.92)_70%,rgba(231,53,79,0.82)_100%)] p-[3px] shadow-xl">
        <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden rounded-[0.625rem] bg-ink text-white">
          <video
            aria-label="Barcode scanner camera preview"
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            ref={videoRef}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,63,45,0.12)_0%,rgba(16,36,31,0.28)_100%)]" />
          <div className="absolute left-4 top-4 z-10 rounded-lg border border-white/15 bg-ink/35 p-2 shadow-xl backdrop-blur-md">
            <StatusBadge tone={scannerState === 'error' ? 'warning' : scannerState === 'found' ? 'published' : 'neutral'}>
              {statusLabel}
            </StatusBadge>
          </div>
          {scannerState !== 'error' ? (
            <div className="absolute inset-x-4 bottom-4 z-10 flex justify-center">
              <Button
                className="min-h-12 min-w-44 border border-white/15 bg-white/15 px-5 text-white shadow-lg backdrop-blur-md hover:bg-white/25 focus-visible:ring-aqua focus-visible:ring-offset-ink"
                disabled={scannerState !== 'ready'}
                icon={<Camera aria-hidden="true" size={18} />}
                onClick={scanCurrentPhoto}
              >
                Capture photo
              </Button>
            </div>
          ) : null}
          {torchSupported ? (
            <button
              aria-label={torchEnabled ? 'Turn flashlight off' : 'Turn flashlight on'}
              className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-60"
              disabled={scannerState !== 'ready'}
              onClick={toggleTorch}
              title={torchEnabled ? 'Turn flashlight off' : 'Turn flashlight on'}
              type="button"
            >
              {torchEnabled ? <FlashlightOff aria-hidden="true" size={22} /> : <Flashlight aria-hidden="true" size={22} />}
            </button>
          ) : null}
          <div
            className="relative aspect-[3/4] h-[min(100%,24rem)] max-h-[calc(100%-6rem)] max-w-[min(18rem,76vw)] overflow-hidden rounded-lg border border-white/20 shadow-[0_0_0_999px_rgba(18,63,45,0.28),0_0_34px_rgba(34,199,204,0.28),inset_0_0_28px_rgba(34,199,204,0.12)]"
            ref={guideRef}
          >
            <div className="scanner-sweep pointer-events-none absolute inset-x-0 top-0 h-full">
              <div className="absolute left-4 right-4 top-1/2 h-px bg-aqua shadow-[0_0_18px_rgba(34,199,204,0.95),0_0_38px_rgba(231,53,79,0.45)]" />
              <div className="absolute left-8 right-8 top-1/2 h-10 -translate-y-1/2 bg-[linear-gradient(180deg,transparent_0%,rgba(34,199,204,0.16)_48%,rgba(231,53,79,0.1)_52%,transparent_100%)]" />
            </div>
            <div className="absolute left-5 right-5 top-1/2 h-0.5 bg-coral shadow-[0_0_18px_rgba(231,53,79,0.85)]" />
            <div aria-hidden="true" className="absolute left-0 top-0 h-12 w-12 border-l-2 border-t-2 border-aqua shadow-[-6px_-6px_18px_rgba(34,199,204,0.45)]" />
            <div aria-hidden="true" className="absolute right-0 top-0 h-12 w-12 border-r-2 border-t-2 border-aqua shadow-[6px_-6px_18px_rgba(34,199,204,0.45)]" />
            <div aria-hidden="true" className="absolute bottom-0 left-0 h-12 w-12 border-b-2 border-l-2 border-coral shadow-[-6px_6px_18px_rgba(231,53,79,0.38)]" />
            <div aria-hidden="true" className="absolute bottom-0 right-0 h-12 w-12 border-b-2 border-r-2 border-coral shadow-[6px_6px_18px_rgba(231,53,79,0.38)]" />
            {scannerState === 'loading' ? (
              <div className="absolute inset-x-5 top-1/2 mt-8">
                <LoadingState label="Starting camera" />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {torchError ? (
        <p className="mt-2 flex-none rounded-md bg-orange-50 px-3 py-2 text-sm font-medium text-orange-800 ring-1 ring-orange-100">
          {torchError}
        </p>
      ) : null}

      {scanError ? (
        <p className="mt-2 flex-none rounded-md bg-orange-50 px-3 py-2 text-sm font-medium text-orange-800 ring-1 ring-orange-100">
          {scanError}
        </p>
      ) : null}

      {scannerState === 'error' && (
        <div className="mt-2 flex-none">
          <ErrorState
            action={
              <Button icon={<RotateCcw aria-hidden="true" size={17} />} onClick={retryScanner} tone="secondary">
                Retry camera
              </Button>
            }
            message={`${cameraError?.message ?? 'The camera could not start.'} ${
              cameraError?.recovery ?? 'Check camera permission and try again.'
            }`}
            title="Camera unavailable"
          />
        </div>
      )}

      {!isSupabaseConfigured && (
        <div className="mt-2 flex-none">
          <ErrorState
            action={<Button icon={<RotateCcw aria-hidden="true" size={17} />} onClick={retryScanner} tone="secondary">Retry</Button>}
            message="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before connecting lookup data."
            title="Supabase settings missing"
          />
        </div>
      )}
    </section>
  );
}
