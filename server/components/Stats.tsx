import { FC } from "react";
import { Card, Progress, Space, Text, Title } from "@mantine/core";
interface StatsProps {
  breaches: number;
  attempts: number;
}
const Stats: FC<StatsProps> = ({ breaches, attempts }) => {
  const value = attempts === 0 ? 0 : (breaches * 100) / attempts;
  return (
    <div>
      <Title order={4}>Stats</Title>
      <Space h="sm" />
      <Text fz="sm" fw={500}>
        Last 24 hours ({`${breaches} out of ${attempts}`})
      </Text>
      <Progress value={value} mt="md" size="lg" radius="xl" />
      <Space h="md" />
      <Text fz="sm" fw={500}>
        Last 7 days ({`${breaches} out of ${attempts}`})
      </Text>
      <Progress value={value} mt="md" size="lg" radius="xl" />
      <Space h="md" />
      <Text fz="sm" fw={500}>
        All time ({`${breaches} out of ${attempts}`})
      </Text>
      <Progress value={value} mt="md" size="lg" radius="xl" />
    </div>
  );
};

export default Stats;
