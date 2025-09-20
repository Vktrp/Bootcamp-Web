import { useNavigate } from "react-router-dom";

type Props = {
  className?: string;

  label?: string;
};

export default function BackButton({
  className = "",
  label = "Retour",
}: Props) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`btn-outline flex items-center gap-2 ${className}`}
      aria-label="Retour"
      type="button"
    >
      <span aria-hidden>↩︎</span>

      {label}
    </button>
  );
}
