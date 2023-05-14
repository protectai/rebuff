import { createStyles, Box, Text, Group, SimpleGrid, rem } from "@mantine/core";

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

interface StatsSegmentsProps {
  stats: {
    label: string;
    count: string;
    part: number | null;
    textColor: string;
    borderColor: string;
  }[];
}

export function PromptInjectionStats({ stats }: StatsSegmentsProps) {
  const { classes } = useStyles();

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
