type LetterAProps = { size?: string | number };

const LetterA = ({ size }: LetterAProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 750 900"
      height={size ?? 24}
      width={size ?? 24}
      fill="currentColor"
      aria-hidden="true"
      class="lucide lucide-icon"
    >
      <path d="m529.42,632.32H214.71l-81.89,163.5H13.31L377.06,80.35l350.9,715.47h-121.41l-77.13-163.5Zm-45.23-95.48l-109.03-228.9-114.27,228.9h223.3Z" />
    </svg>
  );
};

export default LetterA;
