import { Command } from 'commander';
import * as prompts from 'prompts';

async function create(
  value: Record<string, string | number | boolean>,
  options: Command
) {
  const response = await prompts([
    {
      type: 'select',
      name: 'color',
      message: 'Choose a template',
      choices: [
        {
          title: 'Barebones',
          description: 'An empty project with an entry file.',
          value: '#00ffea',
        },
        {
          title: 'Basic',
          description: 'Basic template with a service as example.',
          value: '#00ffea',
        },
        {
          title: 'Example project',
          description:
            'A CRUD project with reflection, service clients and providers, including all core features.',
          value: '#00ffea',
        },
      ],
    },
  ]);
}

const command = new Command('create')
  .description('Create a new project')
  .argument('<string>', `project's name`)
  .option('-t, --template', 'Template name to unroll your project')
  .action(create);

export default command;
