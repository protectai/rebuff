// components/ApiKeyDisplay.tsx
import { Text } from "@mantine/core";
import { IconEye, IconRefresh, IconX } from "@tabler/icons-react";
import React, { useState, FC } from "react";

interface ApikeyDisplayProps {
  apiKey: string;
  onRefresh: () => void;
}

const ApikeyDisplay: FC<ApikeyDisplayProps> = ({ apiKey, onRefresh }) => {
  const [copyMessage, setCopyMessage] = useState("");
  const [show, setShow] = useState(false);

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(apiKey).then(
        () => {
          setCopyMessage("Copied!");
          setTimeout(() => setCopyMessage(""), 2000);
        },
        () => {
          setCopyMessage("Failed to copy!");
          setTimeout(() => setCopyMessage(""), 2000);
        }
      );
    } else {
      setCopyMessage("Clipboard not supported!");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  return (
    <div className="flex items-center hover:bg-gray-100 cursor-pointer">
      <div className="flex flex-row items-center" onClick={copyToClipboard}>
        <Text className="text-md break-all">
          {`Apikey: ${
            copyMessage ? copyMessage : show ? apiKey : "************"
          }`}
        </Text>
      </div>
      <button
        onClick={() => setShow(!show)}
        title={show ? "Hide API key" : "Show API key"}
        className="text-black text-md text-center inline-flex items-center bg-transparent border-none cursor-pointer"
      >
        {show ? <IconX /> : <IconEye />}
      </button>
      <button
        onClick={onRefresh}
        title="Refresh API key"
        className="text-black text-md text-center inline-flex items-center bg-transparent border-none cursor-pointer"
      >
        <IconRefresh />
      </button>
    </div>
  );
};

export default ApikeyDisplay;
