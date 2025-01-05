import { useEffect } from "react";

const Alert = ({message, messageType, onClear}) => {

    // Make display messages disappear after a short delay
    useEffect(() => {
        if (message) {
          const timer = setTimeout(() => {
            if (onClear) onClear();
          }, 3000); // Clear message after 3 seconds
          return () => clearTimeout(timer);
        }
      }, [message]);
    return (
        <div>
            {message && (
            <div
                className={`mb-4 px-4 py-2 ${
                    messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                } border ${
                    messageType === "success" ? "border-green-300" : "border-red-300"
                } rounded`}
            >
                {message}
            </div>
            )}
        </div>
    );
}

export default Alert;