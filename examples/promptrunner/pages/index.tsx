import { FC, FormEvent, useContext } from "react";
import { useForm } from "@mantine/form";

import { Button, Textarea, Title, Loader } from "@mantine/core";
import { AppContext } from "@/components/AppContext";
import { formatSQL } from "@/lib/general-helpers";

const Game: FC = () => {
  const { submitPrompt, attempts, promptLoading, appState, refreshApikey } =
    useContext(AppContext);

  const form = useForm({
    initialValues: {
      prompt: "How many customers do we have?",
      heuristic: true,
      llm: true,
      vectordb: true,
    },
  });
  const strategyType = () => {
    const speed =
      form.values.heuristic && !form.values.llm && !form.values.vectordb
        ? "fastest"
        : !form.values.llm && form.values.vectordb
        ? "fast"
        : "slow";
    const safety =
      form.values.heuristic && form.values.vectordb && form.values.llm
        ? "safest"
        : !form.values.llm && !form.values.vectordb
        ? "unsafe"
        : "safe";
    return `${speed}, ${safety}`;
  };
  const lastAttempt = Array.isArray(attempts) && attempts[0];
  const output = () => {
    if (promptLoading) {
      return "Loading...";
    }
    if (lastAttempt) {
      return lastAttempt.is_injection
        ? "prompt injection detected"
        : lastAttempt.output
        ? formatSQL(lastAttempt.output)
        : "An error occurred.";
    }
    return formatSQL(`SELECT COUNT(*) FROM customers`);
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitPrompt({
        userInput: form.values.prompt,
        runHeuristicCheck: form.values.heuristic,
        runVectorCheck: form.values.vectordb,
        runLanguageModelCheck: form.values.llm,
      });
    } catch (error) {
      console.error(error);
      window.alert(
        "We're sorry, an error occurred submitting your prompt. Please try again later."
      );
    }
  };

  return (
    <div className="flex flex-col items-center w-full justify-center">
      <div className="w-full md:max-w-4xl">
        {/* Add your image here */}
        <img
          src="https://cdn.discordapp.com/attachments/1099199712344686595/1116590688893673582/willem_steelpunk_character_full_body_white_background_6efdb26e-ead0-484c-9c2a-5970577c472a.png"
          alt="Description of image"
          className="my-4"
        />
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <Title order={4} className="py-4">
              User Input
            </Title>
            <Textarea
              className="w-full p-2 resize-none border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
              minRows={10}
              maxRows={15}
              {...form.getInputProps("prompt")}
            ></Textarea>
            <Button
              className="absolute bottom-4 right-4"
              type="submit"
              color="dark"
            >
              {promptLoading ? (
                <Loader color="gray" variant="dots" />
              ) : (
                `Submit`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Game;
