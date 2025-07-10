export function FormErrorList({ errors }: { errors?: Array<string> | undefined }) {
  return errors?.length ? (
    <ul className="flex flex-col gap-1">
      {errors.map((error, i) => (
        <li key={i} className="text-sm text-red-600">
          {error}
        </li>
      ))}
    </ul>
  ) : null;
}
