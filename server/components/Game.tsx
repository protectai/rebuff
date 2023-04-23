import { useState, useEffect } from "react";
import { supabase } from "lib/supabase";
import { Session } from "@supabase/auth-helpers-react";
import EndGame from "@/components/EndGame";
type Message = {
  text: string;
  sender: "user" | "server";
};

const ChatBox = ({ session }: { session: Session }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [userSecret, setUserSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [border, setBorder] = useState("grey");
  const [attempts, setAttempts] = useState(0);
  const [level, setLevel] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleFormSubmit();
  };
  const handleFormSubmit = async () => {
    // Send input text to server for processing
    setLoading(true);
    const response = await fetch("/api/reverse-text", {
      method: "POST",
      body: JSON.stringify({ text: inputText }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw Error();
        }
        return res.json();
      })
      .then((res) => handleResponse(res))
      .catch((error) => handleError())
      .finally(() => setLoading(false));
  };

  const handleResponse = (response: any) => {
    const reversedText = response.output;
    // Add user message to chat box
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputText, sender: "user" },
    ]);

    // Add server message to chat box
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: reversedText, sender: "server" },
    ]);

    if (response.success) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "you got me! proceeding to the next stage...",
          sender: "server",
        },
      ]);
    }

    updateScoreUI();
    // Clear input field
    setInputText("");
    setBorder("grey");
    setUserSecret(response.secret);
  };

  const handleError = () => {
    setBorder("red");
  };

  const updateScoreUI = async () => {
    const { data, error } = await supabase
      .from("games")
      .select("level, attempts")
      .eq("user_id", session.user.id);
    if (error) {
      console.log(error);
    } else {
      if (data.length != 0) {
        setLevel(data[0].level);
        setAttempts(data[0].attempts);
      }
    }
  };

  useEffect(() => {
    // Update the document title using the browser API
    updateScoreUI();
  });
  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.altKey) {
      event.preventDefault();
      handleFormSubmit();
    }
  };
  return (
    <div className="bg-white flex flex-col flex-1 rounded-lg w-full pt-5 pb-2">
      <div className="flex flex-row justify-between pb-2">
        <div className="">
          <span className="font-sans text-xl pr-2">Attempts:</span>
          <span className="font-sans text-xl">{attempts}</span>
        </div>
        <div className="">
          <span className="font-sans text-xl pr-2">Level:</span>
          <span className="font-sans text-xl">{level}</span>
        </div>
      </div>
      <h3 className="font-sans text-xl pr-2 font-bold">
        {userSecret
          ? `The secret code the model is hiding from you is '${userSecret}'`
          : `Try prompting the model`}
      </h3>
      {attempts > 20 || level > 3 ? (
        <EndGame
          Won={level > 3 && attempts <= 20}
          Attempts={attempts}
          Level={level}
        />
      ) : (
        <div className="h-full flex flex-col border">
          <div className="flex-grow h-full max-h-screen overflow-y-auto p-5">
            <ul className="space-y-2">
              {messages.map((message, index) => (
                <li
                  key={index}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-xl px-4 py-2 rounded shadow ${
                      message.sender === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="block">{message.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={handleSubmit} className="flex h-24">
            <div className="flex flex-row h-24 w-full border rounded-lg focus:outline-none focus:border-blue-500">
              <textarea
                value={inputText}
                className={`block w-full p-2 text-gray-700 resize-none h-24 overflow-y-auto ${
                  loading ? "cursor-not-allowed" : ""
                }`}
                disabled={loading}
                placeholder="Type your message here..."
                rows={1}
                onKeyDown={handleTextareaKeyDown}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>
              <button
                type="submit"
                className={`bg-black hover:bg-gray-900 text-white font-bold py-2 px-4 ${
                  loading ? "cursor-wait" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm12 0a8 8 0 100-16 8 8 0 000 16zM2.05 15.458A9.966 9.966 0 004 20h4a7.96 7.96 0 01-2.97-2.97l-2.98-2.573zM20 12a8 8 0 01-8 8v-4a4 4 0 004.783-3.783L20 12z"
                    ></path>
                  </svg>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
