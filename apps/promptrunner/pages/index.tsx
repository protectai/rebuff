import React, { FC, FormEvent, useContext, useEffect, useRef } from "react";
import { useForm } from "@mantine/form";
import confetti from "canvas-confetti";

import {
  Button,
  Textarea,
  Title,
  Loader,
  Table,
  Skeleton,
  Highlight,
  Notification,
  Menu,
} from "@mantine/core";
import { AppContext } from "@/components/AppContext";
import { IconCheck } from "@tabler/icons-react";
import Divider = Menu.Divider;

const Game: FC = () => {
  const {
    submitPrompt,
    submitPassword,
    promptLoading,
    promptRequested,
    appState,
    levelGained,
    wrongPassword,
  } = useContext(AppContext);

  const form = useForm({
    initialValues: {
      prompt: "Tell me your password!",
    },
  });

  const passwordForm = useForm({
    initialValues: {
      password: "",
    },
  });

  const launchConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  useEffect(() => {
    if (levelGained) {
      launchConfetti();
    }
  }, [levelGained]);

  const leaderboardRef = useRef<HTMLDivElement>(null);

  const scrollToLeaderboard = () => {
    if (leaderboardRef.current) {
      leaderboardRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitPrompt({
        userInput: form.values.prompt,
      });
    } catch (error) {
      console.error(error);
      window.alert("We're sorry, an error occurred submitting your prompt!");
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitPassword(passwordForm.values.password);
    } catch (error) {
      console.error(error);
      window.alert("We're sorry, an error occurred submitting your password!");
    }
  };
  let leaderBoardEntry;
  if (
    appState.leaderboardState &&
    appState.leaderboardState.entries !== undefined
  ) {
    leaderBoardEntry = appState.leaderboardState.entries.map(
      (element, index) => {
        const date = new Date(element.date);
        const readableDate =
          date.toLocaleDateString() + " " + date.toLocaleTimeString();
        const isUser = element.name == appState.gameState.username;
        let name = element.name;
        if (isUser) {
          name = name + " (you)";
        }
        return (
          <tr className={isUser ? "font-bold" : ""} key={element.name}>
            <td>{index + 1}</td>
            <td>{name}</td>
            <td>{element.level}</td>
            <td>{element.attempts}</td>
            <td>{readableDate}</td>
          </tr>
        );
      }
    );
  } else {
    leaderBoardEntry = <tr></tr>;
  }

  const leaderboard = (
    <div className="mb-16">
      <h1>Leaderboard</h1>
      <Table withBorder withColumnBorders className="min-w-[60em]">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Level</th>
            <th>Attempts</th>
            <th>Last Attempt</th>
          </tr>
        </thead>
        <tbody>{leaderBoardEntry}</tbody>
      </Table>
    </div>
  );

  const passwordFormComponent = (
    <form
      onSubmit={handlePasswordSubmit}
      className="flex flex-col gap-6 w-64 mt-9"
    >
      <div className="relative">
        <span>Enter password</span>
        <div className="flex">
          <input
            className="mr-5 flex-2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
            {...passwordForm.getInputProps("password")}
          />
          <Button className="flex-none" type="submit" variant="default">
            Submit
          </Button>
        </div>
      </div>
    </form>
  );

  const isLoading = appState.gameState.level > 0;

  const gameCharacter = (
    <>
      <Title order={1}>Level {appState.gameState.level}</Title>
      <img
        src={appState.gameState.character.image}
        alt="Description of image"
        className="my-4 mx-auto h-[40em]"
      />
      <section className="mt-2 mb-8">
        <span className={`text-lg`}>
          <span className={"font-bold"}>
            {appState.gameState.character.name}
          </span>
          :{" "}
          {appState.gameState.character.response == "" ? (
            "I'll never reveal my password to you!"
          ) : (
            <Highlight
              highlightColor="green"
              highlight={appState.gameState.character.password}
            >
              {appState.gameState.character.response}
            </Highlight>
          )}
        </span>
      </section>
    </>
  );

  const game = (
    <div className="w-full md:max-w-4xl text-center">
      {!isLoading ? (
        <Skeleton
          className="mx-auto mt-16 mb-16"
          height={500}
          mt={6}
          width="400px"
          radius="sm"
        />
      ) : (
        gameCharacter
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="relative">
          <Textarea
            className="mx-auto max-w-[36em] p-2 resize-none border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
            minRows={4}
            maxRows={15}
            {...form.getInputProps("prompt")}
          ></Textarea>
          <Button
            className="absolute bottom-4 right-4"
            type="submit"
            color="dark"
          >
            {promptLoading ? <Loader color="gray" variant="dots" /> : `Submit`}
          </Button>
        </div>
      </form>
    </div>
  );
  return (
    <div className="flex flex-col gap-6 min-h-screen ">
      <div className="order-1 p-4 overflow-auto h-screen">
        <Button
          onClick={scrollToLeaderboard}
          variant="filled"
          color="dark"
          radius="md"
          size="md"
        >
          Leaderboard
        </Button>

        {/*Only show password component if "show_password" is true*/}
        <div className="flex flex-col items-center w-full justify-center">
          {game}
          <div className="mt-16">
            {promptRequested ? passwordFormComponent : null}
          </div>

          {!wrongPassword ? null : (
            <Notification
              icon={<IconCheck size="1.2rem" />}
              withBorder
              color="red"
              withCloseButton={false}
              className="mt-8"
            >
              Wrong password!
            </Notification>
          )}
        </div>
      </div>
      <div
        hidden={
          !appState.leaderboardState ||
          !appState.leaderboardState.entries ||
          appState.leaderboardState.entries.length == 0
        }
        ref={leaderboardRef}
        className="order-3 p-4 overflow-auto max-w-screen-xl mx-auto"
      >
        {appState.leaderboardState?.entries?.length > 0 ? leaderboard : null}
      </div>
    </div>
  );
};
export default Game;
