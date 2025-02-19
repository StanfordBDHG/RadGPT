<!--

This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project

SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)

SPDX-License-Identifier: MIT

-->
# RadGPT

## Getting Started
All should be executed from the RadGPT directory


### Installs
#### General CLI Install

https://firebase.google.com/docs/cli

```
npm install -g firebase-tools 
```

#### Install Firebase Dependencies
```
cd firebase/functions
python3.10 -m venv venv
source venv/bin/activate
python3.10 -m pip install -r requirements.txt
```

#### Install Web Dependencies
```
cd web
npm install
```

### Specify Application Environment Variables
```
cp web/.env.example web/.env
cp firebase/functions/.secret.local.example firebase/functions/.secret.local
```

https://platform.openai.com/api-keys

https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key

Please also add your OpenAI API key to `firebase/.secret.local`

### Running the Application Locally
Both `web` and `firebase` have to be executed in separate terminals.

#### Start Firebase Emulator

```
cd firebase
firebase emulators:start --project demo-radgpt
```

#### Start Web Application
```
cd web
npm run dev
```

#### Access in Browser
Open http://localhost:5173/ in a browser