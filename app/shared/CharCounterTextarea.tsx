"use client";

import { useState, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  maxLength: number;
  defaultValue?: string;
};

export function CharCounterTextarea({ maxLength, defaultValue = "", ...rest }: Props) {
  const [count, setCount] = useState(defaultValue.length);
  return (
    <>
      <textarea
        {...rest}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={(event) => {
          setCount(event.target.value.length);
          rest.onChange?.(event);
        }}
      />
      <small aria-live="polite" className="form-note">
        {count}/{maxLength} characters
      </small>
    </>
  );
}
