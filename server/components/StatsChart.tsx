import { FC } from "react";
import { Progress, Space, Text, Title, Loader } from "@mantine/core";
import { Stats, stat } from "@/interfaces/ui";

const StatsCharts: FC<Stats> = ({ last24h, last7d, alltime, loading }) => {
  const value = (s: stat) =>
    s.attempts === 0 ? 0 : (s.breaches * 100) / s.attempts;
  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        last24h &&
        last7d &&
        alltime && (
          <div>
            <Title order={4}>Stats</Title>
            <Space h="sm" />
            <Text fz="sm" fw={500}>
              Last 24 hours ({`${last24h.breaches} out of ${last24h.attempts}`})
            </Text>
            <Progress value={value(last24h)} mt="md" size="lg" radius="xl" />
            <Space h="md" />
            <Text fz="sm" fw={500}>
              Last 7 days ({`${last7d.breaches} out of ${last7d.attempts}`})
            </Text>
            <Progress value={value(last7d)} mt="md" size="lg" radius="xl" />
            <Space h="md" />
            <Text fz="sm" fw={500}>
              All time ({`${alltime.breaches} out of ${alltime.attempts}`})
            </Text>
            <Progress value={value(alltime)} mt="md" size="lg" radius="xl" />
          </div>
        )
      )}
    </div>
  );
};

export default StatsCharts;
