type inputProps = {
  id?: string;
  type: "email" | "text" | "password" | "name";
  name: string;
  placeholder: string;
  autocomplete: "" | "given-name" | "family-name" | "email" | "new-password";
  required: boolean;
  pattern?: string;
  minLength?: number;
};
type props = inputProps & {
  label: string;
};

export default function Input({
  id = "",
  type = "text",
  name = "",
  label = "",
  placeholder = "",
  autocomplete = "",
  required = false,
  pattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.* ).{8,}$",
  minLength = 8,
}: props) {
  var inputId = id || `${name}-input`;
  var props: inputProps = {
    id: inputId,
    type,
    name,
    placeholder,
    autocomplete,
    required,
  };
  if (type === "password") {
    props.pattern = pattern;
    props.minLength = minLength;
  }
  return (
    <>
      <label for={inputId}>{label}</label>
      <input class="standard-input" {...props} />
    </>
  );
}
