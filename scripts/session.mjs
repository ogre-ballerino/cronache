#!/usr/bin/env node
// Runs Claude Code non-interactively on a session transcript with the
// new-session skill (.claude/skills/new-session/SKILL.md). The site is the
// one whose folder holds the transcript.
// Usage: pnpm session sites/strahd/audio/session-11.txt

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const transcriptArg = process.argv[2];
if (!transcriptArg) {
  console.error('Usage: pnpm session sites/<site>/audio/session-11.txt');
  process.exit(1);
}

const transcriptPath = path.resolve(transcriptArg);
if (!fs.existsSync(transcriptPath)) {
  console.error(`File not found: ${transcriptPath}`);
  process.exit(1);
}

const relTranscript = path.relative(process.cwd(), transcriptPath);
const site = relTranscript.match(/^sites\/([^/]+)\//)?.[1];
if (!site) {
  console.error(`The transcript must be inside a site folder (sites/<site>/…), got ${relTranscript}`);
  process.exit(1);
}
const model = process.env.CLAUDE_MODEL || 'sonnet';

const prompt = `Use the new-session skill on ${relTranscript}, for the ${site} site: it's the raw transcript of the latest game session, produced by automatic speech-to-text, so expect recognition errors and mangled names. You're running non-interactively and can't ask questions: make the most reasonable choice for anything ambiguous and flag it in the final report.`;

console.log(`Running Claude Code (model: ${model}) on ${relTranscript}...\n`);

const child = spawn(
  'claude',
  ['-p', prompt, '--allowedTools', `Skill,Read,Write,Edit,Grep,Glob,WebFetch,Bash(pnpm -C sites/${site} build)`, '--model', model],
  { stdio: 'inherit', cwd: process.cwd() }
);

child.on('error', (err) => {
  console.error('Could not start "claude". Is it installed and on your PATH?', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
