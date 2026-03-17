import { createSignal, Show, type Component } from "solid-js";
import "@/styles/component/input.scss";

const URL_REGEX = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d+)?(\/.*)?$/i;

const Input: Component<{
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  validateUrl?: boolean;
}> = (props) => {
  const [error, setError] = createSignal<string | null>(null);

  const handleInput = (value: string) => {
    if (props.validateUrl && value) {
      const isValid = URL_REGEX.test(value);
      setError(isValid ? null : "Invalid URL");

      if (isValid) {
        props.onChange(value);
      }
    } else {
      setError(null);
      props.onChange(value);
    }
  };

  return (
    <div class="l-input-container">
      <input
        type="text"
        classList={{ error: !!error() }}
        value={props.value || ""}
        onInput={(e) => handleInput(e.currentTarget.value)}
        placeholder={props.placeholder}
      />
      <Show when={error()}>
        <span class="error-text">{error()}</span>
      </Show>
    </div>
  );
};

export default Input;
