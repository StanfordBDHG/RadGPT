#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

# Define project directories
VITE_DIR=./web
FIREBASE_DIR=./firebase
FUNCTIONS_DIR=./radgraph_function

# Define log files
VITE_LOG=web.log
FIREBASE_LOG=firebase.log
FUNCTIONS_LOG=radgraph_function.log

.PHONY: install run stop clean

install:
	@echo "Installing dependencies..."

	@echo "Please ensure that Python 3.10 is installed"
	python3.10 --version

	@echo "Installing web dependencies"
	@cd $(VITE_DIR) && npm install
	@if ! [[ -f $(VITE_DIR)/.env ]]; then cp $(VITE_DIR)/.env.example $(VITE_DIR)/.env; fi
	@echo "Web dependencies installed successfully!"

	@tput setaf 3; echo "Installing Firebase dependencies"; tput sgr0
	@curl -sl https://firebase.tools | bash
	@if ! [[ -d firebase/functions/venv ]]; then python3.10 -m venv firebase/functions/venv; fi
	@cd $(FIREBASE_DIR)/functions && source venv/bin/activate && python3.10 -m pip install -r requirements.txt
	@if ! [[ -f $(FIREBASE_DIR)/functions/.secret.local ]]; then cp $(FIREBASE_DIR)/functions/.secret.local.example $(FIREBASE_DIR)/functions/.secret.local; fi
	@tput setaf 2; echo "\n\nFirebase dependencies installed successfully!"; tput sgr0
	@tput setaf 3; echo "If you haven't done so already please login by running 'firebase login'\n\n"; tput sgr0

	@echo "Installing Google Cloud Function dependencies"
	@if ! [[ -d radgraph_function/venv ]]; then python3.10 -m venv radgraph_function/venv; fi
	@if [ "$$(uname -s)" = "Darwin" ]; then \
			echo "MacOS detected. Changing requirements.txt to match MacOS"; \
			bash -c "cd $(FUNCTIONS_DIR) && source venv/bin/activate && python3.10 -m pip install -r <(sed -E 's/^(torch==[^+]+)\+cpu$$/\1/' requirements.txt)"; \
		else \
			cd $(FUNCTIONS_DIR) && source venv/bin/activate && python3.10 -m pip install -r requirements.txt; \
		fi
	@tput setaf 2; echo "Google Cloud Function dependencies installed successfully!"; tput sgr0

	@tput setaf 2; echo "All dependencies installed successfully!"; tput sgr0

run: stop
	@echo "Starting services..."
	@echo "Logs are in the respective *.log-files."

	@nohup bash -c "cd $(VITE_DIR) && npm run dev" > $(VITE_LOG) 2>&1 &
	@nohup bash -c "cd $(FIREBASE_DIR) && firebase emulators:start --project demo-radgpt" > $(FIREBASE_LOG) 2>&1 &
	@nohup bash -c "cd $(FUNCTIONS_DIR) && source venv/bin/activate && functions-framework --target=get_radgraph --port=5002 --debug" > $(FUNCTIONS_LOG) 2>&1 &

	@echo "Waiting for Web to be up..."
	@while true; do \
		http_status=$$(curl -L -s -o /dev/null -w "%{http_code}" http://localhost:5173); \
		if [ "$$http_status" = "200" ]; then break; fi; \
		sleep 2; \
	done
	
	@echo "Waiting for Firebase Emulator to be up..."
	@while true; do \
		http_status=$$(curl -L -s -o /dev/null -w "%{http_code}" http://localhost:8080); \
		if [ "$$http_status" = "200" ]; then break; fi; \
		sleep 2; \
	done

	@echo "Waiting for Google Cloud Function Emulator to be up..."
	@while true; do \
		http_status=$$(curl -L -s -o /dev/null -w "%{http_code}" http://localhost:5002); \
		if [ "$$http_status" = "400" ]; then break; fi; \
		sleep 2; \
	done

	@tput setaf 2; echo "\n\nAll services started successfully!"; tput sgr0
	@tput setaf 2; echo "You can open the app by going to http://localhost:5173 in your browser."; tput sgr0

stop:
	@echo "Stopping all services..."

	@echo "Killing process running on Vite port"
	@lsof -t -i:5173 | xargs kill -2

	@echo "Killing all proccesses running of Firebase ports"
	@lsof -t -i:5001 -i:8080 -i:9000 -i:9099 -i:9199 -i:9090 | xargs kill -2

	@echo "Killing all proccesses running of Google Cloud Function port"
	@lsof -t -i:5002 | xargs kill -2

	@echo "All services stopped."

clean: stop
	@rm -rf firebase/functions/venv
	@rm -rf firebase/functions/__pycache__
	@rm firebase/functions/.secret.local

	@rm -rf radgraph_function/venv
	@rm -rf radgraph_function/__pycache__
	@rm -rf radgraph_function/models*
	@rm -rf radgraph_function/.locks
	@rm -rf radgraph_function/radgraph-xl

	@rm -rf web/node_modules
	@rm web/.env

	@rm firebase.log radgraph_function.log web.log
	
	@echo "Cleanup complete!"
