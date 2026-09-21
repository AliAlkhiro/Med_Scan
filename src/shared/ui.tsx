import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { cx } from './cx';

type Tone = 'primary' | 'secondary' | 'danger' | 'ghost';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-[linear-gradient(135deg,#123f2d_0%,#156a53_68%,#22c7cc_100%)] text-white shadow-sm hover:brightness-105 focus-visible:ring-aqua',
  secondary: 'bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-palm',
  danger: 'bg-coral text-white hover:bg-red-700 focus-visible:ring-coral',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-palm',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, icon, tone = 'primary', type = 'button', ...props }, ref) => (
    <button
      className={cx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        toneClasses[tone],
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

type FieldShellProps = {
  children: ReactNode;
  error?: string;
  hint?: string;
  label: string;
};

function FieldShell({ children, error, hint, label }: FieldShellProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      {children}
      {error ? <span className="text-sm font-medium text-coral">{error}</span> : null}
      {!error && hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  hint?: string;
  label: string;
};

export const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, hint, label, ...props }, ref) => (
    <FieldShell error={error} hint={hint} label={label}>
      <input
        className={cx(
          'min-h-11 rounded-md border bg-white px-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-palm focus:ring-2 focus:ring-palm/20',
          error ? 'border-coral' : 'border-slate-300',
          className,
        )}
        ref={ref}
        {...props}
      />
    </FieldShell>
  ),
);
TextInput.displayName = 'TextInput';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  hint?: string;
  label: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, hint, label, ...props }, ref) => (
    <FieldShell error={error} hint={hint} label={label}>
      <textarea
        className={cx(
          'min-h-28 rounded-md border bg-white px-3 py-2 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-palm focus:ring-2 focus:ring-palm/20',
          error ? 'border-coral' : 'border-slate-300',
          className,
        )}
        ref={ref}
        {...props}
      />
    </FieldShell>
  ),
);
Textarea.displayName = 'Textarea';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  hint?: string;
  label: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, error, hint, label, ...props }, ref) => (
    <FieldShell error={error} hint={hint} label={label}>
      <select
        className={cx(
          'min-h-11 rounded-md border bg-white px-3 text-base text-ink outline-none transition focus:border-palm focus:ring-2 focus:ring-palm/20',
          error ? 'border-coral' : 'border-slate-300',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  ),
);
Select.displayName = 'Select';

type StatusTone = 'draft' | 'published' | 'neutral' | 'warning';

const statusClasses: Record<StatusTone, string> = {
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  published: 'bg-aqua/10 text-palm ring-aqua/25',
  neutral: 'bg-white text-slate-700 ring-slate-200',
  warning: 'bg-blush text-coral ring-coral/15',
};

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: StatusTone }) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusClasses[tone])}>
      {children}
    </span>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-36 place-items-center rounded-md border border-slate-200 bg-white px-5 py-8 text-center text-slate-600">
      <div className="grid justify-items-center gap-3">
        <LoaderCircle aria-hidden="true" className="h-7 w-7 animate-spin text-palm" />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({ action, message, title }: { action?: ReactNode; message: string; title: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{message}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  action,
  message,
  title = 'Something went wrong',
}: {
  action?: ReactNode;
  message: string;
  title?: string;
}) {
  return (
    <div className="rounded-md border border-coral/30 bg-white px-5 py-5">
      <div className="flex gap-3">
        <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none text-coral" />
        <div>
          <h2 className="font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{message}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
