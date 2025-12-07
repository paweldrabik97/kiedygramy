import React from "react";

const SubmitButton = ({ children, onClick }) => {
  return (
    <>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={onClick}
      >
        {children}
      </button>
    </>
  );
};

export default SubmitButton;
