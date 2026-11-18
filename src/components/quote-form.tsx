"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ChevronDown,
  CircleAlert,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { quote } from "@/content/quote";
import { GlassFold } from "./glass-fold";
import { STILL_BLUE } from "./glass-presets";

const controlBase =
  "w-full rounded-[12px] bg-ink/8 text-[16px] ring-1 ring-line transition-shadow duration-300 placeholder:text-muted hover:ring-ink/30";
const control = `${controlBase} h-12 px-4`;
const optionalTag = <span className="text-muted"> (Optional)</span>;
const panelBackground = (
  <GlassFold {...STILL_BLUE} className="absolute inset-0 -z-10" />
);

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FormSection({
  number,
  title,
  optional,
  children,
}: {
  number: number;
  title: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-t border-line pt-6 pb-12 first-of-type:border-t-0 first-of-type:pt-0">
      <legend className="contents">
        <span className="flex items-baseline gap-4 text-[18px] font-medium tracking-[-0.01em]">
          <span className="font-mono text-[13px] font-normal tracking-[0.08em] text-muted">
            {String(number).padStart(2, "0")}
          </span>
          <span>
            {title}
            {optional && <span className="font-normal">{optionalTag}</span>}
          </span>
        </span>
      </legend>
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  htmlFor,
  error,
  errorId,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[15px]">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="flex items-center gap-2 text-[14px]">
          <CircleAlert
            size={16}
            strokeWidth={1.5}
            className="flex-none text-accent"
            aria-hidden="true"
          />
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  id,
  name,
  children,
}: {
  id: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        defaultValue=""
        className={`${control} appearance-none pr-11`}
      >
        {children}
      </select>
      <ChevronDown
        size={18}
        strokeWidth={1.5}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
  );
}

