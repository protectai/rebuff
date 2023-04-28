import React from "react";
import { Text, Button, Grid } from "@mantine/core";
import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";

const Navbar: React.FC = () => {
  return (
    <nav>
      <Grid>
        <Grid.Col span={2}></Grid.Col>
        <Grid.Col span="auto"></Grid.Col>
        <Grid.Col span={2}>
          <Button color="blue">Login</Button>
          <a href="https://github.com/woop" target="_blank">
            <IconBrandGithub />
          </a>
          <a href="https://twitter.com" target="_blank">
            <IconBrandTwitter />
          </a>
        </Grid.Col>
      </Grid>
    </nav>
  );
};

export default Navbar;
