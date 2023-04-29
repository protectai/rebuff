// components/ProfileSettings.tsx
import { FC } from "react";
import { Text, TextInput, Button, Progress } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconRefresh } from "@tabler/icons-react";

interface ProfileSettingsProps {
  apiKey: string;
  usedCredits: number;
  totalCredits: number;
  onRefreshApiKey: () => void;
}

export const ProfileSettings: FC<ProfileSettingsProps> = ({
  apiKey,
  usedCredits,
  totalCredits,
  onRefreshApiKey,
}) => {
  const clipboard = useClipboard();

  return (
    <div>
      <Text align="left" size="lg" style={{ marginBottom: 20 }}>
        API Key
      </Text>
      <TextInput
        readOnly
        value={apiKey}
        style={{ marginBottom: 10 }}
        rightSection={
          <Button color="dark" onClick={() => clipboard.copy(apiKey)}>
            <IconCopy />
          </Button>
        }
      />
      <Button color="dark" leftIcon={<IconRefresh />} onClick={onRefreshApiKey}>
        Refresh API Key
      </Button>
      <Text size="lg" style={{ marginTop: 40, marginBottom: 10 }}>
        Credits
      </Text>
      <Text size="sm" style={{ marginBottom: 10 }}>
        {`Used $${usedCredits} out of $${totalCredits} credits`}
      </Text>
      <Progress value={(usedCredits / totalCredits) * 100} size="xl" />
    </div>
  );
};
