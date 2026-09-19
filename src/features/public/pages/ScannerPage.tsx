import { useEffect, useRef, useState } from 'react';
import type { IScannerControls } from '@zxing/browser';
import { Flashlight, FlashlightOff, RotateCcw, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../../../config/env';
import { Button, ErrorState, LoadingState, StatusBadge } from '../../../shared/ui';

type ScannerState = 'loading' | 'scanning' | 'found' | 'error';

type CameraErrorDetails = {
  message: string;
  recovery: string;
};

function getCameraErrorDetails(error: unknown): CameraErrorDetails {
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
  const controlsRef = useRef<IScannerControls | null>(null);
  const scanLockedRef = useRef(false);
  const [scannerState, setScannerState] = useState<ScannerState>('loading');
  const [cameraError, setCameraError] = useState<CameraErrorDetails | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchError, setTorchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let localControls: IScannerControls | null = null;

    async function startScanner() {
      if (!videoRef.current) {
        return;
      }

      scanLockedRef.current = false;
      setScannerState('loading');
      setCameraError(null);
      setTorchSupported(false);
      setTorchEnabled(false);
      setTorchError(null);

      try {
        const { BarcodeFormat, BrowserMultiFormatReader } = await import('@zxing/browser');

        if (!isMounted || !videoRef.current) {
          return;
        }

        const reader = new BrowserMultiFormatReader(undefined, {
          delayBetweenScanAttempts: 180,
          delayBetweenScanSuccess: 500,
        });

        reader.possibleFormats = [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
        ];

        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          const barcode = result?.getText().trim();

          if (!barcode || scanLockedRef.current) {
            return;
          }

          scanLockedRef.current = true;
          controlsRef.current?.stop();

          if (isMounted) {
            setScannerState('found');
            navigate(`/product/${encodeURIComponent(barcode)}`);
          }
        });

        localControls = controls;
        controlsRef.current = controls;

        if (isMounted) {
          setTorchSupported(Boolean(controls.switchTorch));
          setScannerState('scanning');
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
      localControls?.stop();
      controlsRef.current?.stop();
      controlsRef.current = null;
      scanLockedRef.current = true;
      setTorchSupported(false);
      setTorchEnabled(false);
    };
  }, [navigate, retryCount]);

  const retryScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setTorchSupported(false);
    setTorchEnabled(false);
    setTorchError(null);
    setRetryCount((current) => current + 1);
  };

  const toggleTorch = async () => {
    const nextValue = !torchEnabled;
    const switchTorch = controlsRef.current?.switchTorch;

    if (!switchTorch) {
      return;
    }

    setTorchError(null);

    try {
      await switchTorch(nextValue);
      setTorchEnabled(nextValue);
    } catch {
      setTorchEnabled(false);
      setTorchError('Flashlight control failed. Keep the barcode well lit or retry the camera.');
    }
  };

  const statusLabel = {
    error: 'Camera unavailable',
    found: 'Barcode found',
    loading: 'Starting camera',
    scanning: 'Scanning',
  }[scannerState];

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-palm">Med Scan</p>
          <h1 className="text-2xl font-bold">Scan product barcode</h1>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-palm text-white shadow-sm">
          <ScanLine aria-hidden="true" size={24} />
        </div>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-ink text-white shadow-xl">
        <video
          aria-label="Barcode scanner camera preview"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          ref={videoRef}
        />
        <div className="absolute inset-0 bg-black/25" />
        {torchSupported ? (
          <button
            aria-label={torchEnabled ? 'Turn flashlight off' : 'Turn flashlight on'}
            className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/95 text-ink shadow-lg ring-1 ring-white/30 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-palm focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-60"
            disabled={scannerState !== 'scanning'}
            onClick={toggleTorch}
            title={torchEnabled ? 'Turn flashlight off' : 'Turn flashlight on'}
            type="button"
          >
            {torchEnabled ? <FlashlightOff aria-hidden="true" size={22} /> : <Flashlight aria-hidden="true" size={22} />}
          </button>
        ) : null}
        <div className="relative aspect-[3/4] w-full max-w-[20rem] rounded-lg border-2 border-white/75 shadow-[0_0_0_999px_rgba(15,23,42,0.28)]">
          <div className="absolute left-5 right-5 top-1/2 h-0.5 bg-coral shadow-[0_0_18px_rgba(220,107,79,0.85)]" />
          {scannerState === 'loading' ? (
            <div className="absolute inset-x-5 top-1/2 mt-8">
              <LoadingState label="Starting camera" />
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-5 flex justify-center">
            <StatusBadge tone={scannerState === 'error' ? 'warning' : scannerState === 'found' ? 'published' : 'neutral'}>
              {statusLabel}
            </StatusBadge>
          </div>
        </div>
      </div>

      {torchError ? (
        <p className="mt-3 rounded-md bg-orange-50 px-3 py-2 text-sm font-medium text-orange-800 ring-1 ring-orange-100">
          {torchError}
        </p>
      ) : null}

      {scannerState === 'error' && (
        <div className="mt-4">
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
        <div className="mt-4">
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
