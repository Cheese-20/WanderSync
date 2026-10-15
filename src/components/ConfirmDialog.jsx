import React, { useEffect, useRef } from 'react';
import logo from '../assets/images/logo.png';
import './ConfirmDialog.css';

/**
 * In-app replacement for window.confirm, styled like the system's other popups
 * (WanderSync logo, title, message, Cancel + confirm buttons).
 *
 * Props:
 * - open:         show/hide the dialog
 * - title:        heading text
 * - message:      body text (string or JSX)
 * - confirmLabel: text on the confirm button (default "Yes, continue")
 * - cancelLabel:  text on the cancel button (default "Cancel")
 * - onConfirm:    called when the user confirms
 * - onCancel:     called on Cancel, Escape, or clicking the backdrop
 * - isBusy:       disables both buttons while the action runs
 * - busyLabel:    confirm button text while busy (default "Please wait...")
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Yes, continue',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isBusy = false,
  busyLabel = 'Please wait...'
}) {
  const cancelBtnRef = useRef(null);

  // Focus the safe option first and let Escape dismiss, like a native confirm.
  useEffect(() => {
    if (!open) return undefined;
    cancelBtnRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !isBusy) onCancel?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, isBusy, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={() => !isBusy && onCancel?.()}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The WanderSync logo is the dialog's only icon. */}
        <img src={logo} alt="WanderSync" className="confirm-dialog-logo" />

        <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
        <p id="confirm-dialog-message" className="confirm-dialog-message">{message}</p>

        <div className="confirm-dialog-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn-cancel"
            onClick={onCancel}
            disabled={isBusy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn-danger"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
