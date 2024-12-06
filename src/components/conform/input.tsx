import { FieldMetadata, getInputProps } from "@conform-to/react";
import { Input } from "@/components/ui/input";
import { ComponentProps } from "react";

export const InputConform = ({
  meta,
  type,
  ...props
}: {
  meta: FieldMetadata<string>;
  type: Parameters<typeof getInputProps>[1]["type"];
} & ComponentProps<typeof Input>) => {
  const inputProps = getInputProps(meta, { type, ariaAttributes: true });
  const { key, ...restInputProps } = inputProps; // Pisahkan key dari properti lainnya

  return (
    <Input
      key={key} // Tetapkan key langsung ke elemen JSX
      {...restInputProps} // Sebarkan properti lain
      {...props} // Tambahkan properti tambahan dari pengguna komponen
    />
  );
};
