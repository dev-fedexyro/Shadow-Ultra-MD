import cfonts from 'cfonts'
import chalk from 'chalk'
import fs, { existsSync, mkdirSync } from 'fs'
import { protoType, serialize } from './lib/simple.js'
import './index.js

let { say } = cfonts
console.log(chalk.magentaBright('\n🦧 Iniciando...\n'));

say('Shadow - Bot', {
  font: 'block',
  align: 'center',
  gradient: ['white', 'grey'],
  transition: true
});

say('Made by fede Uchiha', {
  font: 'console',
  align: 'center',
  colors: ['cyan', 'magenta', 'yellow']
});

protoType();
serialize();

if (!existsSync("./tmp")) {
  mkdirSync("./tmp");
    }
