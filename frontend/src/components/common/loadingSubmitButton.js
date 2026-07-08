import "../../styles/loadingSubmitButton.css";

function LoadingSubmitButton({loading, disabled, children, loadingText, classname ="", ...props}){
    return(
        <button
            {...props}
            disabled={disabled || loading}
            className={`${classname} ${loading?"loading":""}`}
        >
            {loading?(
                <>
                    <span className="spinner"></span>
                    {loadingText}...
                </>
            ):(children)}
            
        </button>
    )
}

export default LoadingSubmitButton;