export function QuoteForm() {
  const uid = useId();
  const ids = {
    need: `${uid}-need`,
    upload: `${uid}-upload`,
    nda: `${uid}-nda`,
    quantity: `${uid}-quantity`,
    material: `${uid}-material`,
    details: `${uid}-details`,
    name: `${uid}-name`,
    email: `${uid}-email`,
    company: `${uid}-company`,
    phone: `${uid}-phone`,
  };

  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [previewing, setPreviewing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewing) previewRef.current?.focus();
  }, [previewing]);

  const addFiles = (incoming: File[]) => {
    const rejected: string[] = [];
    const accepted = incoming.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!quote.files.extensions.includes(extension)) {
        rejected.push(`${file.name}: this file type isn't accepted.`);
        return false;
      }
      if (file.size > quote.files.maxBytes) {
        rejected.push(`${file.name}: this file is larger than 50 MB.`);
        return false;
      }
      return true;
    });
    setFileErrors(rejected);
    setFiles((current) => {
      const isNew = (file: File) =>
        !current.some(
          (other) => other.name === file.name && other.size === file.size,
        );
      return [...current, ...accepted.filter(isNew)];
    });
  };

  const onFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    // Lets someone pick the same file again after removing it.
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.namedItem("name") as HTMLInputElement;
    const email = form.elements.namedItem("email") as HTMLInputElement;

    const nextErrors: typeof errors = {};
    if (!name.value.trim()) nextErrors.name = "Please enter your name.";
    if (!email.value.trim())
      nextErrors.email = "Please enter your email address.";
    else if (!email.validity.valid)
      nextErrors.email = "Please enter a valid email address.";
    setErrors(nextErrors);

    if (nextErrors.name) name.focus();
    else if (nextErrors.email) email.focus();
    else {
      // NOT CONNECTED: send new FormData(form) and `files` to the back-end here.
      setPreviewing(true);
    }
  };

  return (
    // A navy panel with the About page's still glass background marks out the form.
    <div className="panel-dark relative isolate overflow-hidden rounded-lg">
      {panelBackground}
      {previewing && (
        <div
          ref={previewRef}
          tabIndex={-1}
          role="status"
          className="flex flex-col items-start gap-4 p-6 outline-none md:p-10"
        >
          <p className="type-eyebrow">Design preview</p>
          <h2 className="type-statement max-w-[24ch] text-balance">
            This form isn&apos;t connected yet, so nothing was sent.
          </h2>
          <p className="text-[15px] leading-snug text-ink/70">
            Once it&apos;s live, the confirmation message will appear here.
          </p>
          <button
            type="button"
            onClick={() => setPreviewing(false)}
            className="mt-2 inline-flex h-12 items-center rounded-[8px] bg-ink px-6 text-[15px] text-navy transition-opacity duration-300 hover:opacity-85"
          >
            Back to the form
          </button>
        </div>
      )}

      {/* Hidden rather than removed, so going back keeps what was typed. */}
      <form
        onSubmit={onSubmit}
        noValidate
        hidden={previewing}
        className="p-5 md:p-10"
      >
        <FormSection number={1} title={quote.need.heading}>
          <Field
            label={<span className="sr-only">{quote.need.heading}</span>}
            htmlFor={ids.need}
          >
            <Select id={ids.need} name="need">
              <option value="" disabled>
                {quote.need.placeholder}
              </option>
              {quote.need.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          </Field>
        </FormSection>

        <FormSection number={2} title={quote.files.heading} optional>
          <label
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              )
                setDragging(false);
            }}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-start gap-4 rounded-md border border-dashed p-6 transition-colors duration-300 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent md:p-8 ${
              dragging
                ? "border-ink bg-ink/12"
                : "border-ink/25 bg-ink/5 hover:border-ink/50"
            }`}
          >
            <input
              id={ids.upload}
              type="file"
              name="files"
              multiple
              accept={quote.files.extensions
                .map((extension) => `.${extension}`)
                .join(",")}
              onChange={onFileInput}
              className="sr-only"
            />
            <Upload size={24} strokeWidth={1.25} aria-hidden="true" />
            <span>
              <span className="block text-[16px]">{quote.files.prompt}</span>
              <span className="mt-1 block text-[14px] leading-snug text-ink/70">
                {quote.files.formats}
              </span>
            </span>
          </label>

          {fileErrors.length > 0 && (
            <ul role="alert" className="flex flex-col gap-2 text-[14px]">
              {fileErrors.map((message) => (
                <li key={message} className="flex items-start gap-2">
                  <CircleAlert
                    size={16}
                    strokeWidth={1.5}
                    className="mt-0.5 flex-none text-accent"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words">{message}</span>
                </li>
              ))}
            </ul>
          )}

          {files.length > 0 && (
            <ul aria-label="Selected files" className="flex flex-col gap-2">
              {files.map((file) => (
                <li
                  key={`${file.name}-${file.size}`}
                  className="flex items-center gap-3 rounded-[12px] bg-ink/8 py-1 pr-1 pl-4"
                >
                  <FileText
                    size={18}
                    strokeWidth={1.25}
                    className="flex-none"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-[15px]">
                    {file.name}
                  </span>
                  <span className="flex-none font-mono text-[13px] text-muted">
                    {formatSize(file.size)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() =>
                      setFiles((current) =>
                        current.filter((other) => other !== file),
                      )
                    }
                    className="grid size-11 flex-none place-items-center rounded-[8px] transition-colors duration-300 hover:bg-ink/10"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <label
            htmlFor={ids.nda}
            className="flex cursor-pointer items-center gap-3 text-[15px]"
          >
            <input
              id={ids.nda}
              type="checkbox"
              name="nda"
              className="size-5 flex-none accent-ink"
            />
            {quote.files.nda}
          </label>
        </FormSection>

        <FormSection number={3} title={quote.project.heading}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Quantity" htmlFor={ids.quantity}>
              <input
                id={ids.quantity}
                type="number"
                name="quantity"
                min={1}
                step={1}
                inputMode="numeric"
                className={control}
              />
            </Field>
            <Field label="Material" htmlFor={ids.material}>
              <Select id={ids.material} name="material">
                {quote.project.materials.map((material, index) => (
                  <option key={material} value={index === 0 ? "" : material}>
                    {material}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={quote.project.detailsLabel} htmlFor={ids.details}>
            <textarea
              id={ids.details}
              name="details"
              rows={5}
              placeholder={quote.project.detailsPlaceholder}
              className={`${controlBase} resize-y px-4 py-3 leading-snug`}
            />
          </Field>
        </FormSection>

        <FormSection number={4} title={quote.contact.heading}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={
                <>
                  Name <span className="text-muted">(Required)</span>
                </>
              }
              htmlFor={ids.name}
              error={errors.name}
              errorId={`${ids.name}-error`}
            >
              <input
                id={ids.name}
                type="text"
                name="name"
                required
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${ids.name}-error` : undefined}
                onChange={() =>
                  errors.name &&
                  setErrors((current) => ({ ...current, name: undefined }))
                }
                className={control}
              />
            </Field>
            <Field
              label={
                <>
                  Email <span className="text-muted">(Required)</span>
                </>
              }
              htmlFor={ids.email}
              error={errors.email}
              errorId={`${ids.email}-error`}
            >
              <input
                id={ids.email}
                type="email"
                name="email"
                required
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? `${ids.email}-error` : undefined
                }
                onChange={() =>
                  errors.email &&
                  setErrors((current) => ({ ...current, email: undefined }))
                }
                className={control}
              />
            </Field>
            <Field label={<>Company{optionalTag}</>} htmlFor={ids.company}>
              <input
                id={ids.company}
                type="text"
                name="company"
                autoComplete="organization"
                className={control}
              />
            </Field>
            <Field label={<>Phone{optionalTag}</>} htmlFor={ids.phone}>
              <input
                id={ids.phone}
                type="tel"
                name="phone"
                autoComplete="tel"
                className={control}
              />
            </Field>
          </div>
        </FormSection>

        <div className="flex flex-col items-start gap-5 border-t border-line pt-8">
          <button
            type="submit"
            className="group inline-flex h-12 items-center gap-2 rounded-[8px] bg-ink pr-4 pl-6 text-[15px] text-navy transition-opacity duration-300 hover:opacity-85"
          >
            {quote.submit}
            <ArrowRight
              size={18}
              strokeWidth={1.5}
              className="transition-transform duration-500 ease-brand group-hover:translate-x-1"
            />
          </button>
          <div className="flex flex-col gap-1 text-[14px] leading-snug text-ink/70">
            {quote.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
