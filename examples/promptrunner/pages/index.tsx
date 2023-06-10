import { FC, FormEvent, useContext, useEffect, useRef } from "react";
import { useForm } from "@mantine/form";

import { Button, Textarea, Title, Loader, Table } from "@mantine/core";
import { AppContext } from "@/components/AppContext";

const Game: FC = () => {
  const { submitPrompt, promptLoading, appState, refreshAppState } =
    useContext(AppContext);

  let showPassword = false;

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
    showPassword = true;
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
      const response = await fetch("/api/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: passwordForm.values.password }),
      });

      if (response.status === 200) {
        await refreshAppState();
      }
      if (response.status === 400) {
        window.alert("Incorrect password!");
      }
    } catch (error) {
      console.error(error);
      window.alert("An error occurred submitting your password!");
    }
  };

  const leaderBoardEntry = appState.leaderboardState.entries.map(
    (element, index) => (
      <tr key={element.name}>
        <td>{index + 1}</td>
        <td>{element.name}</td>
        <td>{element.level}</td>
        <td>{element.attempts}</td>
      </tr>
    )
  );

  const leaderboard = (
    <div>
      <h3>Leaderboard</h3>
      <Table withBorder withColumnBorders className="min-w-[40em]">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Level</th>
            <th>Attempts</th>
          </tr>
        </thead>
        <tbody>{leaderBoardEntry}</tbody>
      </Table>
    </div>
  );

  // const eventLog = (
  //   <Table>
  //     <thead>
  //       <tr>
  //         <th>Event</th>
  //         <th>Timestamp</th>
  //       </tr>
  //     </thead>
  //     <tbody>{/* Fill this with event log data */}</tbody>
  //   </Table>
  // );

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

  const game = (
    <div className="w-full md:max-w-4xl text-center">
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
          : {appState.gameState.character.response}
        </span>
      </section>

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
            {showPassword ? passwordFormComponent : null}
          </div>
        </div>
      </div>

      <div
        ref={leaderboardRef}
        className="order-3 p-4 overflow-auto max-w-screen-xl mx-auto"
      >
        {leaderboard}
      </div>
      {/*<div className="order-3 p-4 bg-gray-200 overflow-auto">{eventLog}</div>*/}
    </div>
  );
};
export default Game;
