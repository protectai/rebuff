import { Title } from "@mantine/core";
import { FC, ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section: FC<SectionProps> = ({ title, children }) => {
  return (
    <div className="py-4">
      <Title order={4}>{title}</Title>
      {children}
    </div>
  );
};

export default Section;
