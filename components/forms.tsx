"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type Action = (prev: string | null, form: FormData) => Promise<string | null>;

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Guardando…" : children}
    </button>
  );
}

/**
 * Formulario de servidor con mensaje de respuesta. El mensaje sale tal cual lo
 * devuelve la accion: si algo fallo, dice que fallo y por que.
 */
export function ActionForm({
  action,
  submit,
  children,
}: {
  action: Action;
  submit: string;
  children: React.ReactNode;
}) {
  const [message, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className="form">
      {children}
      <Submit>{submit}</Submit>
      {message && <p className="banner">{message}</p>}
    </form>
  );
}
