import { createStyles, Box, Text, Group, SimpleGrid, rem } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";

const useStyles = createStyles((theme) => ({
  stat: {
    borderBottom: `${rem(3)} solid`,
    paddingBottom: rem(5),
  },

  statCount: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1.3,
  },
}));

export function PromptInjectionStats() {
  const { classes } = useStyles();
  const { appState } = useContext(AppContext);

  const [stats, setStats] = useState([
    {
      label: "total requests",
      count: "0",
      part: null,
      textColor: "text-gray-500",
      borderColor: "border-gray-500",
    },
    {
      label: "injections detected",
      count: "0",
      part: null,
      textColor: "text-gray-500",
      borderColor: "border-gray-500",
    },
    {
      label: "learned attack signatures",
      count: "0",
      part: null,
      textColor: "text-gray-500",
      borderColor: "border-green-700",
    },
  ]);
  useEffect(
    function onChange() {
      const newStats = appState.stats;
      if (!newStats) return;
      if (typeof newStats.breaches.total === "number") {
        stats[0].count = newStats.breaches.total.toLocaleString();
      }
      if (typeof newStats.breaches.user === "number") {
        stats[1].count = newStats.breaches.user.toLocaleString();
      }
      if (typeof newStats.detections === "number") {
        stats[2].count = newStats.detections.toLocaleString();
      }
      setStats(stats);
    },
    [appState.stats]
  );
  const descriptions = stats.map((stat) => (
    <div key={stat.label} className={`${classes.stat} ${stat.borderColor}`}>
      <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>
        {stat.label}
      </Text>

      <Group position="apart" align="flex-end" spacing={0}>
        <Text fw={700}>{stat.count}</Text>
        {typeof stat.part === "number" && (
          <Text
            fw={700}
            size="sm"
            className={`${classes.statCount} ${stat.textColor}`}
          >
            {stat.part}%
          </Text>
        )}
      </Group>
    </div>
  ));

  return (
    <SimpleGrid cols={3} breakpoints={[{ maxWidth: "xs", cols: 1 }]} mt="xl">
      {descriptions}
    </SimpleGrid>
  );
}
