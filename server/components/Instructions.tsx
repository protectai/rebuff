import { useState } from "react";

const Instructions = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClick = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <div
      className={`border bg-gray-100 shadow rounded-lg p-2 cursor-pointer ${
        isOpen ? "h-auto" : "h-12 overflow-hidden"
      } transition-height duration-500 ease-in-out`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg
            fill="#000000"
            height="24px"
            width="24px"
            viewBox="0 0 30 30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M14.768,0C6.611,0,0,6.609,0,14.768c0,8.155,6.611,14.767,14.768,14.767s14.768-6.612,14.768-14.767
		C29.535,6.609,22.924,0,14.768,0z M14.768,27.126c-6.828,0-12.361-5.532-12.361-12.359c0-6.828,5.533-12.362,12.361-12.362
		c6.826,0,12.359,5.535,12.359,12.362C27.127,21.594,21.594,27.126,14.768,27.126z"
              />
              <path
                d="M14.385,19.337c-1.338,0-2.289,0.951-2.289,2.34c0,1.336,0.926,2.339,2.289,2.339c1.414,0,2.314-1.003,2.314-2.339
		C16.672,20.288,15.771,19.337,14.385,19.337z"
              />
              <path
                d="M14.742,6.092c-1.824,0-3.34,0.513-4.293,1.053l0.875,2.804c0.668-0.462,1.697-0.772,2.545-0.772
		c1.285,0.027,1.879,0.644,1.879,1.543c0,0.85-0.67,1.697-1.494,2.701c-1.156,1.364-1.594,2.701-1.516,4.012l0.025,0.669h3.42
		v-0.463c-0.025-1.158,0.387-2.162,1.311-3.215c0.979-1.08,2.211-2.366,2.211-4.321C19.705,7.968,18.139,6.092,14.742,6.092z"
              />
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
            </g>
          </svg>

          <h3 className="text-lg font-medium pl-2">How to play</h3>
        </div>
        <svg
          className={`h-8 w-8 transition-transform transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6.293 7.293a1 1 0 0 1 1.414 0L10 9.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {isOpen && (
        <ul className="list-disc list-inside mt-2">
          <li>
            🧙 Prompt Injection Game (PIG) is a game where you need to trick a
            string reversal system into revealing a secret code
          </li>
          <li>
            🔮 Your objective is to prompt the system in such a way that the
            system reveals a secret code in the form of a 10 character hash.
          </li>
          <li>You get 20 total attempts to pass 3 levels.</li>
          <li>
            🥳 If you succeed in your attempt, the model will respond with a
            secret code.
          </li>
          <li>
            🤦 The model will reject your attempt by either giving you a 'fake'
            code or reversing your input string
          </li>
          <li>
            💥 The model learns from successful breaches making the game harder
            and harder to beat at higher level.
          </li>
          <li>Good luck!</li>
        </ul>
      )}
    </div>
  );
};

export default Instructions;
