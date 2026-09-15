import "../../styles/loadingSubmitButton.css";

function LoadingSubmitButton({
  loading,
  disabled,
  children,
  loadingText,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${className} ${loading ? "loading" : ""}`}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          {loadingText}...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default LoadingSubmitButton;
